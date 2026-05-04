package com.example.Server.Controllers;

import com.example.Server.Models.UserActivity;
import com.example.Server.Services.UserActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class UserActivityController {

    private final UserActivityService service;

    public UserActivityController(UserActivityService service) {
        this.service = service;
    }

    @PostMapping("/push")
    public ResponseEntity<?> receiveLogs(
            @RequestHeader("client-name") String clientName,
            @RequestBody List<UserActivity> logs
    ) {
        try {
            System.out.println("Logs: " + logs);
            System.out.println("yay");
            service.saveAll(clientName, logs);
            return ResponseEntity.ok("Logs saved");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
