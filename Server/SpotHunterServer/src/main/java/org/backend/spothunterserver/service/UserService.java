package org.backend.spothunterserver.service;

import org.backend.spothunterserver.dto.user.UserInfoResponse;
import org.backend.spothunterserver.dto.user.UserLoginRequest;
import org.backend.spothunterserver.dto.user.UserLoginResponse;
import org.backend.spothunterserver.dto.user.UserRegisterRequest;
import org.backend.spothunterserver.entity.User;
import org.backend.spothunterserver.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    public UserLoginResponse login(UserLoginRequest request) {
    String username = request.username();
    String password = request.password();

    if (username == null || username.isBlank()) {
        throw new IllegalArgumentException("用户名不能为空");
    }
    if (password == null || password.isBlank()) {
        throw new IllegalArgumentException("密码不能为空");
    }

    // 查找用户（推荐忽略大小写）
    String trimmedUsername = username.trim();
    User user = userRepository.findByUsernameIgnoreCase(trimmedUsername)
            .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

    // 校验密码
    if (!passwordEncoder.matches(password, user.getPassword())) {
        throw new IllegalArgumentException("密码错误");
    }

    // 构造头像（模拟，可根据需求调整）
    String avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.getId();

    return new UserLoginResponse(user.getId(), user.getUsername(), user.getScore(), avatarUrl);
}

    public UserLoginResponse register(UserRegisterRequest request) {
    String username = request.username();
    String password = request.password();
    // 1. 检查用户名是否存在
    if (userRepository.existsByUsername(username)) {
        throw new RuntimeException("用户名已存在");
    }

    // 2. 加密密码
    String encodedPassword = passwordEncoder.encode(password);

    // 3. 构建用户实体并保存
    User newUser = new User();
    newUser.setUsername(username);
    newUser.setPassword(encodedPassword);
    newUser.setScore(0); // 初始积分
    newUser.setAvatar(null); // 默认无头像
    User savedUser = userRepository.save(newUser);

    // 4. 返回登录响应格式
    return new UserLoginResponse(savedUser.getId(), savedUser.getUsername(), savedUser.getScore(), savedUser.getAvatar());
}

    public UserInfoResponse getUserInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
        return new UserInfoResponse(user.getId(), user.getUsername(), user.getScore());
    }
}