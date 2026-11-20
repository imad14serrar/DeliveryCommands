package ma.pfa.delivery.controller;

import ma.pfa.delivery.dto.CatalogDtos.CategoryDto;
import ma.pfa.delivery.dto.CatalogDtos.ProductDto;
import ma.pfa.delivery.dto.CatalogDtos.ShipmentTypeDto;
import ma.pfa.delivery.repository.CategoryRepository;
import ma.pfa.delivery.repository.ProductRepository;
import ma.pfa.delivery.repository.ShipmentTypeRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Catalogue public : produits, catégories et modes de livraison (lecture seule). */
@RestController
@RequestMapping("/api")
public class CatalogController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ShipmentTypeRepository shipmentTypeRepository;

    public CatalogController(ProductRepository productRepository, CategoryRepository categoryRepository,
                             ShipmentTypeRepository shipmentTypeRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.shipmentTypeRepository = shipmentTypeRepository;
    }

    @GetMapping("/products")
    public List<ProductDto> products() {
        return productRepository.findAllByOrderByIdAsc().stream().map(ProductDto::from).toList();
    }

    @GetMapping("/categories")
    public List<CategoryDto> categories() {
        return categoryRepository.findAll().stream().map(CategoryDto::from).toList();
    }

    @GetMapping("/shipment-types")
    public List<ShipmentTypeDto> shipmentTypes() {
        return shipmentTypeRepository.findAllByOrderByIdAsc().stream().map(ShipmentTypeDto::from).toList();
    }
}
