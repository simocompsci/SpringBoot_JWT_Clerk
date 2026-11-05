package com.example.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.DTO.CourseAverageDTO;
import com.example.backend.DTO.SemesterAverageDTO;
import com.example.backend.Entity.Student;
import com.example.backend.Service.StatsService;

@RestController
@RequestMapping("/api/v1/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/courses/average")
    public ResponseEntity<List<CourseAverageDTO>> getCoursesAverage(
            @AuthenticationPrincipal Student student) {

        List<CourseAverageDTO> averages = statsService.getCoursesAverage(student);

        return ResponseEntity.ok(averages);
    }

    @GetMapping("/semesters/average")
    public ResponseEntity<List<SemesterAverageDTO>> getSemesterAverage(
            @AuthenticationPrincipal Student student) {

        List<SemesterAverageDTO> averages = statsService.getSemesterAverage(student);

        return ResponseEntity.ok(averages);
    }
}