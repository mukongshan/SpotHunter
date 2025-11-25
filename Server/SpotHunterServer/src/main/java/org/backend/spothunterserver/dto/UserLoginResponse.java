package org.backend.spothunterserver.dto;

public record UserLoginResponse(Long id, String username, Integer score, String avatar) {
}

