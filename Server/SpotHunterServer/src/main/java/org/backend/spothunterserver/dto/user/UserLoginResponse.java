package org.backend.spothunterserver.dto.user;

public record UserLoginResponse(Long id, String username, Integer score, String avatar) {
}

