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
    private final AlertService alertService;
    public UserActivityService(UserActivityRepository repo, AlertService alertService) {
        this.repo = repo;
        this.alertService = alertService;
    }


    public void saveAll(String clientName, List<UserActivity> list) {
        System.out.println("hi");
        for (UserActivity ua : list) {
            ua.setClientName(clientName);
            System.out.println(ua.getUserAgent());
            System.out.println("Analysis data");// ensure client tagging
            alertService.analyze(
            clientName,
            ua.getIp(),
            ua.getUserAgent(),
            ua.getPath()
        );
            System.out.println("Analysed data");
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
        alertService.analyze(clientName, ip, userAgent, path);
    }

//    public List<UserActivity> getAllByClient(String clientName) {
//        return repo.findByClientName(clientName);
//    }
}
