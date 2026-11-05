package com.example.backend.DTO;

import java.math.BigDecimal;

public record CourseAverageDTO(
        String code,
        String name,
        Integer semester,
        BigDecimal average
) {}