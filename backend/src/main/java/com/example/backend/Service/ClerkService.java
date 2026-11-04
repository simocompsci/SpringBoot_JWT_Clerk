package com.example.backend.Service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.backend.Entity.Student;
import com.example.backend.Repository.StudentRepository;

import tools.jackson.databind.JsonNode;


@Service 
public class ClerkService {

    private  final StudentRepository studentRepo;


    public ClerkService(StudentRepository studentRepo){
        this.studentRepo = studentRepo;
    }

    /**
     * Creates the local user if it does not exist.
     * Updates the local user if it already exists.
     *
     * This handles both user.created and user.updated.
     */
    public void upsertUser(JsonNode clerkUser) {

        String clerkId = clerkUser.path("id").asText();

        if (clerkId == null || clerkId.isBlank()) {
            throw new IllegalArgumentException("Clerk user ID is missing");
        }

        /*
         * Find the user's primary email.
         */
        String primaryEmail = extractPrimaryEmail(clerkUser);

        String firstName = getNullableText(clerkUser, "first_name");
        String lastName = getNullableText(clerkUser, "last_name");

        /*
         * ---------------------------------------------------------
         * Find existing local student
         * ---------------------------------------------------------
         */

        Optional<Student> existingStudent = studentRepo.findByClerkId(clerkId);

        Student student;

        if (existingStudent.isPresent()) {

            /*
             * studnet already exists.
             *
             * Update the local copy with Clerk's latest data.
             */
            student = existingStudent.get();

        } else {

            /*
             * User doesn't exist locally.
             *
             * Create it.
             */
            student = new Student();

            student.setClerkId(clerkId);
        }

        /*
         * ---------------------------------------------------------
         * Synchronize Clerk → PostgreSQL
         * ---------------------------------------------------------
         */

        student.setEmail(primaryEmail);
        student.setFirstName(firstName);
        student.setLastName(lastName);

        studentRepo.save(student);
    }

    /**
     * Deletes the local user when Clerk sends user.deleted.
     */
    public void deleteUser(JsonNode clerkUser) {

        String clerkId = clerkUser.path("id").asText();

        if (clerkId == null || clerkId.isBlank()) {
            return;
        }

        studentRepo.findByClerkId(clerkId)
                .ifPresent(studentRepo::delete);
    }

    /**
     * Extracts the primary email from Clerk's email_addresses array.
     */
    private String extractPrimaryEmail(JsonNode clerkUser) {

        String primaryEmailId = getNullableText(
                clerkUser,
                "primary_email_address_id");

        JsonNode emailAddresses = clerkUser.path("email_addresses");

        if (!emailAddresses.isArray()) {
            return null;
        }

        for (JsonNode email : emailAddresses) {

            String emailId = getNullableText(email, "id");

            if (emailId != null &&
                    emailId.equals(primaryEmailId)) {

                return getNullableText(
                        email,
                        "email_address");
            }
        }

        /*
         * Fallback in case Clerk doesn't provide a primary ID.
         */
        if (!emailAddresses.isEmpty()) {

            return getNullableText(
                    emailAddresses.get(0),
                    "email_address");
        }

        return null;
    }

    /**
     * Returns null instead of "" when a JSON property doesn't exist
     * or is explicitly null.
     */
    private String getNullableText(
            JsonNode node,
            String field) {

        JsonNode value = node.get(field);

        if (value == null || value.isNull()) {
            return null;
        }

        String text = value.asText();

        return text.isBlank() ? null : text;
    }

}