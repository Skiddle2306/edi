package com.example.Client.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.util.Properties;

@Configuration
public class ClientConfig {

    @Bean
    public Properties clientProperties() throws Exception {
        Properties p = new Properties();
        try (FileInputStream fis = new FileInputStream("client-config.properties")) {
            p.load(fis);
        }
        return p;
    }
}
