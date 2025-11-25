package org.backend.spothunterserver.repository;

import org.backend.spothunterserver.entity.Spot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpotRepository extends JpaRepository<Spot, Long> {
}

