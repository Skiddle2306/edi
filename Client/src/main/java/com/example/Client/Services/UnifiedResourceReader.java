package com.example.Client.Services;

import com.example.Client.Models.ResourceUsage;
import org.springframework.stereotype.Service;
import oshi.hardware.CentralProcessor;
import oshi.SystemInfo;
import oshi.hardware.CentralProcessor;
import oshi.hardware.GlobalMemory;
import oshi.software.os.OSFileStore;
import oshi.software.os.OperatingSystem;
import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDateTime;

@Service
public class UnifiedResourceReader {
    private SystemInfo si;
    private  CentralProcessor cpu ;
    public ResourceUsage readUsage() throws InterruptedException{
         si= new SystemInfo();
         cpu = si.getHardware().getProcessor();
        double cpu1 = readCpuUsage();
        long[] ram = readRamUsage();
        long[] disk = readDiskUsage();

        return new ResourceUsage(
                cpu1,
                ram[0],     // total
                ram[1],     // used
                disk[0],    // total
                disk[1],    // used
                LocalDateTime.now()
        );
    }

    // -------------------------------------------------------
    // CPU USAGE
    // -------------------------------------------------------
    private double readCpuUsage() throws InterruptedException{
        try {

        int cpuCores=cpu.getLogicalProcessorCount();
        long[] prevTicks = cpu.getSystemCpuLoadTicks();
        Thread.sleep(1000);
        long[] ticks = cpu.getSystemCpuLoadTicks();
        double cpuUsage = cpu.getSystemCpuLoadBetweenTicks(prevTicks) * 100;
                return cpuUsage;
        } catch (Exception ignored) {}

        return 0.0;
    }

    // -------------------------------------------------------
    // RAM USAGE
    // -------------------------------------------------------
    private long[] readRamUsage() {
        long total = 0;
        long used = 0;

        try {
            GlobalMemory memory = si.getHardware().getMemory();
        total = memory.getTotal();
        long availableMem = memory.getAvailable();
        used = total - availableMem;
        } catch (Exception ignored) {}

        return new long[]{total, used};
    }

    // -------------------------------------------------------
    // DISK USAGE
    // -------------------------------------------------------
    private long[] readDiskUsage() {
        long total = 0;
        long used = 0;

        try {
            Process p = Runtime.getRuntime().exec("df -B1 /");
            BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream()));

            br.readLine(); // skip header
            String line = br.readLine();
            if (line != null) {
                // Example:
                // /dev/sda1  100000000000 40000000000 60000000000 40% /
                String[] parts = line.split("\\s+");

                total = Long.parseLong(parts[1]);
                used = Long.parseLong(parts[2]);
            }

        } catch (Exception ignored) {}

        return new long[]{total, used};
    }
}
