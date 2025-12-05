package com.example.Server.Repositories;

import com.example.Server.Models.ResourceUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceUsageRepository extends JpaRepository<ResourceUsage, Long> {}
