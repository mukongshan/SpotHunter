package org.backend.spothunterserver.controller;

import org.backend.spothunterserver.dto.checkin.AdminCheckInItem;
import org.backend.spothunterserver.dto.common.ApiResponse;
import org.backend.spothunterserver.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // 管理员获取所有打卡记录（可分页、可筛选）
    @GetMapping("/checkin")
    public ApiResponse<List<AdminCheckInItem>> getAllCheckIns() {
        List<AdminCheckInItem> checkIns = adminService.getAllCheckInRecords();
        return ApiResponse.success(checkIns);
    }
}