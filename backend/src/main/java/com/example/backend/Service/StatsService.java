package com.example.backend.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.backend.DTO.CourseAverageDTO;
import com.example.backend.DTO.SemesterAverageDTO;
import com.example.backend.Entity.Student;
import com.example.backend.Repository.GradeRepository;

@Service
public class StatsService {

    private final GradeRepository gradeRepository;

    public StatsService(GradeRepository gradeRepository) {
        this.gradeRepository = gradeRepository;
    }

    public List<CourseAverageDTO> getCoursesAverage(Student student) {

        return gradeRepository.findCoursesAverageByClerkId(student.getClerkId());
    }

    public List<SemesterAverageDTO> getSemesterAverage(Student student) {

        return gradeRepository.findSemesterAveragesByClerkId(student.getClerkId());
    }
}