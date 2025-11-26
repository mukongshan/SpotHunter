package org.backend.spothunterserver.service;

import java.util.List;
import org.backend.spothunterserver.entity.Spot;
import org.backend.spothunterserver.repository.SpotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SpotService {

    @Autowired
    private SpotRepository spotRepository;

    public List<Spot> getAllSpots() {
        return spotRepository.findAll();
    }
}