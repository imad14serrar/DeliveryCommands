package ma.pfa.delivery.dto;

import ma.pfa.delivery.entity.Payment;
import ma.pfa.delivery.entity.Shipment;
import ma.pfa.delivery.entity.ShipmentItem;
import ma.pfa.delivery.entity.ShipmentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** DTO des commandes. */
public final class ShipmentDtos {

    private ShipmentDtos() {
    }

    public record ItemDto(Long productId, String productName, String imageUrl, int quantity,
                          BigDecimal unitPrice, BigDecimal lineTotal) {
        static ItemDto from(ShipmentItem i) {
            return new ItemDto(i.getProduct().getId(), i.getProduct().getName(), i.getProduct().getImageUrl(),
                    i.getQuantity(), i.getUnitPrice(), i.getLineTotal());
        }
    }

    public record PaymentDto(String method, BigDecimal productsTotal, BigDecimal shipmentPrice,
                             BigDecimal discountValue, BigDecimal total) {
        static PaymentDto from(Payment p) {
            return new PaymentDto(p.getMethod(), p.getProductsTotal(), p.getShipmentPrice(),
                    p.getDiscountValue(), p.getTotal());
        }
    }

    /** Vue complète d'une commande (confirmation client et espace admin). */
    public record ShipmentDto(String code, String firstName, String lastName, String phone, String email,
                              String address, String city, String postalCode, LocalDateTime orderDate,
                              LocalDateTime updatedAt, ShipmentStatus status,
                              CatalogDtos.ShipmentTypeDto shipmentType, List<ItemDto> items, PaymentDto payment) {
        public static ShipmentDto from(Shipment s) {
            return new ShipmentDto(s.getCode(), s.getFirstName(), s.getLastName(), s.getPhone(), s.getEmail(),
                    s.getAddress(), s.getCity(), s.getPostalCode(), s.getOrderDate(), s.getUpdatedAt(),
                    s.getStatus(), CatalogDtos.ShipmentTypeDto.from(s.getShipmentType()),
                    s.getItems().stream().map(ItemDto::from).toList(), PaymentDto.from(s.getPayment()));
        }
    }

    /**
     * Vue publique du suivi : volontairement sans téléphone, e-mail ni adresse complète,
     * pour ne pas exposer les données personnelles du client.
     */
    public record TrackingDto(String code, String firstName, String city, LocalDateTime orderDate,
                              LocalDateTime updatedAt, ShipmentStatus status,
                              CatalogDtos.ShipmentTypeDto shipmentType, int itemCount, BigDecimal total) {
        public static TrackingDto from(Shipment s) {
            int count = s.getItems().stream().mapToInt(ShipmentItem::getQuantity).sum();
            return new TrackingDto(s.getCode(), s.getFirstName(), s.getCity(), s.getOrderDate(), s.getUpdatedAt(),
                    s.getStatus(), CatalogDtos.ShipmentTypeDto.from(s.getShipmentType()), count,
                    s.getPayment().getTotal());
        }
    }
}
