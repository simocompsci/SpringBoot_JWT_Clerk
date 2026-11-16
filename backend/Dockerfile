
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app

COPY pom.xml ./
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q -DskipTests package


# ==========================================
# RUNTIME STAGE
# ==========================================
FROM eclipse-temurin:25-jre-alpine AS runtime
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring

# Copy Spring Boot JAR
COPY --from=build /app/target/backend-*.jar app.jar

# Copy AWS RDS CA certificate
RUN mkdir -p /app/certs
COPY certifs/global-bundle.pem /app/certs/global-bundle.pem

RUN chown -R spring:spring /app

USER spring:spring

EXPOSE 8081

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
