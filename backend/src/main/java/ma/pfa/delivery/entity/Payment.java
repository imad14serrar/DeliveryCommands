package ma.pfa.delivery.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.math.BigDecimal;

/**
 * Récapitulatif financier d'une commande, calculé par le serveur.
 * Le paiement est simulé : aucune donnée bancaire n'est reçue ni stockée.
 */
@Embeddable
public class Payment {

    @Column(nullable = false)
    private String method;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal productsTotal;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal shipmentPrice;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    protected Payment() {
        // requis par JPA
    }

    public Payment(String method, BigDecimal productsTotal, BigDecimal shipmentPrice, BigDecimal discountValue) {
        this.method = method;
        this.productsTotal = productsTotal;
        this.shipmentPrice = shipmentPrice;
        this.discountValue = discountValue;
        this.total = productsTotal.add(shipmentPrice).subtract(discountValue);
    }

    public String getMethod() { return method; }
    public BigDecimal getProductsTotal() { return productsTotal; }
    public BigDecimal getShipmentPrice() { return shipmentPrice; }
    public BigDecimal getDiscountValue() { return discountValue; }
    public BigDecimal getTotal() { return total; }
}
