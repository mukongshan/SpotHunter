package org.backend.spothunterserver.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.backend.spothunterserver.entity.CheckIn;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CheckInRepository extends JpaRepository<CheckIn, Long> {

    boolean existsByUser_IdAndSpot_IdAndCreateTimeBetween(Long userId, Long spotId, LocalDateTime start,
                                                          LocalDateTime end);

    List<CheckIn> findTop100ByUser_IdOrderByCreateTimeDesc(Long userId);

    List<CheckIn> findByOrderByCreateTimeDesc();
}

