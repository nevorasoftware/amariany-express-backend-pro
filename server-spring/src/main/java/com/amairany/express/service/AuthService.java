package com.amairany.express.service;

import com.amairany.express.dto.LoginResponse;
import com.amairany.express.model.User;
import com.amairany.express.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Value("${admin.email:admin@amairanyexpress.sv}")
    private String defaultAdminEmail;

    @Value("${admin.password:admin123}")
    private String defaultAdminPassword;

    public LoginResponse login(String email, String password) {
        if (email == null || password == null) {
            throw new IllegalArgumentException("Email y contraseña requeridos");
        }

        String trimmedEmail = email.trim().toLowerCase();

        // Verificar en DB
        Optional<User> userOpt = userRepository.findByEmail(trimmedEmail);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(password)) {
                String token = "jwt-spring-token-" + UUID.randomUUID().toString();
                return new LoginResponse(true, token, user);
            }
        }

        // Contingencia con credenciales default
        if (trimmedEmail.equalsIgnoreCase(defaultAdminEmail) && password.equals(defaultAdminPassword)) {
            User defaultUser = new User();
            defaultUser.setEmail(defaultAdminEmail);
            defaultUser.setPassword(defaultAdminPassword);
            defaultUser.setName("Administrador Amairany");
            defaultUser.setRole("ADMIN");

            if (userOpt.isEmpty()) {
                userRepository.save(defaultUser);
            }

            String token = "jwt-spring-token-" + UUID.randomUUID().toString();
            return new LoginResponse(true, token, defaultUser);
        }

        throw new IllegalArgumentException("Credenciales inválidas");
    }
}
