package com.example.backend.Repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.Entity.Grade;

public interface GradesRepository  extends JpaRepository<Grade , UUID>{

    
} 