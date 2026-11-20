package ma.pfa.delivery.controller;

import jakarta.validation.Valid;
import ma.pfa.delivery.dto.CreateShipmentRequest;
import ma.pfa.delivery.dto.ShipmentDtos.ShipmentDto;
import ma.pfa.delivery.dto.ShipmentDtos.TrackingDto;
import ma.pfa.delivery.service.ShipmentService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Côté client : passer une commande et suivre sa livraison. */
@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShipmentDto create(@Valid @RequestBody CreateShipmentRequest request) {
        return shipmentService.create(request);
    }

    @GetMapping("/track")
    public TrackingDto track(@RequestParam String code, @RequestParam String email) {
        return shipmentService.track(code, email);
    }
}
