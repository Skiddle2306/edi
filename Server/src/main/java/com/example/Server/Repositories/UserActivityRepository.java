package com.example.Server.Repositories;

import com.example.Server.Models.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {
    @Query("SELECT MAX(u.startTime) FROM UserActivity u WHERE u.clientName = :clientName")
    LocalDateTime findLastStartTimeByClient(@Param("clientName") String clientName);
}
