package com.example.Client.Services;


import com.example.Client.Models.LogEntry;
import org.springframework.stereotype.Service;

import java.io.*;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class UnifiedLogReader {

    private long lastPosition = 0;

//    public List<LogEntry> readLogs(String logPath) throws IOException {
//        List<LogEntry> results = new ArrayList<>();
//
//        DateTimeFormatter formatter =
//                DateTimeFormatter.ofPattern("dd/MMM/yyyy:HH:mm:ss Z", Locale.ENGLISH);
//
//        String regex = "^(\\S+) \\S+ \\S+ \\[(.+?)\\] \"(\\S+) (\\S+) .*?\" (\\d{3}) (\\d+|-) \"(.*?)\" \"(.*?)\"";
//        Pattern pattern = Pattern.compile(regex);
//
//        RandomAccessFile raf = new RandomAccessFile(logPath, "r");
//
//        // Move to last read position
//        raf.seek(lastPosition);
//
//        String line;
//        while ((line = raf.readLine()) != null) {
//
//            Matcher m = pattern.matcher(line);
//            if (!m.find()) continue;
//
//            ZonedDateTime ts = ZonedDateTime.parse(m.group(2), formatter);
//            LocalDateTime time = ts.toLocalDateTime();
//
//            results.add(new LogEntry(
//                    m.group(1),
//                    m.group(8),
//                    m.group(4),
//                    time,
//                    time,
//                    0
//            ));
//        }
//
//        // Save new position for next cycle
//        lastPosition = raf.getFilePointer();
//        raf.close();
//
//        return results;
//    }
    public List<LogEntry> readLogs(String logPath) throws IOException {
    List<LogEntry> results = new ArrayList<>();

    File file = new File(logPath);

    // 🔥 Handle log rotation / truncation
    if (file.length() < lastPosition) {
        lastPosition = 0;
    }

    DateTimeFormatter formatter =
            DateTimeFormatter.ofPattern("dd/MMM/yyyy:HH:mm:ss Z", Locale.ENGLISH);

    String regex = "^(\\S+) \\S+ \\S+ \\[(.+?)\\] \"(\\S+) (\\S+) .*?\" (\\d{3}) (\\d+|-) \"(.*?)\" \"(.*?)\"";
    Pattern pattern = Pattern.compile(regex);

    try (RandomAccessFile raf = new RandomAccessFile(file, "r")) {
        raf.seek(lastPosition);

        String line;
        while ((line = raf.readLine()) != null) {
            Matcher m = pattern.matcher(line);
            if (!m.find()) continue;

            ZonedDateTime ts = ZonedDateTime.parse(m.group(2), formatter);
            LocalDateTime time = ts.toLocalDateTime();

            results.add(new LogEntry(
                    m.group(1),
                    m.group(8),
                    m.group(4),
                    time,
                    time,
                    0
            ));
        }

        lastPosition = raf.getFilePointer();
    }

    return results;
}
}

