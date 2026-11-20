package ma.pfa.delivery.controller;

import jakarta.validation.Valid;
import ma.pfa.delivery.dto.AdminDtos.DashboardStats;
import ma.pfa.delivery.dto.AdminDtos.LoginRequest;
import ma.pfa.delivery.dto.AdminDtos.LoginResponse;
import ma.pfa.delivery.dto.AdminDtos.StatusUpdateRequest;
import ma.pfa.delivery.dto.ShipmentDtos.ShipmentDto;
import ma.pfa.delivery.entity.ShipmentStatus;
import ma.pfa.delivery.service.AuthService;
import ma.pfa.delivery.service.ShipmentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Connexion administrateur et gestion des commandes (routes /api/admin/** protégées par JWT). */
@RestController
public class AdminController {

    private final AuthService authService;
    private final ShipmentService shipmentService;

    public AdminController(AuthService authService, ShipmentService shipmentService) {
        this.authService = authService;
        this.shipmentService = shipmentService;
    }

    @PostMapping("/api/auth/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.username(), request.password());
    }

    @GetMapping("/api/admin/shipments")
    public List<ShipmentDto> shipments(@RequestParam(required = false) ShipmentStatus status) {
        return shipmentService.findAll(status);
    }

    @PatchMapping("/api/admin/shipments/{code}/status")
    public ShipmentDto updateStatus(@PathVariable String code, @Valid @RequestBody StatusUpdateRequest request) {
        return shipmentService.updateStatus(code, request.status());
    }

    @GetMapping("/api/admin/stats")
    public DashboardStats stats() {
        return shipmentService.stats();
    }
}
