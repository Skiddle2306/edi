package com.example.Server.Controllers;

import com.example.Server.DTO.ResourceUsageDTO;
import com.example.Server.Services.ResourceUsageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/resources")
public class ResourcePushController {

    private final ResourceUsageService resourceUsageService;

    public ResourcePushController(ResourceUsageService service) {
        this.resourceUsageService = service;
    }

    @PostMapping("/push")
    public ResponseEntity<String> receiveUsage(
            @RequestHeader("client-name") String clientName,
            @RequestBody ResourceUsageDTO usage
    ) {
        try {
            resourceUsageService.saveUsage(clientName, usage);
            return ResponseEntity.ok("Resource usage saved");
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("Error: " + e.getMessage());
        }
    }
}
