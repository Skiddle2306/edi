package com.example.Server.Services;

import com.example.Server.DTO.ResourceUsageDTO;
import com.example.Server.Models.ResourceUsage;
import com.example.Server.Repositories.ResourceUsageRepository;
import org.springframework.stereotype.Service;

@Service
public class ResourceUsageService {

    private final ResourceUsageRepository repo;

    public ResourceUsageService(ResourceUsageRepository repo) {
        this.repo = repo;
    }

    public void saveUsage(String clientName, ResourceUsageDTO dto) {
        ResourceUsage entity = new ResourceUsage();
        entity.setClientName(clientName);
        entity.setCpuUsage(dto.getCpuUsage());
        entity.setTotalRam(dto.getTotalRam());
        entity.setUsedRam(dto.getUsedRam());
        entity.setTimestamp(dto.getTimestamp());
        entity.setDiskSize(dto.getDiskTotal());


        repo.save(entity);
    }
}
