package org.backend.spothunterserver.controller;

import org.backend.spothunterserver.dto.common.ApiResponse;
import org.backend.spothunterserver.dto.user.UserInfoResponse;
import org.backend.spothunterserver.dto.user.UserLoginRequest;
import org.backend.spothunterserver.dto.user.UserLoginResponse;
import org.backend.spothunterserver.dto.user.UserRegisterRequest;
import org.backend.spothunterserver.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // 用户登录
    @PostMapping("/login")
    public ApiResponse<UserLoginResponse> login(@RequestBody UserLoginRequest request) {
        UserLoginResponse response = userService.login(request);
        return ApiResponse.success(response);
    }

    // 👇 在 UserController 类中添加以下方法

@PostMapping("/register")
public ApiResponse<UserLoginResponse> register(@RequestBody UserRegisterRequest request) {
    UserLoginResponse registeredUser = userService.register(request);
    return ApiResponse.success(registeredUser);
}

    // 获取用户信息
    @GetMapping("/info")
    public ApiResponse<UserInfoResponse> getUserInfo(@RequestParam Long userId) {
        UserInfoResponse userInfo = userService.getUserInfo(userId);
        return ApiResponse.success(userInfo);
    }
}