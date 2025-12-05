package com.example.Client.Services;

import com.example.Client.Models.ResourceUsage;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Properties;
@Service
public class ResourceIntervalUpdateService {

    private final RestClient restClient = RestClient.create();
    private final UnifiedResourceReader resourceReader;
    private final String serverUrl = "http://localhost:5050/api/resources/push";
    private final String clientName;

    public ResourceIntervalUpdateService(
            UnifiedResourceReader resourceReader,
            @Qualifier("clientProperties") Properties props
    ) {
        this.resourceReader = resourceReader;
        this.clientName = props.getProperty("client.name");
    }

    @Scheduled(fixedRate = 5000)
    public void updateResources() {
        try {
            ResourceUsage usage = resourceReader.readUsage();
            System.out.println(usage);
            restClient.post()
                    .uri(serverUrl)
                    .header("client-name", clientName)
                    .body(usage)
                    .retrieve()
                    .toBodilessEntity();

            System.out.println("🔼 Sent resource usage to server");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
