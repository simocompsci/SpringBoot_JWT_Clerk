package com.example.backend.DTO;

import java.math.BigDecimal;

public record SemesterAverageDTO(
        Integer semester,
        BigDecimal average
) {}