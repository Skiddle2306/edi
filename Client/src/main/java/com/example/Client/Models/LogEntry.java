package com.example.Client.Models;


import java.sql.Timestamp;
import java.time.LocalDateTime;

/**
 * Simple immutable log entry for parsed access log lines.
 */
public record LogEntry(
        String ip,
        String userAgent,
        String path,


        LocalDateTime startTime,
    LocalDateTime endTime,

    int durationSeconds

) {}
