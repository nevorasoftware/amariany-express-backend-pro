package com.amairany.express.config;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isEmpty()) {
            databaseUrl = System.getenv("POSTGRES_URL");
        }

        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            try {
                // Reemplazar postgres:// por postgresql:// si viene en formato Railway / Heroku
                if (databaseUrl.startsWith("postgres://")) {
                    databaseUrl = databaseUrl.replace("postgres://", "postgresql://");
                }

                URI dbUri = new URI(databaseUrl);

                String username = "";
                String password = "";
                if (dbUri.getUserInfo() != null) {
                    String[] userInfo = dbUri.getUserInfo().split(":");
                    username = userInfo[0];
                    if (userInfo.length > 1) {
                        password = userInfo[1];
                    }
                }

                int port = dbUri.getPort() == -1 ? 5432 : dbUri.getPort();
                String jdbcUrl = "jdbc:postgresql://" + dbUri.getHost() + ":" + port + dbUri.getPath();

                return DataSourceBuilder.create()
                        .driverClassName("org.postgresql.Driver")
                        .url(jdbcUrl)
                        .username(username)
                        .password(password)
                        .build();

            } catch (URISyntaxException e) {
                System.err.println("⚠️ Error parseando DATABASE_URL de Railway, usando valores por defecto: " + e.getMessage());
            }
        }

        // Fallback a las propiedades normales de application.properties
        String defaultUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (defaultUrl == null || defaultUrl.isEmpty()) {
            defaultUrl = "jdbc:postgresql://localhost:5432/amairany_db";
        }
        String defaultUser = System.getenv("SPRING_DATASOURCE_USERNAME") != null ? System.getenv("SPRING_DATASOURCE_USERNAME") : "postgres";
        String defaultPass = System.getenv("SPRING_DATASOURCE_PASSWORD") != null ? System.getenv("SPRING_DATASOURCE_PASSWORD") : "postgres";

        return DataSourceBuilder.create()
                .driverClassName("org.postgresql.Driver")
                .url(defaultUrl)
                .username(defaultUser)
                .password(defaultPass)
                .build();
    }
}
