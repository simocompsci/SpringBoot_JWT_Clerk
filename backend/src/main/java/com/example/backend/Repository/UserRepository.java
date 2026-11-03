package com.example.backend.Repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.Entity.User;


public interface  UserRepository extends JpaRepository<User , UUID> {
    
    Optional<User> findByClerkId(String clerkId);
}