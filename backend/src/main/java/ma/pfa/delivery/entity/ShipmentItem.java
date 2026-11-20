package ma.pfa.delivery.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

import java.math.BigDecimal;

/**
 * Ligne de commande : un produit et sa quantité.
 * Le prix unitaire est copié au moment de la commande pour que l'historique
 * reste juste même si le prix du produit change ensuite.
 */
@Entity
public class ShipmentItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Shipment shipment;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Product product;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    protected ShipmentItem() {
        // requis par JPA
    }

    public ShipmentItem(Shipment shipment, Product product, int quantity) {
        this.shipment = shipment;
        this.product = product;
        this.quantity = quantity;
        this.unitPrice = product.getPrice();
    }

    public BigDecimal getLineTotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public int getQuantity() { return quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
}
