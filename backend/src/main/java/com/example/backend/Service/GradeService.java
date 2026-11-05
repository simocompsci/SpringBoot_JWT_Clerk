package com.example.backend.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.backend.DTO.GradeResponseDTO;
import com.example.backend.Entity.Student;
import com.example.backend.Repository.GradeRepository;

@Service
public class GradeService {

    private final GradeRepository gradeRepository;

    public GradeService(GradeRepository gradeRepository) {
        this.gradeRepository = gradeRepository;
    }

    public List<GradeResponseDTO> getStudentGrades(Student student) {

        return gradeRepository.findGradesByStudentClerkId(student.getClerkId());
    }

}
