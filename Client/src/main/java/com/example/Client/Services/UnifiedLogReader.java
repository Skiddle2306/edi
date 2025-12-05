package com.example.Client.Services;


import com.example.Client.Models.LogEntry;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.sql.Timestamp;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


@Service
public class UnifiedLogReader {

    private ZonedDateTime lastProcessed = null;

    public List<LogEntry> readLogs(String logPath) throws IOException {
        List<LogEntry> results = new ArrayList<>();
        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("dd/MMM/yyyy:HH:mm:ss Z", Locale.ENGLISH);

        String regex = "^(\\S+) \\S+ \\S+ \\[(.+?)\\] \"(\\S+) (\\S+) .*?\" (\\d{3}) (\\d+|-) \"(.*?)\" \"(.*?)\"";
        Pattern pattern = Pattern.compile(regex);

        try (BufferedReader br = new BufferedReader(new FileReader(logPath))) {
            String line;
            while ((line = br.readLine()) != null) {
                Matcher m = pattern.matcher(line);
                if (!m.find()) continue;

                ZonedDateTime ts = ZonedDateTime.parse(m.group(2), formatter);

                if (lastProcessed != null && ts.isBefore(lastProcessed)) continue;

                results.add(new LogEntry(m.group(1), m.group(8), m.group(4),
                        Timestamp.from(ts.toInstant())));
            }
        }

        lastProcessed = ZonedDateTime.now();
        return results;
    }
}
