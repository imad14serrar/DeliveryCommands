package ma.pfa.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import ma.pfa.delivery.entity.ShipmentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/** DTO de l'authentification et de l'espace administrateur. */
public final class AdminDtos {

    private AdminDtos() {
    }

    public record LoginRequest(@NotBlank(message = "L'identifiant est obligatoire.") String username,
                               @NotBlank(message = "Le mot de passe est obligatoire.") String password) {
    }

    public record LoginResponse(String token, Instant expiresAt, String username) {
    }

    public record StatusUpdateRequest(@NotNull(message = "Le statut est obligatoire.") ShipmentStatus status) {
    }

    public record LowStockProduct(Long id, String name, int stock) {
    }

    public record DashboardStats(long totalOrders, BigDecimal totalRevenue, Map<ShipmentStatus, Long> ordersByStatus,
                                 long productCount, List<LowStockProduct> lowStockProducts) {
    }
}
