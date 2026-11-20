package ma.pfa.delivery.entity;

/** Étapes du cycle de vie d'une commande, dans l'ordre. */
public enum ShipmentStatus {
    PROCESSED,   // commande traitée
    SHIPPED,     // expédiée
    ON_THE_WAY,  // en route
    DELIVERED    // livrée
}
