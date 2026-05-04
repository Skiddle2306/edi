package com.example.Server.Repositories;

import com.example.Server.Models.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByClientNameOrderByTriggeredAtDesc(String clientName);
    List<Alert> findByPriority(Alert.AlertPriority priority);

    @Query("SELECT a FROM Alert a WHERE a.triggeredAt >= :since AND a.relatedIp = :ip")
    List<Alert> findRecentByIp(@Param("ip") String ip, @Param("since") LocalDateTime since);
}