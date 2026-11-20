package ma.pfa.delivery.repository;

import ma.pfa.delivery.entity.Shipment;
import ma.pfa.delivery.entity.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByCode(String code);

    boolean existsByCode(String code);

    List<Shipment> findAllByOrderByOrderDateDesc();

    List<Shipment> findByStatusOrderByOrderDateDesc(ShipmentStatus status);

    long countByStatus(ShipmentStatus status);

    @Query("select coalesce(sum(s.payment.total), 0) from Shipment s")
    BigDecimal sumRevenue();
}
