package org.backend.spothunterserver.controller;

import jakarta.validation.Valid;
import java.util.List;

import org.backend.spothunterserver.dto.common.ApiResponse;
import org.backend.spothunterserver.dto.checkin.CheckInHistoryItem;
import org.backend.spothunterserver.dto.checkin.CheckInRequest;
import org.backend.spothunterserver.dto.checkin.CheckInResponse;
import org.backend.spothunterserver.service.CheckInService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/checkin")
@CrossOrigin(origins = "*")
public class CheckInController {

    @Autowired
    private CheckInService checkInService;

    @PostMapping
    public ApiResponse<CheckInResponse> checkIn(@Valid @RequestBody CheckInRequest request) {
        var result = checkInService.checkIn(request);
        String msg = "打卡成功！积分 +" + result.deltaScore();
        return ApiResponse.success(msg, new CheckInResponse(result.newScore()));
    }

    @GetMapping("/my-history")
    public ApiResponse<List<CheckInHistoryItem>> myHistory(@RequestParam Long userId) {
        return ApiResponse.success(checkInService.history(userId));
    }
}

