package ma.pfa.delivery.repository;

import ma.pfa.delivery.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByOrderByIdAsc();

    /** Produits dont le stock est inférieur ou égal au seuil (alerte du tableau de bord). */
    List<Product> findByStockLessThanEqualOrderByStockAsc(int threshold);
}
