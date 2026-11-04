package com.example.backend.Repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.Entity.Student;



public interface  StudentRepository extends JpaRepository<Student , UUID> {
    
    Optional<Student> findByClerkId(String clerkId);
}