package ma.pfa.delivery.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Commande d'un client, avec ses informations de livraison, ses lignes et son paiement. */
@Entity
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Code public communiqué au client pour le suivi (ex. : CMD-20261120-7K3QZP). */
    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String postalCode;

    @Column(nullable = false)
    private LocalDateTime orderDate;

    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus status;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private ShipmentType shipmentType;

    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ShipmentItem> items = new ArrayList<>();

    @Embedded
    private Payment payment;

    protected Shipment() {
        // requis par JPA
    }

    public Shipment(String code, String firstName, String lastName, String phone, String email,
                    String address, String city, String postalCode, ShipmentType shipmentType,
                    LocalDateTime orderDate) {
        this.code = code;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.city = city;
        this.postalCode = postalCode;
        this.shipmentType = shipmentType;
        this.orderDate = orderDate;
        this.updatedAt = orderDate;
        this.status = ShipmentStatus.PROCESSED;
    }

    public void addItem(Product product, int quantity) {
        items.add(new ShipmentItem(this, product, quantity));
    }

    public void changeStatus(ShipmentStatus newStatus) {
        this.status = newStatus;
        this.updatedAt = LocalDateTime.now();
    }

    public void setPayment(Payment payment) { this.payment = payment; }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public String getAddress() { return address; }
    public String getCity() { return city; }
    public String getPostalCode() { return postalCode; }
    public LocalDateTime getOrderDate() { return orderDate; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public ShipmentStatus getStatus() { return status; }
    public ShipmentType getShipmentType() { return shipmentType; }
    public List<ShipmentItem> getItems() { return items; }
    public Payment getPayment() { return payment; }
}
