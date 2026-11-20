package ma.pfa.delivery;

import com.jayway.jsonpath.JsonPath;
import ma.pfa.delivery.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests d'intégration de l'API : l'application complète démarre sur une base H2 en mémoire
 * et chaque test appelle les routes HTTP comme le ferait le frontend Angular.
 * {@code @Transactional} annule les modifications après chaque test (tests indépendants).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ApiIntegrationTests {

    @Autowired
    MockMvc mvc;

    @Autowired
    ProductRepository productRepository;

    private static String order(String phone, int quantity) {
        return """
                {"firstName":"Sara","lastName":"Test","phone":"%s","email":"sara@example.com",
                 "address":"12 rue des Tests","city":"Fès","postalCode":"30000",
                 "shipmentTypeCode":"S-001","items":[{"productId":1,"quantity":%d},{"productId":2,"quantity":1}]}
                """.formatted(phone, quantity);
    }

    private String createOrder() throws Exception {
        String body = mvc.perform(post("/api/shipments").contentType(MediaType.APPLICATION_JSON).content(order("0612345678", 2)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.code");
    }

    private String adminToken() throws Exception {
        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"test-password\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.token");
    }

    @Test
    void catalogueEstPublic() throws Exception {
        mvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(10)))
                .andExpect(jsonPath("$[0].imageUrl").value("assets/adidas.jpg"));
        mvc.perform(get("/api/shipment-types")).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(3)));
        mvc.perform(get("/api/categories")).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(3)));
    }

    @Test
    void creationCommandeCalculeLesTotauxCoteServeurEtDecrementeLeStock() throws Exception {
        int stockAvant = productRepository.findById(1L).orElseThrow().getStock();

        mvc.perform(post("/api/shipments").contentType(MediaType.APPLICATION_JSON).content(order("0612345678", 2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(matchesPattern("CMD-\\d{8}-[A-Z2-9]{6}")))
                .andExpect(jsonPath("$.status").value("PROCESSED"))
                // 2 x 249 (T-shirt) + 1 x 690 (Polo) = 1188 ; livraison express = 50
                .andExpect(jsonPath("$.payment.productsTotal").value(1188))
                .andExpect(jsonPath("$.payment.shipmentPrice").value(50))
                .andExpect(jsonPath("$.payment.total").value(1238));

        assertThat(productRepository.findById(1L).orElseThrow().getStock()).isEqualTo(stockAvant - 2);
    }

    @Test
    void commandeRefuseeSiStockInsuffisant() throws Exception {
        mvc.perform(post("/api/shipments").contentType(MediaType.APPLICATION_JSON).content(order("0612345678", 99)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(matchesPattern("Stock insuffisant.*")));
    }

    @Test
    void commandeRefuseeSiDonneesInvalides() throws Exception {
        mvc.perform(post("/api/shipments").contentType(MediaType.APPLICATION_JSON).content(order("12345", 1)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.phone").exists());
    }

    @Test
    void suiviExigeLeBonEmailEtNeRevelePasLesDonneesPersonnelles() throws Exception {
        String code = createOrder();

        mvc.perform(get("/api/shipments/track").param("code", code).param("email", "SARA@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PROCESSED"))
                .andExpect(jsonPath("$.itemCount").value(3))
                .andExpect(jsonPath("$.phone").doesNotExist())
                .andExpect(jsonPath("$.email").doesNotExist());

        mvc.perform(get("/api/shipments/track").param("code", code).param("email", "autre@example.com"))
                .andExpect(status().isNotFound());
    }

    @Test
    void routesAdminProtegees() throws Exception {
        mvc.perform(get("/api/admin/shipments")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/stats").header("Authorization", "Bearer jeton-invalide"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"mauvais\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminPeutListerEtChangerLeStatut() throws Exception {
        String code = createOrder();
        String token = adminToken();

        mvc.perform(get("/api/admin/shipments").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value(code))
                .andExpect(jsonPath("$[0].phone").value("0612345678"));

        mvc.perform(patch("/api/admin/shipments/{code}/status", code).header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"SHIPPED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SHIPPED"));

        mvc.perform(get("/api/admin/stats").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalOrders").value(1))
                .andExpect(jsonPath("$.ordersByStatus.SHIPPED").value(1))
                .andExpect(jsonPath("$.totalRevenue").value(1238));
    }
}
