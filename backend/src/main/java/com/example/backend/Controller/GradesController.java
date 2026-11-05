package com.example.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.DTO.GradeResponseDTO;
import com.example.backend.Entity.Student;
import com.example.backend.Service.GradeService;

@RequestMapping("/api/v1")
@RestController
public class GradesController {

    private final GradeService gradeService;

    public GradesController(GradeService gradeService) {
        this.gradeService = gradeService;
    }

    @GetMapping("/grades")
    public ResponseEntity<List<GradeResponseDTO>> getStudentGrades(@AuthenticationPrincipal Student student) {

        List<GradeResponseDTO> grades = gradeService.getStudentGrades(student);

        return ResponseEntity.ok(grades);
    }

}
