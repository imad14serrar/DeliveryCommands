package ma.pfa.delivery.service;

import ma.pfa.delivery.dto.AdminDtos.DashboardStats;
import ma.pfa.delivery.dto.AdminDtos.LowStockProduct;
import ma.pfa.delivery.dto.CreateShipmentRequest;
import ma.pfa.delivery.dto.ShipmentDtos.ShipmentDto;
import ma.pfa.delivery.dto.ShipmentDtos.TrackingDto;
import ma.pfa.delivery.entity.Payment;
import ma.pfa.delivery.entity.Product;
import ma.pfa.delivery.entity.Shipment;
import ma.pfa.delivery.entity.ShipmentItem;
import ma.pfa.delivery.entity.ShipmentStatus;
import ma.pfa.delivery.entity.ShipmentType;
import ma.pfa.delivery.exception.ApiException;
import ma.pfa.delivery.repository.ProductRepository;
import ma.pfa.delivery.repository.ShipmentRepository;
import ma.pfa.delivery.repository.ShipmentTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Règles métier des commandes : création, suivi, changement de statut, statistiques. */
@Service
public class ShipmentService {

    static final int LOW_STOCK_THRESHOLD = 5;
    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans 0/O/1/I ambigus
    private static final DateTimeFormatter CODE_DATE = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final ShipmentRepository shipmentRepository;
    private final ProductRepository productRepository;
    private final ShipmentTypeRepository shipmentTypeRepository;
    private final SecureRandom random = new SecureRandom();

    public ShipmentService(ShipmentRepository shipmentRepository, ProductRepository productRepository,
                           ShipmentTypeRepository shipmentTypeRepository) {
        this.shipmentRepository = shipmentRepository;
        this.productRepository = productRepository;
        this.shipmentTypeRepository = shipmentTypeRepository;
    }

    /**
     * Crée une commande : vérifie le stock, recalcule les prix côté serveur,
     * décrémente le stock et génère un code de suivi unique. Tout ou rien (transaction).
     */
    @Transactional
    public ShipmentDto create(CreateShipmentRequest request) {
        ShipmentType type = shipmentTypeRepository.findByCode(request.shipmentTypeCode())
                .orElseThrow(() -> ApiException.badRequest("Mode de livraison inconnu."));

        // Regroupe les lignes en double (même produit envoyé deux fois).
        Map<Long, Integer> quantities = new LinkedHashMap<>();
        request.items().forEach(line -> quantities.merge(line.productId(), line.quantity(), Integer::sum));

        Shipment shipment = new Shipment(generateCode(), request.firstName().trim(), request.lastName().trim(),
                request.phone(), request.email().trim().toLowerCase(), request.address().trim(),
                request.city().trim(), request.postalCode(), type, LocalDateTime.now());

        quantities.forEach((productId, quantity) -> {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> ApiException.badRequest("Produit introuvable (id " + productId + ")."));
            if (quantity > product.getStock()) {
                throw ApiException.badRequest("Stock insuffisant pour « " + product.getName()
                        + " » (disponible : " + product.getStock() + ").");
            }
            product.decreaseStock(quantity);
            shipment.addItem(product, quantity);
        });

        BigDecimal productsTotal = shipment.getItems().stream()
                .map(ShipmentItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        shipment.setPayment(new Payment("CARTE_SIMULEE", productsTotal, type.getPrice(), BigDecimal.ZERO));

        return ShipmentDto.from(shipmentRepository.save(shipment));
    }

    /**
     * Suivi public : le code ET l'e-mail doivent correspondre. Le même message est renvoyé dans
     * les deux cas d'échec pour ne pas révéler qu'un code existe.
     */
    @Transactional(readOnly = true)
    public TrackingDto track(String code, String email) {
        return shipmentRepository.findByCode(code.trim().toUpperCase())
                .filter(s -> s.getEmail().equalsIgnoreCase(email.trim()))
                .map(TrackingDto::from)
                .orElseThrow(() -> ApiException.notFound("Aucune commande ne correspond à ce code et cet e-mail."));
    }

    @Transactional(readOnly = true)
    public List<ShipmentDto> findAll(ShipmentStatus status) {
        List<Shipment> shipments = status == null
                ? shipmentRepository.findAllByOrderByOrderDateDesc()
                : shipmentRepository.findByStatusOrderByOrderDateDesc(status);
        return shipments.stream().map(ShipmentDto::from).toList();
    }

    @Transactional
    public ShipmentDto updateStatus(String code, ShipmentStatus status) {
        Shipment shipment = shipmentRepository.findByCode(code)
                .orElseThrow(() -> ApiException.notFound("Commande " + code + " introuvable."));
        shipment.changeStatus(status);
        return ShipmentDto.from(shipment);
    }

    @Transactional(readOnly = true)
    public DashboardStats stats() {
        Map<ShipmentStatus, Long> byStatus = new EnumMap<>(ShipmentStatus.class);
        for (ShipmentStatus s : ShipmentStatus.values()) {
            byStatus.put(s, shipmentRepository.countByStatus(s));
        }
        List<LowStockProduct> lowStock = productRepository.findByStockLessThanEqualOrderByStockAsc(LOW_STOCK_THRESHOLD)
                .stream().map(p -> new LowStockProduct(p.getId(), p.getName(), p.getStock())).toList();
        return new DashboardStats(shipmentRepository.count(), shipmentRepository.sumRevenue(), byStatus,
                productRepository.count(), lowStock);
    }

    private String generateCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder("CMD-").append(LocalDateTime.now().format(CODE_DATE)).append('-');
            for (int i = 0; i < 6; i++) {
                sb.append(CODE_ALPHABET.charAt(random.nextInt(CODE_ALPHABET.length())));
            }
            code = sb.toString();
        } while (shipmentRepository.existsByCode(code));
        return code;
    }
}
