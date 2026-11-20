package ma.pfa.delivery.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Commande envoyée par le client. Seuls les identifiants et quantités des produits sont reçus :
 * les prix et totaux sont recalculés par le serveur (on ne fait jamais confiance au navigateur).
 */
public record CreateShipmentRequest(
        @NotBlank(message = "Le prénom est obligatoire.") @Size(max = 60) String firstName,
        @NotBlank(message = "Le nom est obligatoire.") @Size(max = 60) String lastName,
        @NotBlank(message = "Le téléphone est obligatoire.")
        @Pattern(regexp = "^0\\d{9}$", message = "Le téléphone doit contenir 10 chiffres et commencer par 0.")
        String phone,
        @NotBlank(message = "L'e-mail est obligatoire.") @Email(message = "L'e-mail est invalide.") String email,
        @NotBlank(message = "L'adresse est obligatoire.") @Size(max = 200) String address,
        @NotBlank(message = "La ville est obligatoire.") @Size(max = 60) String city,
        @NotBlank(message = "Le code postal est obligatoire.")
        @Pattern(regexp = "^\\d{5}$", message = "Le code postal doit contenir 5 chiffres.")
        String postalCode,
        @NotBlank(message = "Le mode de livraison est obligatoire.") String shipmentTypeCode,
        @NotEmpty(message = "Le panier est vide.") @Valid List<Line> items
) {
    public record Line(
            @NotNull(message = "Produit manquant.") Long productId,
            @Min(value = 1, message = "La quantité minimale est 1.")
            @Max(value = 99, message = "La quantité maximale est 99.") int quantity
    ) {
    }
}
