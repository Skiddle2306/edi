package com.example.Client.Services;

import com.example.Client.Models.LogEntry;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Properties;

@Service
public class LogIntervalUpdateService {
    private final RestClient restClient = RestClient.create();
    private final String serverUrl ;

    private final UnifiedLogReader reader;
    private final WriterService writer;
    private final String logFilePath;
    private final String clientName;

    public LogIntervalUpdateService(
            UnifiedLogReader reader,
            WriterService writer,
            @Qualifier("clientProperties") Properties clientProperties
    ) {
        this.reader = reader;
        this.writer = writer;

        this.logFilePath = clientProperties.getProperty("client.log");
        this.clientName = clientProperties.getProperty("client.name");
        this.serverUrl = clientProperties.getProperty("server.url")+"/api/logs/push";
        if (this.logFilePath == null) {
            throw new IllegalStateException("client.log not found in client.properties");
        }
    }

//    @Scheduled(fixedRate = 5000)
//    public void updateLogs() {
//        try {
//            List<LogEntry> logs = reader.readLogs(logFilePath);
//
//            for (LogEntry entry : logs) {
//                writer.insertUserActivity(
//                        entry.ip(),
//                        entry.userAgent(),
//                        entry.path(),
//                        entry.ts(),
//                        entry.ts(),
//                        0
//                );
//            }
//
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//    }
    @Scheduled(fixedRate = 5000)
public void updateLogs() {
    try {
        List<LogEntry> logs = reader.readLogs(logFilePath);
        System.out.println("Updating logs");
        // send to main server
        sendLogsToServer(logs);
        System.out.println(logs);

    } catch (Exception e) {
        e.printStackTrace();
    }
}

    private void sendLogsToServer(List<LogEntry> logs) {
        try {System.out.println("pushed logs:");
            restClient.post()
                    .uri(serverUrl)
                    .header("client-name", clientName)
                    .body(logs)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            System.out.println(serverUrl);
            System.out.println("Failed to push logs:");
            throw new RuntimeException(e);
        }
}

}
