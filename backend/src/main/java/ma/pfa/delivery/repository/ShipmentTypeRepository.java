package ma.pfa.delivery.repository;

import ma.pfa.delivery.entity.ShipmentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShipmentTypeRepository extends JpaRepository<ShipmentType, Long> {

    Optional<ShipmentType> findByCode(String code);

    List<ShipmentType> findAllByOrderByIdAsc();
}
