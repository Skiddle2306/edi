package com.example.Client.Models;

import java.time.LocalDateTime;

public record ResourceUsage(
        double cpuUsage,
        long totalRam,
        long usedRam,
        long diskTotal,
        long diskUsed,
        LocalDateTime timestamp
) {}
