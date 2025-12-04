package com.example.Client.Models;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "system_metrics")
public class SystemMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String clientName;

    private Timestamp timestamp;

    private double cpuUsage;
    private int cpuCores;
    private long totalRam;
    private long usedRam;

    private String diskName;
    private long diskSize;
    private long diskUsed;

    // ---------- GETTERS & SETTERS ----------

    public Long getId() { return id; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public Timestamp getTimestamp() { return timestamp; }
    public void setTimestamp(Timestamp timestamp) { this.timestamp = timestamp; }

    public double getCpuUsage() { return cpuUsage; }
    public void setCpuUsage(double cpuUsage) { this.cpuUsage = cpuUsage; }

    public int getCpuCores() { return cpuCores; }
    public void setCpuCores(int cpuCores) { this.cpuCores = cpuCores; }

    public long getTotalRam() { return totalRam; }
    public void setTotalRam(long totalRam) { this.totalRam = totalRam; }

    public long getUsedRam() { return usedRam; }
    public void setUsedRam(long usedRam) { this.usedRam = usedRam; }

    public String getDiskName() { return diskName; }
    public void setDiskName(String diskName) { this.diskName = diskName; }

    public long getDiskSize() { return diskSize; }
    public void setDiskSize(long diskSize) { this.diskSize = diskSize; }

    public long getDiskUsed() { return diskUsed; }
    public void setDiskUsed(long diskUsed) { this.diskUsed = diskUsed; }
}
