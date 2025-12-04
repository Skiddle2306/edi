package com.example.Client.Models;


import java.sql.Timestamp;

/**
 * Simple immutable log entry for parsed access log lines.
 */
public record LogEntry(
        String ip,
        String userAgent,
        String path,
        Timestamp ts
) {}
