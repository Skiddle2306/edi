package com.example.Server.Controllers;

import com.example.Server.Services.RoleManagerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ClientRegistrationController {

    private final RoleManagerService roleManagerService;

    public ClientRegistrationController(RoleManagerService roleManagerService) {
        this.roleManagerService = roleManagerService;
    }

    // POST /api/register - body: JSON { "clientName": "...", "password": "..." }
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody ClientRegistrationRequest req) {
        String clientName = req.clientName();
        String password = req.password();

        // validate name
        if (!clientName.matches("^[a-zA-Z0-9_\\-]{3,40}$")) {
            return ResponseEntity.badRequest().body("Invalid clientName");
        }

        try {
            roleManagerService.registerNewClient(clientName, password);
            return ResponseEntity.ok("Registered");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    public record ClientRegistrationRequest(String clientName, String password) {}
}
