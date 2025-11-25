package org.backend.spothunterserver.dto;

import jakarta.validation.constraints.NotBlank;

public record UserLoginRequest(@NotBlank(message = "用户名不能为空") String username) {
}

