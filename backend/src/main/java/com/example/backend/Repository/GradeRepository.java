package com.example.backend.Repository;

import com.example.backend.DTO.GradeResponseDTO;
import com.example.backend.Entity.Grade;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface GradeRepository extends JpaRepository<Grade, UUID> {

    @Query("""
        SELECT new com.example.backend.DTO.GradeResponseDTO(
            c.code,
            c.name,
            c.credits,
            g.examType,
            g.score,
            g.letterGrade,
            g.coefficient,
            g.semester
        )
        FROM Grade g
        JOIN g.student s
        JOIN g.course c
        WHERE s.clerkId = :clerkId
        ORDER BY g.semester, c.code
    """)
    List<GradeResponseDTO> findGradesByStudentClerkId(
        @Param("clerkId") String clerkId
    );
}