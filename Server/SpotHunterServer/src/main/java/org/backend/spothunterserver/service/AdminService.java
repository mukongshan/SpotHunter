package org.backend.spothunterserver.service;

import org.backend.spothunterserver.dto.checkin.AdminCheckInItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private CheckInService checkInService;

    public List<AdminCheckInItem> getAllCheckInRecords(){
        return checkInService.adminList();
    };
}