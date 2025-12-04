package com.example.Client.Repositories;


import com.example.Client.Models.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {}
