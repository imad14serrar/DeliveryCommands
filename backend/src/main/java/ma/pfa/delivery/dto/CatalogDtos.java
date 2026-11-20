package ma.pfa.delivery.dto;

import ma.pfa.delivery.entity.Category;
import ma.pfa.delivery.entity.Product;
import ma.pfa.delivery.entity.ShipmentType;

import java.math.BigDecimal;

/** DTO du catalogue public (catégories, produits, modes de livraison). */
public final class CatalogDtos {

    private CatalogDtos() {
    }

    public record CategoryDto(Long id, String code, String name) {
        public static CategoryDto from(Category c) {
            return new CategoryDto(c.getId(), c.getCode(), c.getName());
        }
    }

    public record ProductDto(Long id, String code, String name, int stock, BigDecimal price,
                             String imageUrl, CategoryDto category) {
        public static ProductDto from(Product p) {
            return new ProductDto(p.getId(), p.getCode(), p.getName(), p.getStock(), p.getPrice(),
                    p.getImageUrl(), CategoryDto.from(p.getCategory()));
        }
    }

    public record ShipmentTypeDto(Long id, String code, String name, String description, BigDecimal price) {
        public static ShipmentTypeDto from(ShipmentType t) {
            return new ShipmentTypeDto(t.getId(), t.getCode(), t.getName(), t.getDescription(), t.getPrice());
        }
    }
}
