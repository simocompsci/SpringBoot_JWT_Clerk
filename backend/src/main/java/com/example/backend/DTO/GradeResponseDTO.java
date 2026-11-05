package com.example.backend.DTO;

import java.math.BigDecimal;

import com.example.backend.enums.ExamType;

public record GradeResponseDTO(
    String code,
    String name,
    Integer credits,
    ExamType examType,
    BigDecimal score,
    String letterGrade,
    BigDecimal coefficient,
    Integer semester
) {}