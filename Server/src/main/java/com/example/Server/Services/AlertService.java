package com.example.Server.Services;

import com.example.Server.Models.Alert;
import com.example.Server.Models.Alert.AlertPriority;
import com.example.Server.Repositories.AlertRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class AlertService {

    private final AlertRepository alertRepository;

    // --- Thresholds ---
    private static final int IP_FLOOD_HIGH     = 100;
    private static final int IP_FLOOD_CRITICAL = 300;

    private static final int SURGE_MEDIUM   = 500;
    private static final int SURGE_HIGH     = 1000;
    private static final int SURGE_CRITICAL = 3000;

    private static final int PATH_ABUSE_MEDIUM = 50;
    private static final int PATH_ABUSE_HIGH   = 200;

    private static final int PATH_SCAN_LOW      = 5;
    private static final int PATH_SCAN_MEDIUM   = 10;
    private static final int PATH_SCAN_HIGH     = 20;
    private static final int PATH_SCAN_CRITICAL = 50;

    private static final java.util.List<String> BOT_KEYWORDS = java.util.List.of(
        "bot", "crawler", "spider", "scraper", "wget", "curl",
        "python-requests", "java/", "go-http", "libwww"
    );

    // --- In-Memory Counters ---
    // Key format → "clientName:ip" or "clientName:path" etc.

    // IP flood: count of requests per IP in current window
    private final ConcurrentHashMap<String, AtomicInteger> ipRequestCount = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LocalDateTime> ipWindowStart   = new ConcurrentHashMap<>();

    // Global surge: count of unique IPs per client in current window
    private final ConcurrentHashMap<String, ConcurrentHashMap<String, Boolean>> clientUniqueIps = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LocalDateTime> surgeWindowStart = new ConcurrentHashMap<>();

    // Path abuse: count of hits per path in current window
    private final ConcurrentHashMap<String, AtomicInteger> pathHitCount  = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LocalDateTime> pathWindowStart = new ConcurrentHashMap<>();

    // Path scan: unique paths per IP in current window
    private final ConcurrentHashMap<String, ConcurrentHashMap<String, Boolean>> ipUniquePaths = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LocalDateTime> scanWindowStart = new ConcurrentHashMap<>();

    // Bot UA: count per userAgent in current window
    private final ConcurrentHashMap<String, AtomicInteger> botUaCount      = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LocalDateTime> botUaWindowStart = new ConcurrentHashMap<>();

    public AlertService(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    /**
     * Main entry point — call after every insertActivity()
     */
    public void analyze(String clientName, String ip, String userAgent, String path) {
        System.out.println("hi");
        checkIpFlood(clientName, ip);
        checkGlobalUserSurge(clientName, ip);
        checkPathAbuse(clientName, path);
        checkBotUserAgent(clientName, ip, userAgent, path);
        checkRapidPathScan(clientName, ip, path);
    }

    // ----------------------------------------------------------------
    // 1. IP FLOOD — 5 minute window
    // ----------------------------------------------------------------
    private void checkIpFlood(String clientName, String ip) {
        String key = clientName + ":" + ip;
        LocalDateTime now = LocalDateTime.now();

        // Reset window if 5 minutes have passed
        ipWindowStart.putIfAbsent(key, now);
        if (ipWindowStart.get(key).isBefore(now.minusMinutes(5))) {
            ipWindowStart.put(key, now);
            ipRequestCount.put(key, new AtomicInteger(0));
        }

        ipRequestCount.putIfAbsent(key, new AtomicInteger(0));
        int count = ipRequestCount.get(key).incrementAndGet();

        if (count == IP_FLOOD_CRITICAL) {
            saveAlert(clientName, "IP_FLOOD", AlertPriority.CRITICAL,
                "IP " + ip + " made " + count + " requests in 5 minutes.",
                ip, null, null);
        } else if (count == IP_FLOOD_HIGH) {
            saveAlert(clientName, "IP_FLOOD", AlertPriority.HIGH,
                "IP " + ip + " made " + count + " requests in 5 minutes.",
                ip, null, null);
        }
    }

    // ----------------------------------------------------------------
    // 2. GLOBAL USER SURGE — 1 minute window
    // ----------------------------------------------------------------
    private void checkGlobalUserSurge(String clientName, String ip) {
        LocalDateTime now = LocalDateTime.now();

        surgeWindowStart.putIfAbsent(clientName, now);
        if (surgeWindowStart.get(clientName).isBefore(now.minusMinutes(1))) {
            surgeWindowStart.put(clientName, now);
            clientUniqueIps.put(clientName, new ConcurrentHashMap<>());
        }

        clientUniqueIps.putIfAbsent(clientName, new ConcurrentHashMap<>());
        clientUniqueIps.get(clientName).put(ip, Boolean.TRUE);
        int uniqueCount = clientUniqueIps.get(clientName).size();

        AlertPriority priority = null;
        if (uniqueCount == SURGE_CRITICAL)     priority = AlertPriority.CRITICAL;
        else if (uniqueCount == SURGE_HIGH)    priority = AlertPriority.HIGH;
        else if (uniqueCount == SURGE_MEDIUM)  priority = AlertPriority.MEDIUM;

        if (priority != null) {
            saveAlert(clientName, "GLOBAL_USER_SURGE", priority,
                uniqueCount + " unique IPs hit " + clientName + " in the last 60 seconds.",
                null, null, null);
        }
    }

    // ----------------------------------------------------------------
    // 3. PATH ABUSE — 1 minute window
    // ----------------------------------------------------------------
    private void checkPathAbuse(String clientName, String path) {
        String key = clientName + ":" + path;
        LocalDateTime now = LocalDateTime.now();

        pathWindowStart.putIfAbsent(key, now);
        if (pathWindowStart.get(key).isBefore(now.minusMinutes(1))) {
            pathWindowStart.put(key, now);
            pathHitCount.put(key, new AtomicInteger(0));
        }

        pathHitCount.putIfAbsent(key, new AtomicInteger(0));
        int count = pathHitCount.get(key).incrementAndGet();

        AlertPriority priority = null;
        if (count == PATH_ABUSE_HIGH)        priority = AlertPriority.HIGH;
        else if (count == PATH_ABUSE_MEDIUM) priority = AlertPriority.MEDIUM;

        if (priority != null) {
            saveAlert(clientName, "PATH_ABUSE", priority,
                "Path '" + path + "' was hit " + count + " times in 60 seconds.",
                null, path, null);
        }
    }

    // ----------------------------------------------------------------
    // 4. BOT DETECTION — 5 minute window
    // ----------------------------------------------------------------
    private void checkBotUserAgent(String clientName, String ip,
                                   String userAgent, String path) {
        if (userAgent == null) return;
        String ua = userAgent.toLowerCase();
        boolean isBot = BOT_KEYWORDS.stream().anyMatch(ua::contains);
        if (!isBot) return;

        String key = clientName + ":" + userAgent;
        LocalDateTime now = LocalDateTime.now();

        botUaWindowStart.putIfAbsent(key, now);
        if (botUaWindowStart.get(key).isBefore(now.minusMinutes(5))) {
            botUaWindowStart.put(key, now);
            botUaCount.put(key, new AtomicInteger(0));
        }

        botUaCount.putIfAbsent(key, new AtomicInteger(0));
        int count = botUaCount.get(key).incrementAndGet();

        // Alert on first detection, then escalate at 20
        if (count == 1) {
            saveAlert(clientName, "BOT_DETECTED", AlertPriority.MEDIUM,
                "Suspicious user agent '" + userAgent + "' detected from IP " + ip + ".",
                ip, path, userAgent);
        } else if (count == 20) {
            saveAlert(clientName, "BOT_DETECTED", AlertPriority.HIGH,
                "Bot UA '" + userAgent + "' has made " + count + " requests in 5 minutes from IP " + ip + ".",
                ip, path, userAgent);
        }
    }

    // ----------------------------------------------------------------
    // 5. RAPID PATH SCAN — 2 minute window
    // ----------------------------------------------------------------
    private void checkRapidPathScan(String clientName, String ip, String path) {
        String key = clientName + ":" + ip;
        LocalDateTime now = LocalDateTime.now();

        scanWindowStart.putIfAbsent(key, now);
        if (scanWindowStart.get(key).isBefore(now.minusMinutes(2))) {
            scanWindowStart.put(key, now);
            ipUniquePaths.put(key, new ConcurrentHashMap<>());
        }

        ipUniquePaths.putIfAbsent(key, new ConcurrentHashMap<>());
        ipUniquePaths.get(key).put(path, Boolean.TRUE);
        int distinctPaths = ipUniquePaths.get(key).size();

        AlertPriority priority = null;
        if (distinctPaths == PATH_SCAN_CRITICAL)     priority = AlertPriority.CRITICAL;
        else if (distinctPaths == PATH_SCAN_HIGH)    priority = AlertPriority.HIGH;
        else if (distinctPaths == PATH_SCAN_MEDIUM)  priority = AlertPriority.MEDIUM;
        else if (distinctPaths == PATH_SCAN_LOW)     priority = AlertPriority.LOW;

        if (priority != null) {
            saveAlert(clientName, "PATH_SCAN", priority,
                "IP " + ip + " scanned " + distinctPaths + " unique paths in 2 minutes. Possible recon.",
                ip, null, null);
        }
    }

    // ----------------------------------------------------------------
    // Helper
    // ----------------------------------------------------------------
    private void saveAlert(String clientName, String type, AlertPriority priority,
                           String description, String ip, String path, String ua) {
        System.out.println("hi");
        Alert alert = new Alert();
        alert.setClientName(clientName);
        alert.setAlertType(type);
        alert.setPriority(priority);
        alert.setDescription(description);
        alert.setRelatedIp(ip);
        alert.setRelatedPath(path);
        alert.setRelatedUserAgent(ua);
        alertRepository.save(alert);
    }
}