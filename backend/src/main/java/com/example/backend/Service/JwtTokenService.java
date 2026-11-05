package com.example.backend.Service;

import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;

@Service
public class JwtTokenService {

    private static final String KEY_SOURCE = "CLERK_JWT_PUBLIC_KEY";

    private final PublicKey publicKey;
    private final String issuer;
    private final String audience;

    public JwtTokenService(
            @Value("${clerk.jwt.public-key}") String publicKeyPem,
            @Value("${clerk.jwt.issuer}") String issuer,
            @Value("${clerk.jwt.audience}") String audience) {

        this.publicKey = parsePublicKey(publicKeyPem);
        this.issuer = issuer;
        this.audience = audience;

    }

    private PublicKey parsePublicKey(String publicKeyPem) {
        if (publicKeyPem == null || publicKeyPem.isBlank()) {
            throw new IllegalStateException(
                    "Could not load Clerk JWT public key: " + KEY_SOURCE
                            + " is empty. Set it in backend/.env.");
        }

        String key = publicKeyPem
                .replace("\\n", "\n")
                .replaceAll("-----(BEGIN|END)[^-]*-----", "")
                .replaceAll("\\s", "")
                .replaceAll("^\"|\"$", "");

        if (key.isEmpty()) {
            throw new IllegalStateException(
                    "Could not load Clerk JWT public key: " + KEY_SOURCE
                            + " contained no key material after removing the PEM "
                            + "header/footer. Set it in backend/.env as a single "
                            + "line with no surrounding quotes.");
        }

        byte[] decodedKey;

        try {
            decodedKey = Base64.getDecoder().decode(key);

        } catch (IllegalArgumentException e) {
            throw new IllegalStateException(
                    "Could not load Clerk JWT public key: " + KEY_SOURCE
                            + " is not valid base64. backend/.env is parsed as a Java "
                            + ".properties file, which does not support quoted "
                            + "multi-line values, so the key must be written on one "
                            + "line.",
                    e);
        }

        try {
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decodedKey);

            KeyFactory keyFactory = KeyFactory.getInstance("RSA");

            return keyFactory.generatePublic(keySpec);

        } catch (Exception e) {
            throw new IllegalStateException(
                    "Could not load Clerk JWT public key: " + KEY_SOURCE
                            + " is not a valid X.509 RSA public key.",
                    e);
        }
    }

    public Claims validateAndParse(String token) throws JwtException {
        return Jwts.parser()
                .verifyWith(publicKey)
                // .requireIssuer(issuer)
                // .requireAudience(audience)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractClerkUserId(String token) {
        return validateAndParse(token).getSubject();
    }
}