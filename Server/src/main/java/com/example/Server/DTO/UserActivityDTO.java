package com.example.Server.DTO;

import java.time.LocalDateTime;

public class UserActivityDTO {

    private String clientName;
    private String ip;
    private String userAgent;
    private String path;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int durationSeconds;

    public UserActivityDTO() {}

    public UserActivityDTO(
            String clientName,
            String ip,
            String userAgent,
            String path,
            LocalDateTime startTime,
            LocalDateTime endTime,
            int durationSeconds
    ) {
        this.clientName = clientName;
        this.ip = ip;
        this.userAgent = userAgent;
        this.path = path;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationSeconds = durationSeconds;
    }

    public String getClientName() {
        return clientName;
    }
    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getIp() {
        return ip;
    }
    public void setIp(String ip) {
        this.ip = ip;
    }

    public String getUserAgent() {
        return userAgent;
    }
    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getPath() {
        return path;
    }
    public void setPath(String path) {
        this.path = path;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public int getDurationSeconds() {
        return durationSeconds;
    }
    public void setDurationSeconds(int durationSeconds) {
        this.durationSeconds = durationSeconds;
    }
}
