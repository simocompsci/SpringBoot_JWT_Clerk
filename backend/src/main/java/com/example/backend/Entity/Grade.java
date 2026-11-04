package com.example.backend.Entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "grades",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_student_course_assessment",
            columnNames = {
                "student_id",
                "course_id",
                "academic_year",
                "semester",
                "exam_type"
            }
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @DecimalMin("0.00")
    @DecimalMax("20.00")
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal score;

    @Column(name = "letter_grade", length = 2)
    private String letterGrade;

    @Column(precision = 3, scale = 2)
    private BigDecimal coefficient = BigDecimal.ONE;

    @Enumerated(EnumType.STRING)
    @Column(name = "exam_type", nullable = false)
    private ExamType examType;

    @Column(name = "academic_year", nullable = false, length = 20)
    private String academicYear;

    @Column(nullable = false)
    private Integer semester;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "graded_at")
    private LocalDateTime gradedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}