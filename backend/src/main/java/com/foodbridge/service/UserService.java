package com.foodbridge.service;

import com.foodbridge.dto.RegisterUserRequest;
import com.foodbridge.dto.UserResponse;
import com.foodbridge.entity.Role;
import com.foodbridge.entity.User;
import com.foodbridge.exception.DuplicateEmailException;
import com.foodbridge.exception.InvalidOperationException;
import com.foodbridge.exception.ResourceNotFoundException;
import com.foodbridge.repository.UserRepository;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse register(RegisterUserRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException("An account with this email already exists");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        User current = getCurrentAuthenticatedUser();
        if (current.getRole() != Role.ADMIN && !current.getId().equals(id)) {
            throw new InvalidOperationException("You are not authorized to access another user's profile");
        }
        return toResponse(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id)));
    }

    @Transactional
    public void deleteUser(Long id) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        User current = getCurrentAuthenticatedUser();
        if (current.getId().equals(target.getId())) {
            throw new InvalidOperationException("Admins cannot delete their own account");
        }
        userRepository.delete(target);
    }

    public User getCurrentAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new InvalidOperationException("Unauthenticated request");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}