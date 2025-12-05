package com.example.Server.DTO;


import java.time.LocalDateTime;

public class ResourceUsageDTO{
    public double cpuUsage;
        long totalRam;
        long usedRam;
        long diskTotal;
        long diskUsed;
        LocalDateTime timestamp;
        ResourceUsageDTO(){

        }
        ResourceUsageDTO(double cpuUsage,
        long totalRam,
        long usedRam,
        long diskTotal,
        long diskUsed,
        LocalDateTime timestamp){
            this.cpuUsage=cpuUsage;
            this.totalRam=totalRam;
            this.usedRam=usedRam;
            this.diskTotal=diskTotal;
            this.diskUsed=diskUsed;
        }

    public double getCpuUsage() {
        return cpuUsage;
    }

    public void setCpuUsage(double cpuUsage) {
        this.cpuUsage = cpuUsage;
    }

    public long getTotalRam() {
        return totalRam;
    }

    public void setTotalRam(long totalRam) {
        this.totalRam = totalRam;
    }

    public long getUsedRam() {
        return usedRam;
    }

    public void setUsedRam(long usedRam) {
        this.usedRam = usedRam;
    }

    public long getDiskTotal() {
        return diskTotal;
    }

    public void setDiskTotal(long diskTotal) {
        this.diskTotal = diskTotal;
    }

    public long getDiskUsed() {
        return diskUsed;
    }

    public void setDiskUsed(long diskUsed) {
        this.diskUsed = diskUsed;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }


    public long memoryUsage() {
            return memoryUsage();
    }
}

