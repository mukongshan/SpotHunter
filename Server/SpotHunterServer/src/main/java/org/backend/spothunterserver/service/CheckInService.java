package org.backend.spothunterserver.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import org.backend.spothunterserver.dto.AdminCheckInItem;
import org.backend.spothunterserver.dto.CheckInHistoryItem;
import org.backend.spothunterserver.entity.CheckIn;
import org.backend.spothunterserver.entity.Spot;
import org.backend.spothunterserver.entity.User;
import org.backend.spothunterserver.repository.CheckInRepository;
import org.backend.spothunterserver.repository.SpotRepository;
import org.backend.spothunterserver.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CheckInService {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss", Locale.CHINA);

    private final CheckInRepository checkInRepository;
    private final UserRepository userRepository;
    private final SpotRepository spotRepository;

    public CheckInService(CheckInRepository checkInRepository,
                          UserRepository userRepository,
                          SpotRepository spotRepository) {
        this.checkInRepository = checkInRepository;
        this.userRepository = userRepository;
        this.spotRepository = spotRepository;
    }

    @Transactional
    public CheckInResult checkIn(Long userId, Long spotId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
        Spot spot = spotRepository.findById(spotId)
                .orElseThrow(() -> new IllegalArgumentException("景点不存在"));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        boolean alreadyChecked =
                checkInRepository.existsByUser_IdAndSpot_IdAndCreateTimeBetween(userId, spotId, startOfDay, endOfDay);
        if (alreadyChecked) {
            throw new IllegalStateException("今天已经打过卡啦，换个景点试试");
        }

        CheckIn checkIn = new CheckIn();
        checkIn.setUser(user);
        checkIn.setSpot(spot);
        checkInRepository.save(checkIn);

        int delta = spot.getScore();
        user.setScore(user.getScore() + delta);
        userRepository.save(user);
        return new CheckInResult(user.getScore(), delta);
    }

    @Transactional(readOnly = true)
    public List<CheckInHistoryItem> history(Long userId) {
        return checkInRepository.findTop100ByUser_IdOrderByCreateTimeDesc(userId).stream()
                .map(this::toHistoryItem)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminCheckInItem> adminList() {
        return checkInRepository.findTop100ByOrderByCreateTimeDesc().stream()
                .map(this::toAdminItem)
                .collect(Collectors.toList());
    }

    private CheckInHistoryItem toHistoryItem(CheckIn checkIn) {
        return new CheckInHistoryItem(
                checkIn.getId(),
                checkIn.getSpot().getName(),
                checkIn.getCreateTime().format(FORMATTER),
                checkIn.getSpot().getImage()
        );
    }

    private AdminCheckInItem toAdminItem(CheckIn checkIn) {
        return new AdminCheckInItem(
                checkIn.getId(),
                checkIn.getUser().getUsername(),
                checkIn.getSpot().getName(),
                checkIn.getCreateTime().format(FORMATTER)
        );
    }
}

