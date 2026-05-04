package com.example.Server.Models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String clientName;
    private String alertType;       // e.g. "IP_FLOOD", "BOT_DETECTED"

    @Enumerated(EnumType.STRING)
    private AlertPriority priority; // LOW, MEDIUM, HIGH, CRITICAL

    private String description;     // human-readable detail
    private String relatedIp;
    private String relatedPath;
    private String relatedUserAgent;

    private LocalDateTime triggeredAt;

    @PrePersist
    public void prePersist() {
        this.triggeredAt = LocalDateTime.now();
    }

    public enum AlertPriority {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    // --- Getters & Setters ---
    public Long getId() { return id; }
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    public String getAlertType() { return alertType; }
    public void setAlertType(String alertType) { this.alertType = alertType; }
    public AlertPriority getPriority() { return priority; }
    public void setPriority(AlertPriority priority) { this.priority = priority; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getRelatedIp() { return relatedIp; }
    public void setRelatedIp(String relatedIp) { this.relatedIp = relatedIp; }
    public String getRelatedPath() { return relatedPath; }
    public void setRelatedPath(String relatedPath) { this.relatedPath = relatedPath; }
    public String getRelatedUserAgent() { return relatedUserAgent; }
    public void setRelatedUserAgent(String relatedUserAgent) { this.relatedUserAgent = relatedUserAgent; }
    public LocalDateTime getTriggeredAt() { return triggeredAt; }
}