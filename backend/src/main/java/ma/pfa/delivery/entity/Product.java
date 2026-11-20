package ma.pfa.delivery.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Version;

import java.math.BigDecimal;

/** Produit du catalogue. {@code stock} = quantité disponible en magasin. */
@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int stock;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    private String imageUrl;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Category category;

    /** Verrouillage optimiste : évite que deux commandes simultanées vendent le même stock. */
    @Version
    private Long version;

    protected Product() {
        // requis par JPA
    }

    public Product(String code, String name, int stock, BigDecimal price, String imageUrl, Category category) {
        this.code = code;
        this.name = name;
        this.stock = stock;
        this.price = price;
        this.imageUrl = imageUrl;
        this.category = category;
    }

    /** Retire {@code quantity} unités du stock (la vérification est faite par le service). */
    public void decreaseStock(int quantity) {
        this.stock -= quantity;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public int getStock() { return stock; }
    public BigDecimal getPrice() { return price; }
    public String getImageUrl() { return imageUrl; }
    public Category getCategory() { return category; }
}
