
package com.example.backend.Config;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.backend.Entity.Student;
import com.example.backend.Repository.StudentRepository;
import com.example.backend.Service.JwtTokenService;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenService tokenService;
    private final StudentRepository studentRepo;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain)
            throws IOException, ServletException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            String clerkId = tokenService.extractClerkUserId(token);

            Optional<Student> maybeStudent = studentRepo.findByClerkId(clerkId);

            if (maybeStudent.isEmpty()) {
                reject(response, "No local user record for this token");
                return;
            }

            Student student = maybeStudent.get();

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    student,
                    null,
                    List.of());

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request));

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

            chain.doFilter(request, response);

        } catch (JwtException | IllegalArgumentException e) {
            reject(response, "Invalid or expired token");
        }
    }

    private void reject(
            HttpServletResponse response,
            String message) throws IOException {

        SecurityContextHolder.clearContext();

        response.sendError(
                HttpStatus.UNAUTHORIZED.value(),
                message);
    }
}
