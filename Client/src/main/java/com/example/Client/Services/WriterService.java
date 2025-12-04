package com.example.Client.Services;

import com.example.Client.Models.LogEntry;
import com.example.Client.Models.SystemMetrics;
import com.example.Client.Models.UserActivity;
import com.example.Client.Repositories.SystemMetricsRepository;
import com.example.Client.Repositories.UserActivityRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;

@Service
public class WriterService {

    private final SystemMetricsRepository systemMetricsRepo;
    private final UserActivityRepository userActivityRepo;
    private final String clientName;

    public WriterService(SystemMetricsRepository systemMetricsRepo,
                         UserActivityRepository userActivityRepo,
                         java.util.Properties clientProperties) {
        this.systemMetricsRepo = systemMetricsRepo;
        this.userActivityRepo = userActivityRepo;
        this.clientName = clientProperties.getProperty("client.name");
    }

    public void insertSystemMetrics(double cpuUsage, int cpuCores, long totalRam, long usedRam,
                                    String diskName, long diskSize, long diskUsed) {
        SystemMetrics m = new SystemMetrics();
        m.setClientName(clientName);
        m.setTimestamp(new Timestamp(System.currentTimeMillis()));
        m.setCpuUsage(cpuUsage);
        m.setCpuCores(cpuCores);
        m.setTotalRam(totalRam);
        m.setUsedRam(usedRam);
        m.setDiskName(diskName);
        m.setDiskSize(diskSize);
        m.setDiskUsed(diskUsed);
        systemMetricsRepo.save(m);
    }

    public void insertUserActivity(String ip, String userAgent, String path, Timestamp start,
                                   Timestamp end, int duration) {
        UserActivity ua = new UserActivity();
        ua.setClientName(clientName);
        ua.setIp(ip);
        ua.setUserAgent(userAgent);
        ua.setPath(path);
        ua.setStartTime(start);
        ua.setEndTime(end);
        ua.setDurationSeconds(duration);
        userActivityRepo.save(ua);
    }
}
