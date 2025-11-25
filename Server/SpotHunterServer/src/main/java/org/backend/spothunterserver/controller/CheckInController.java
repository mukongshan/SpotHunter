package org.backend.spothunterserver.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.backend.spothunterserver.dto.AdminCheckInItem;
import org.backend.spothunterserver.dto.ApiResponse;
import org.backend.spothunterserver.dto.CheckInHistoryItem;
import org.backend.spothunterserver.dto.CheckInRequest;
import org.backend.spothunterserver.dto.CheckInResponse;
import org.backend.spothunterserver.service.CheckInService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CheckInController {

    private final CheckInService checkInService;

    public CheckInController(CheckInService checkInService) {
        this.checkInService = checkInService;
    }

    @PostMapping("/checkin")
    public ApiResponse<CheckInResponse> checkIn(@Valid @RequestBody CheckInRequest request) {
        var result = checkInService.checkIn(request.userId(), request.spotId());
        String msg = "打卡成功！积分 +" + result.deltaScore();
        return ApiResponse.success(msg, new CheckInResponse(result.newScore()));
    }

    @GetMapping("/checkin/my-history")
    public ApiResponse<List<CheckInHistoryItem>> myHistory(@RequestParam Long userId) {
        return ApiResponse.success(checkInService.history(userId));
    }

    @GetMapping("/admin/checkin/all")
    public ApiResponse<List<AdminCheckInItem>> adminHistory() {
        return ApiResponse.success(checkInService.adminList());
    }
}

