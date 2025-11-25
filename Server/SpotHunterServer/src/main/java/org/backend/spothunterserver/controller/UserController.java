package org.backend.spothunterserver.controller;

import jakarta.validation.Valid;
import org.backend.spothunterserver.dto.ApiResponse;
import org.backend.spothunterserver.dto.UserInfoResponse;
import org.backend.spothunterserver.dto.UserLoginRequest;
import org.backend.spothunterserver.dto.UserLoginResponse;
import org.backend.spothunterserver.entity.User;
import org.backend.spothunterserver.repository.UserRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ApiResponse<UserLoginResponse> login(@Valid @RequestBody UserLoginRequest request) {
        String username = request.username().trim();
        if (username.isBlank()) {
            throw new IllegalArgumentException("用户名不能为空");
        }
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setUsername(username);
                    newUser.setScore(0);
                    return userRepository.save(newUser);
                });
        String avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.getId();
        UserLoginResponse response = new UserLoginResponse(user.getId(), user.getUsername(), user.getScore(), avatarUrl);
        return ApiResponse.success("登录成功", response);
    }

    @GetMapping("/info")
    public ApiResponse<UserInfoResponse> info(@RequestParam Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
        return ApiResponse.success(new UserInfoResponse(user.getId(), user.getUsername(), user.getScore()));
    }
}

