package org.backend.spothunterserver.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "spot")
@Getter
@Setter
public class Spot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String name;

    @Column(length = 512)
    private String intro;

    @Column(length = 255)
    private String image;

    @Column(nullable = false, columnDefinition = "DECIMAL(10,6)")
    private BigDecimal latitude;

    @Column(nullable = false, columnDefinition = "DECIMAL(10,6)")
    private BigDecimal longitude;

    @Column(nullable = false)
    private Integer score = 10;

}

