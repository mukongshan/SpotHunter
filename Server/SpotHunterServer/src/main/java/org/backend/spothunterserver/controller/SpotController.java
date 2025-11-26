package org.backend.spothunterserver.controller;

import org.backend.spothunterserver.dto.common.ApiResponse;
import org.backend.spothunterserver.entity.Spot;
import org.backend.spothunterserver.service.SpotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/spot")
@CrossOrigin(origins = "*")
public class SpotController {

    @Autowired
    private SpotService spotService;

    @GetMapping("/list")
    public ApiResponse<List<Spot>> list() {
        List<Spot> spots = spotService.getAllSpots();
        return ApiResponse.success(spots);
    }
}