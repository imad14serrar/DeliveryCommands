package ma.pfa.delivery.config;

import ma.pfa.delivery.dto.CreateShipmentRequest;
import ma.pfa.delivery.dto.CreateShipmentRequest.Line;
import ma.pfa.delivery.entity.Category;
import ma.pfa.delivery.entity.Product;
import ma.pfa.delivery.entity.ShipmentStatus;
import ma.pfa.delivery.entity.ShipmentType;
import ma.pfa.delivery.repository.CategoryRepository;
import ma.pfa.delivery.repository.ProductRepository;
import ma.pfa.delivery.repository.ShipmentRepository;
import ma.pfa.delivery.repository.ShipmentTypeRepository;
import ma.pfa.delivery.service.ShipmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Remplit la base au premier démarrage (base vide) avec le catalogue de démonstration
 * et, si app.seed.demo-orders=true, quelques commandes fictives pour l'espace admin.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ShipmentTypeRepository shipmentTypeRepository;
    private final ShipmentRepository shipmentRepository;
    private final ShipmentService shipmentService;
    private final boolean seedDemoOrders;

    public DataSeeder(CategoryRepository categoryRepository, ProductRepository productRepository,
                      ShipmentTypeRepository shipmentTypeRepository, ShipmentRepository shipmentRepository,
                      ShipmentService shipmentService,
                      @Value("${app.seed.demo-orders:false}") boolean seedDemoOrders) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.shipmentTypeRepository = shipmentTypeRepository;
        this.shipmentRepository = shipmentRepository;
        this.shipmentService = shipmentService;
        this.seedDemoOrders = seedDemoOrders;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            return; // base déjà initialisée
        }
        log.info("Base vide : insertion des données de démonstration.");

        Category clothing = categoryRepository.save(new Category("1", "Vêtements & chaussures"));
        Category hiTech = categoryRepository.save(new Category("2", "TV & hi-tech"));
        Category phones = categoryRepository.save(new Category("3", "Téléphones & tablettes"));

        productRepository.saveAll(List.of(
                product("P-001", "T-shirt Adidas", 30, "249", "assets/adidas.jpg", clothing),
                product("P-002", "Polo Lacoste", 10, "690", "assets/lacoste.jpg", clothing),
                product("P-003", "Pantalon Nike rouge", 10, "399", "assets/nike.jpg", clothing),
                product("P-004", "Samsung Galaxy S21", 10, "6999", "assets/S21.jpg", phones),
                product("P-005", "TV LG OLED 55 pouces", 10, "12990", "assets/TV.png", hiTech),
                product("P-006", "Baskets Nike Air Max", 20, "1490", "assets/airMax.jpg", clothing),
                product("P-007", "Chaussures Adidas Superstar", 15, "990", "assets/superStar.jpg", clothing),
                product("P-008", "Jean Levi's", 30, "590", "assets/levis.jpg", clothing),
                product("P-009", "Apple iPhone 12 Pro", 10, "8999", "assets/iphone12.jpg", phones),
                product("P-010", "TV Samsung 4K Smart", 5, "4990", "assets/4K.jpg", hiTech)));

        shipmentTypeRepository.saveAll(List.of(
                new ShipmentType("S-001", "Livraison express", "3 à 4 jours ouvrés", new BigDecimal("50")),
                new ShipmentType("S-002", "Envoi par la poste", "20 à 30 jours", new BigDecimal("20")),
                new ShipmentType("S-003", "Retrait en boutique", "À récupérer dans notre magasin", BigDecimal.ZERO)));

        if (seedDemoOrders) {
            seedOrders();
        }
    }

    private void seedOrders() {
        String a = demoOrder("Client", "Démo A", "Marrakech", "S-001", List.of(new Line(1L, 2), new Line(8L, 1)));
        String b = demoOrder("Client", "Démo B", "Casablanca", "S-002", List.of(new Line(4L, 1)));
        demoOrder("Client", "Démo C", "Rabat", "S-003", List.of(new Line(6L, 1), new Line(7L, 1)));
        shipmentService.updateStatus(a, ShipmentStatus.ON_THE_WAY);
        shipmentService.updateStatus(b, ShipmentStatus.DELIVERED);
        log.info("{} commandes de démonstration créées.", shipmentRepository.count());
    }

    private String demoOrder(String firstName, String lastName, String city, String type, List<Line> lines) {
        String email = "demo." + lastName.substring(lastName.length() - 1).toLowerCase() + "@example.com";
        return shipmentService.create(new CreateShipmentRequest(firstName, lastName, "0600000000", email,
                "1 avenue de démonstration", city, "40000", type, lines)).code();
    }

    private static Product product(String code, String name, int stock, String price, String image, Category category) {
        return new Product(code, name, stock, new BigDecimal(price), image, category);
    }
}
