package org.backend.spothunterserver.controller;

import java.util.List;
import org.backend.spothunterserver.dto.ApiResponse;
import org.backend.spothunterserver.entity.Spot;
import org.backend.spothunterserver.repository.SpotRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/spot")
@CrossOrigin(origins = "*")
public class SpotController {

    private final SpotRepository spotRepository;

    public SpotController(SpotRepository spotRepository) {
        this.spotRepository = spotRepository;
    }

    @GetMapping("/list")
    public ApiResponse<List<Spot>> list() {
        return ApiResponse.success(spotRepository.findAll());
    }
}

