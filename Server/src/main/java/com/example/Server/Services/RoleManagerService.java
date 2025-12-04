package com.example.Server.Services;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoleManagerService {

    private final JdbcTemplate jdbc;

    public RoleManagerService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    public void registerNewClient(String clientName, String password) {

        // additional safeguard
        if (!clientName.matches("^[a-zA-Z0-9_-]{3,40}$")) {
            throw new IllegalArgumentException("Invalid client name");
        }

        // Escape single quotes in password
        String safePassword = password.replace("'", "''");

        // 1️⃣ Create role if not exists
        String createRole = """
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '%s') THEN
                    EXECUTE 'CREATE ROLE %s LOGIN PASSWORD ''%s''';
                END IF;
            END$$;
            """.formatted(clientName, clientName, safePassword);

        jdbc.execute(createRole);

        // 2️⃣ Create system_metrics table
        String sqlCreateSystem = """
            CREATE TABLE IF NOT EXISTS system_metrics (
              id SERIAL PRIMARY KEY,
              client_name VARCHAR NOT NULL,
              timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
              cpu_usage DOUBLE PRECISION,
              cpu_cores INT,
              total_ram BIGINT,
              used_ram BIGINT,
              disk_name VARCHAR,
              disk_size BIGINT,
              disk_used BIGINT
            );
            """;

        jdbc.execute(sqlCreateSystem);

        // 3️⃣ Create user_activity table
        String sqlCreateUser = """
            CREATE TABLE IF NOT EXISTS user_activity (
              id SERIAL PRIMARY KEY,
              client_name VARCHAR NOT NULL,
              ip VARCHAR,
              user_agent TEXT,
              path TEXT,
              start_time TIMESTAMP,
              end_time TIMESTAMP,
              duration_seconds INT,
              created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
            """;

        jdbc.execute(sqlCreateUser);

        // 4️⃣ Grant privileges
        jdbc.execute("GRANT INSERT ON system_metrics TO " + clientName);
        jdbc.execute("GRANT INSERT ON user_activity TO " + clientName);
        jdbc.execute("GRANT USAGE ON SCHEMA public TO " + clientName);
    }
}
