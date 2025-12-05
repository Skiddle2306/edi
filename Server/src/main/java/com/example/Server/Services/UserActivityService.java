package com.example.Server.Services;

import com.example.Server.Models.UserActivity;
import com.example.Server.Repositories.UserActivityRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserActivityService {

    private final UserActivityRepository repo;

    public UserActivityService(UserActivityRepository repo) {
        this.repo = repo;
    }


    public void saveAll(String clientName, List<UserActivity> list) {
        for (UserActivity ua : list) {
            ua.setClientName(clientName); // ensure client tagging
        }
        repo.saveAll(list);
    }

    // THIS IS THE METHOD YOUR CONTROLLER CALLS
    public void insertActivity(
            String clientName,
            String ip,
            String userAgent,
            String path,
            Timestamp ts
    ) {
        UserActivity ua = new UserActivity();
        ua.setClientName(clientName);
        ua.setIp(ip);
        ua.setUserAgent(userAgent);
        ua.setPath(path);
        LocalDateTime start = ts.toLocalDateTime();
        LocalDateTime end =ts.toLocalDateTime();
        ua.setStartTime(start);
        ua.setEndTime(end);
        ua.setDurationSeconds(0);

        repo.save(ua);
    }

//    public List<UserActivity> getAllByClient(String clientName) {
//        return repo.findByClientName(clientName);
//    }
}
