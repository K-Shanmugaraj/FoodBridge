package com.foodbridge.controller;

import com.foodbridge.dto.AuthResponse;
import com.foodbridge.dto.LoginRequest;
import com.foodbridge.dto.RegisterUserRequest;
import com.foodbridge.dto.UserResponse;
import com.foodbridge.entity.User;
import com.foodbridge.exception.InvalidOperationException;
import com.foodbridge.repository.UserRepository;
import com.foodbridge.security.JwtService;
import com.foodbridge.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            UserService userService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new InvalidOperationException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidOperationException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);
        UserResponse userResponse = new UserResponse(
                user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getCreatedAt()
        );
        return ResponseEntity.ok(new AuthResponse(token, "Bearer", userResponse));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterUserRequest request) {
        UserResponse created = userService.register(request);
        User user = userRepository.findById(created.id()).orElseThrow();
        String token = jwtService.generateToken(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(token, "Bearer", created));
    }
}

