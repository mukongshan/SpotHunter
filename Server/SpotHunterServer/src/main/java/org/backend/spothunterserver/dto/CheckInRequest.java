package org.backend.spothunterserver.dto;

import jakarta.validation.constraints.NotNull;

public record CheckInRequest(
        @NotNull(message = "userId 不能为空") Long userId,
        @NotNull(message = "spotId 不能为空") Long spotId,
        Double latitude,
        Double longitude
) {
}

