package com.example.backend.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.Service.StatsService;

@RestController 
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService){
        this.statsService = statsService;
    }

    public ResponseEntity<Void> getCourseAverage(){
        return null;
    }

    public ResponseEntity<Void> getSemesterAverage(){
        return null;
    }
    
}
