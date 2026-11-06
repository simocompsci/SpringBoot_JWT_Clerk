# Student Portal Authentication

A complete example of authentication and identity synchronization using:

- **Clerk** as the identity provider
- **Next.js App Router** for the frontend and route protection
- **Spring Boot** as a stateless JWT-protected REST API
- **PostgreSQL** for local application data
- **Clerk webhooks + Svix** to keep Clerk users and local students in sync

The student portal itself (grades, averages, course cards) is only the demo
domain. The authentication architecture is independent of that domain and can
be reused in another application.

> **Never commit real credentials.** Both `frontend/.env*` and `backend/.env*`
> are gitignored. The values shown in this README are placeholders. If you
> received this repository with local `.env` files, replace the keys with the
> ones from your own Clerk instance and database before running it.

---

## 1. Architecture

### High-level view

```text
                           ┌──────────────────────────────┐
                           │            Clerk             │
                           │  sign-in / sign-up / session │
                           │  JWT issuer + user directory │
                           └──────────────┬───────────────┘
                                          │
                    1. Browser authenticates with Clerk
                                          │
                                          ▼
┌──────────────┐   2. Clerk session   ┌──────────────────────────────┐
│   Browser    │◄────────────────────►│        Next.js :3000         │
│              │                      │  ClerkProvider, <SignIn>,    │
│              │                      │  <UserButton>, proxy.ts      │
└──────┬───────┘                      └──────────────┬───────────────┘
       │                                             │
       │ 3. API request                              │
       │ Authorization: Bearer <Clerk session JWT>   │
       ▼                                             │
┌────────────────────────────────────────────────────┼───────────────┐
│                  Spring Boot API :8081             │               │
│                                                    │               │
│  JwtAuthenticationFilter ──► JwtTokenService                         │
│       │                         verifies JWT                         │
│       │                         extracts `sub`                       │
│       ▼                                                              │
│  StudentRepository.findByClerkId(sub)                               │
│       │                                                              │
│       ▼                                                              │
│  SecurityContext principal = Student                                │
│       │                                                              │
│       ▼                                                              │
│  Controllers ──► Services ──► JPA Repositories                      │
└────────────────────────────────────────────────────┬────────────────┘
                                                     │
                                                     ▼
                                        ┌──────────────────────────┐
                                        │ PostgreSQL :5432         │
                                        │ database: student_portal │
                                        │ table: students          │
                                        │ (plus courses/grades)    │
                                        └──────────────────────────┘

Clerk ── webhook (user.created / user.updated / user.deleted) ──►
        POST http://localhost:8081/api/webhooks/clerk
```

### The important trust boundary

- **Clerk owns identity**: passwords, email verification, sessions, and social
  login are handled by Clerk. This application does **not** store passwords and
  does **not** expose a backend login endpoint.
- **Next.js protects pages**: `proxy.ts` uses Clerk middleware to require a
  session before `/workspace` pages render.
- **Spring Boot independently protects the API**: every API request must carry a
  valid Clerk-issued JWT. The backend does not trust the frontend alone.
- **PostgreSQL stores a local mirror of the Clerk user** in the `students`
  table. The `clerk_id` column is the bridge between the two systems.
- **Clerk webhooks synchronize users**. There is no backend registration
  endpoint. A local `students` row is created when Clerk sends `user.created`.

### Why both middleware and JWT validation?

Clerk middleware protects the **Next.js page**. The Spring Boot filter protects
the **API**. They are separate checks:

```text
Next.js proxy.ts       → "Can this browser open /workspace?"
JwtAuthenticationFilter → "Is this API request allowed to read this student's data?"
```

Never rely only on the frontend route protection. A user could call the backend
directly, so the backend must validate the token itself.

---

## 2. Authentication flows

### 2.1 First visit and sign-up

1. The browser opens `/`.
   - `frontend/app/layout.tsx` wraps the application in `<ClerkProvider>`.
   - `frontend/app/page.tsx` uses Clerk's `<Show when="signed-out">` to display
     the **Log in** link.
2. The user clicks **Log in** and is taken to `/sign-in`.
   - `frontend/app/(auth)/sign-in/[[...sign-in]]/page.tsx` renders Clerk's
     `<SignIn>` component.
   - Clerk handles account creation, email verification, and password/social
     authentication.
   - On success, Clerk creates a session and redirects to `/workspace` through
     `fallbackRedirectUrl="/workspace"`.
3. `frontend/proxy.ts` checks the `/workspace` route.
   - `clerkMiddleware` examines the Clerk session.
   - If the user is not signed in, `auth.protect()` redirects to `/sign-in`.
   - If the user is signed in, the page request continues.
4. Clerk sends a `user.created` webhook to the backend.
   - Endpoint: `POST /api/webhooks/clerk`
   - The request contains Clerk/Svix headers:
     `svix-id`, `svix-timestamp`, and `svix-signature`.
   - `ClerkWebhookController` verifies the signature with
     `CLERK_WEBHOOK_SIGNING_SECRET`.
   - `ClerkService.upsertUser()` extracts the Clerk user ID, primary email,
     first name, and last name.
   - The user is inserted into the PostgreSQL `students` table with a unique
     `clerk_id`.
5. The browser loads the workspace.
   - A client component calls `useAuth().getToken()` from Clerk.
   - `frontend/lib/api.ts` adds `Authorization: Bearer <token>`.
   - The request goes to `NEXT_PUBLIC_API_URL` (default
     `http://localhost:8081`) under `/api/v1`.
6. Spring Boot validates the token.
   - `JwtAuthenticationFilter` reads the `Authorization` header.
   - `JwtTokenService.extractClerkUserId()` verifies the JWT signature and
     returns the `sub` claim (the Clerk user ID).
   - `StudentRepository.findByClerkId(clerkId)` loads the local student.
   - The filter puts the `Student` entity into the Spring Security context as
     the authenticated principal.
7. The controller receives the principal.
   - Controllers use `@AuthenticationPrincipal Student student`.
   - Portal queries are scoped to that student, not to an ID supplied by the
     client.
8. The API returns the student's data.

### Important first-sign-up race condition

The Clerk webhook is asynchronous. It can arrive a moment **after** the browser
has already signed in and redirected to `/workspace`.

If the browser calls the API before the `students` row exists, the backend
returns:

```text
401 Unauthorized — No local user record for this token
```

That is expected behavior with this architecture. Once the webhook has been
processed, the same request succeeds. If this happens consistently, the webhook
is misconfigured or has not been delivered.

### 2.2 Subsequent sign-ins and authenticated requests

On later visits:

1. Clerk restores the existing session from its session cookie.
2. `proxy.ts` allows the protected page if the session is valid.
3. Each frontend API call obtains a current session token with `getToken()`.
   - Clerk refreshes the token when needed.
   - The token is not stored in `localStorage` by this application.
4. The same backend flow runs for every request:
   - Validate the JWT signature.
   - Extract `sub`.
   - Find the local `Student`.
   - Set the security principal.
   - Authorize the request.
5. No new `students` row is created on every request.
6. Clerk sends `user.updated` when profile data changes. The backend updates
   the existing row.
7. Clerk sends `user.deleted` when the user is deleted. The backend removes the
   local row.

### 2.3 What happens when a token is invalid or missing

| Situation | Result |
| --- | --- |
| No `Authorization` header | Spring Security rejects the protected endpoint with `401`/`403`. |
| Header is not `Bearer ...` | The JWT filter skips authentication; the endpoint is protected, so access is denied. |
| JWT signature is invalid or expired | `JwtAuthenticationFilter` returns `401` with `Invalid or expired token`. |
| Valid Clerk token but no `students` row | `401` with `No local user record for this token`. |
| Valid token and matching row | The controller receives the `Student` principal and returns data. |
| `POST /api/webhooks/clerk` | Allowed without a user JWT, but the Svix signature must be valid. |

### 2.4 Webhook lifecycle

```text
Clerk user created  ──► user.created ──► upsert local Student
Clerk user updated  ──► user.updated ──► update local Student
Clerk user deleted  ──► user.deleted ──► delete local Student
```

`ClerkWebhookController`:

1. Verifies the Svix signature against the raw request body.
2. Parses the event type and `data` object.
3. Calls `ClerkService` for `user.created`, `user.updated`, or `user.deleted`.
4. Returns `200 OK` so Clerk does not retry successful events.
5. Returns `400 Bad Request` on verification or processing failure so Clerk can
   retry.

---

## 3. Authentication implementation map

This section highlights only the code involved in authentication. Portal
features such as grades, averages, and course cards are listed separately so
you can ignore them while studying the auth flow.

### 3.1 Frontend files required for authentication

| File | Responsibility |
| --- | --- |
| `frontend/app/layout.tsx` | Wraps the app in `<ClerkProvider>` so Clerk hooks/components work everywhere. |
| `frontend/app/(auth)/layout.tsx` | Layout for the sign-in area. |
| `frontend/app/(auth)/sign-in/[[...sign-in]]/page.tsx` | Renders Clerk `<SignIn>` and redirects to `/workspace` after sign-in. |
| `frontend/proxy.ts` | Clerk middleware. Protects `/workspace(.*)` with `auth.protect()` and sets `signInUrl`. |
| `frontend/app/page.tsx` | Public landing page. Uses `<Show when="signed-out">` and links to `/sign-in`. |
| `frontend/app/workspace/layout.tsx` | Protected workspace shell. The auth-specific part is Clerk's `<UserButton />`. |
| `frontend/lib/api.ts` | Axios client plus `getAuthHeaders()`, which obtains the Clerk token and adds `Authorization: Bearer ...`. |
| `frontend/services/Grades.ts` | Example of an authenticated API call using `getAuthHeaders()`. Portal-specific, but useful as a reference. |
| `frontend/services/Stats.ts` | Another authenticated API call example. Portal-specific. |
| `frontend/package.json` | Declares `@clerk/nextjs`, `axios`, Next.js, and React. |
| `frontend/.env` / `.env.local` | Local Clerk keys and backend URL. Never commit it. |

### 3.2 Backend files required for authentication

| File | Responsibility |
| --- | --- |
| `backend/pom.xml` | Declares Spring Security, JPA, PostgreSQL, JJWT, Svix, Lombok, and validation dependencies. |
| `backend/src/main/resources/application.properties` | Loads `backend/.env`, configures PostgreSQL, and maps Clerk settings. |
| `backend/src/main/java/com/example/backend/BackendApplication.java` | Spring Boot entry point. |
| `backend/src/main/java/com/example/backend/Config/SecurityConfig.java` | Stateless security chain, CORS, public webhook exception, and filter registration. |
| `backend/src/main/java/com/example/backend/Config/JwtAuthenticationFilter.java` | Reads the Bearer token, resolves the Clerk ID, loads the local `Student`, and sets the security principal. |
| `backend/src/main/java/com/example/backend/Service/JwtTokenService.java` | Parses the Clerk PEM public key and verifies/parses Clerk JWTs. |
| `backend/src/main/java/com/example/backend/Controller/ClerkWebhookController.java` | Public webhook endpoint. Verifies Svix signatures and dispatches user events. |
| `backend/src/main/java/com/example/backend/Service/ClerkService.java` | Creates, updates, and deletes local students from Clerk webhook payloads. |
| `backend/src/main/java/com/example/backend/Entity/Student.java` | Local user entity. `clerk_id` is the unique link to Clerk. |
| `backend/src/main/java/com/example/backend/Repository/StudentRepository.java` | `findByClerkId()` lookup used by the JWT filter and webhook service. |
| `backend/.env` | Webhook signing secret, JWT public key, issuer, and audience. Never commit it. |

### 3.3 Portal files you can ignore while studying auth

These files are part of the student grades demo, not the authentication
mechanism:

```text
backend/
  Entity/Course.java
  Entity/Grade.java
  enums/ExamType.java
  enums/StudentStatus.java
  DTO/
  Controller/GradesController.java
  Controller/StatsController.java
  Service/GradeService.java
  Service/StatsService.java
  Repository/GradeRepository.java

frontend/
  app/workspace/page.tsx
  app/workspace/grades/page.tsx
  app/workspace/_components/
  lib/types.ts
  lib/workspace.ts
```

`GradesController` and `StatsController` are still useful as examples of
`@AuthenticationPrincipal Student student`, but they are not required to
understand the authentication mechanism itself.

### 3.4 Minimal auth-only extraction checklist

If you want to copy this authentication design into another app, start with:

**Frontend**

```text
app/layout.tsx
app/(auth)/layout.tsx
app/(auth)/sign-in/[[...sign-in]]/page.tsx
proxy.ts
lib/api.ts
```

Add a protected layout with `<UserButton />` when you need sign-out/profile UI.
Add an authenticated service function like `frontend/services/Grades.ts` to see
how to attach the token.

**Backend**

```text
pom.xml security/JWT/webhook dependencies
src/main/resources/application.properties
BackendApplication.java
Config/SecurityConfig.java
Config/JwtAuthenticationFilter.java
Service/JwtTokenService.java
Controller/ClerkWebhookController.java
Service/ClerkService.java
Entity/Student.java
Repository/StudentRepository.java
```

---

## 4. Running the project locally

### 4.1 Prerequisites

Install:

- **JDK 25** — configured in `backend/pom.xml` (`java.version=25`). If you use
  another installed JDK, adjust `java.version` in `pom.xml`.
- **Node.js 20+** — Node 22 LTS is recommended for Next.js 16.
- **npm**
- **PostgreSQL 14+**
- A **Clerk account** and a Clerk application
- Optional: **ngrok** or another HTTPS tunnel for local webhook delivery

The repo includes the Maven wrapper, so a global Maven installation is not
required.

### 4.2 Create and configure the Clerk application

1. Create an application in the Clerk Dashboard.
2. Enable the sign-in methods you want and allow sign-ups if users should be
   able to create their own accounts.
3. Copy the **publishable key** and **secret key** into the frontend
   environment.
4. Copy the **PEM public key** used to verify Clerk session tokens. This is
   usually available in the Clerk dashboard under the JWT/session settings.
5. Configure the webhook after starting the backend and an HTTPS tunnel (see
   section 4.6).
6. Copy the webhook **signing secret**. This is different from the Clerk secret
   key.

> This repository only defines a `/sign-in` page. If you want Clerk's public
> sign-up flow, add a matching `app/(auth)/sign-up/[[...sign-up]]/page.tsx`
> using Clerk's `<SignUp>` component, or invite users from the Clerk dashboard.

### 4.3 Create the PostgreSQL database

Create a database named `student_portal`:

```bash
psql -U postgres -c "CREATE DATABASE student_portal;"
```

The backend defaults to:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/student_portal
spring.datasource.username=postgres
spring.datasource.password=password
```

Update `backend/src/main/resources/application.properties` if your PostgreSQL
username, password, host, or database name is different.

For local development, `spring.jpa.hibernate.ddl-auto=update` creates the
tables automatically. Use migrations and `validate` in production instead.

### 4.4 Create `backend/.env`

The backend loads this file as a Java **properties** file:

```properties
spring.config.import=optional:file:.env[.properties]
```

Create `backend/.env` with:

```properties
CLERK_WEBHOOK_SIGNING_SECRET=whsec_your_webhook_signing_secret
CLERK_JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----MIIBIjAN...your-public-key...IDAQAB-----END PUBLIC KEY-----
CLERK_JWT_ISSUER=https://your-instance.clerk.accounts.dev
CLERK_JWT_AUDIENCE=http://localhost:3000/
```

Important formatting rules:

- Do **not** use `export`.
- Do **not** quote multi-line PEM values.
- Put the public key on **one line**, including its
  `-----BEGIN PUBLIC KEY-----` and `-----END PUBLIC KEY-----` markers.
- The backend loader removes the PEM markers and whitespace before parsing.
- `CLERK_JWT_ISSUER` and `CLERK_JWT_AUDIENCE` must match the values in the
  Clerk session token if you enable issuer/audience checks.

The backend's `application.properties` maps these variables to internal
properties:

```properties
clerk.webhook.signing-secret=${CLERK_WEBHOOK_SIGNING_SECRET}
clerk.jwt.public-key=${CLERK_JWT_PUBLIC_KEY}
clerk.jwt.issuer=${CLERK_JWT_ISSUER}
clerk.jwt.audience=${CLERK_JWT_AUDIENCE}
```

Run the backend while your shell is inside `backend/`, so the relative `.env`
path is resolved correctly.

### 4.5 Run the Spring Boot backend

```bash
cd backend
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The API should start on:

```text
http://localhost:8081
```

If the public key cannot be parsed, Spring Boot will fail at startup with a
message about `CLERK_JWT_PUBLIC_KEY`. Check the single-line formatting first.

### 4.6 Expose the webhook and configure Clerk

Clerk needs a publicly reachable HTTPS URL to deliver webhooks to your local
backend.

Start a tunnel:

```bash
ngrok http 8081
```

Copy the forwarding HTTPS URL, then in the Clerk Dashboard:

1. Go to the **Webhooks** settings for your application.
2. Add an endpoint:
   ```text
   https://your-ngrok-url.ngrok-free.app/api/webhooks/clerk
   ```
3. Subscribe to these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy the endpoint's signing secret.
5. Put that secret into `backend/.env` as
   `CLERK_WEBHOOK_SIGNING_SECRET`.
6. Restart the backend if you changed the secret.
7. Use the Clerk dashboard's webhook test/retry action to send a test event.

The webhook route is intentionally public in `SecurityConfig`, but the
controller verifies the Svix signature. Never remove that verification.

### 4.7 Create the frontend environment file

Create `frontend/.env.local` or update the existing `frontend/.env`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_API_URL=http://localhost:8081
```

Notes:

- `NEXT_PUBLIC_*` values are exposed to the browser.
- `CLERK_SECRET_KEY` is server-side only and must not use the `NEXT_PUBLIC_`
  prefix.
- `frontend/lib/api.ts` appends `/api/v1` to `NEXT_PUBLIC_API_URL`.

### 4.8 Run the Next.js frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Production-style local run:

```bash
npm run build
npm start
```

### 4.9 End-to-end verification

1. Open `http://localhost:3000`.
2. Click **Log in** and create/sign in to a Clerk account.
3. Confirm Clerk shows the user in its dashboard.
4. Confirm the user was written to PostgreSQL:

   ```bash
   psql -U postgres -d student_portal \
     -c "SELECT clerk_id, email, first_name, last_name FROM students;"
   ```

5. Confirm the browser reaches `/workspace`.
6. Confirm the Overview and Grades pages load authenticated data.
7. In the Clerk dashboard, edit the user's first or last name. Confirm the
   `students` row is updated by `user.updated`.
8. Delete a test user in Clerk. Confirm the local row is removed by
   `user.deleted`.

The authentication flow creates the `students` row only. It does not seed
courses or grades. Add portal data separately if you want the Overview and
Grades pages to show values.

---

## 5. API summary

### Public endpoint

| Method | Path | Authentication |
| --- | --- | --- |
| `POST` | `/api/webhooks/clerk` | No user JWT. Requires a valid Svix signature. |

### Protected endpoints

All other endpoints require:

```http
Authorization: Bearer <clerk-session-jwt>
```

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/grades` | Grades for the authenticated student. |
| `GET` | `/api/v1/stats/courses/average` | Course averages for the authenticated student. |
| `GET` | `/api/v1/stats/semesters/average` | Semester averages for the authenticated student. |

The controllers identify the student with:

```java
@AuthenticationPrincipal Student student
```

They never accept a student ID from the request body or query string. This
prevents one user from requesting another user's data by changing an ID.

---

## 6. Environment variable reference

### Frontend

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk browser-side key used by `<ClerkProvider>`, `<SignIn>`, and Clerk hooks. |
| `CLERK_SECRET_KEY` | Yes | Clerk server-side key used by Next.js/Clerk. Do not expose it to the browser. |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the Spring Boot API, without `/api/v1`. |

### Backend

| Variable | Required | Purpose |
| --- | --- | --- |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Yes | Svix signing secret used to verify webhook authenticity. |
| `CLERK_JWT_PUBLIC_KEY` | Yes | PEM public key used to verify Clerk session JWT signatures. Must be a single line in `.env`. |
| `CLERK_JWT_ISSUER` | Configuration | Expected Clerk token issuer. Currently stored but issuer enforcement is commented out in `JwtTokenService`. |
| `CLERK_JWT_AUDIENCE` | Configuration | Expected Clerk token audience. Currently stored but audience enforcement is commented out in `JwtTokenService`. |

### Database

The current defaults live in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/student_portal
spring.datasource.username=postgres
spring.datasource.password=password
```

For a real deployment, move these values to environment-specific configuration
and use a dedicated database user.

---

## 7. Troubleshooting

### `401 No local user record for this token`

The Clerk JWT is valid, but there is no matching `students.clerk_id` row.

Check:

- Clerk webhook endpoint URL is correct and uses HTTPS.
- The backend is reachable through the tunnel.
- `user.created` is enabled in the Clerk webhook subscription.
- `CLERK_WEBHOOK_SIGNING_SECRET` matches the webhook endpoint.
- The webhook was not delivered before the backend was ready.
- Try re-sending the event from the Clerk dashboard.

Remember that this can happen briefly on first sign-up because webhook delivery
is asynchronous.

### `401 Invalid or expired token`

Check:

- Frontend and backend are using the **same Clerk application**.
- `CLERK_JWT_PUBLIC_KEY` is the correct PEM public key for that application.
- The token has not expired. Clerk normally refreshes session tokens; signing
  out and back in is a useful test.
- If you enabled issuer/audience checks, confirm both values match the actual
  token claims.

### Backend fails to start with a public key parsing error

The backend `.env` is a Java properties file, not a shell file.

- Keep `CLERK_JWT_PUBLIC_KEY` on one line.
- Remove surrounding quotes.
- Keep the PEM header/footer or let the loader strip them; either way, the
  value must contain the base64 key material.
- Restart the backend after changing `.env`.

### Webhook returns `400`

Check:

- The endpoint is `/api/webhooks/clerk`.
- The signing secret is the **webhook signing secret**, not the Clerk secret
  key.
- The tunnel URL in Clerk matches the running ngrok URL.
- The webhook body is being sent as the raw body; the controller verifies the
  raw payload.
- The subscribed event type is supported.

### CORS error in the browser

`SecurityConfig` currently allows only:

```text
http://localhost:3000
```

If the frontend runs on another origin, update:

```java
config.setAllowedOrigins(List.of("http://localhost:3000"));
```

Then restart the backend. For deployment, use the exact production frontend
origin.

### User signs in but `/workspace` redirects back to sign-in

Check:

- Clerk environment keys are present and valid.
- `frontend/proxy.ts` is being picked up by Next.js.
- The Clerk application allows the current domain/origin.
- The sign-in route exists at `/sign-in`.

### `students` insertion fails for a new Clerk user

`Student` declares these columns as non-null:

```text
clerk_id
first_name
last_name
email
```

`ClerkService` reads the primary email and names from the Clerk webhook
payload. If a Clerk user has no primary email or no first/last name, the local
insert can fail. Ensure Clerk profiles contain the required fields, or make the
corresponding entity columns nullable if that is acceptable for your
application.

### Database connection refused

Check:

- PostgreSQL is running.
- The database `student_portal` exists.
- `spring.datasource.*` credentials are correct.
- Port `5432` is not occupied by another PostgreSQL instance.

### Port already in use

- Backend default: `8081`
- Frontend default: `3000`

If you change the backend port, update `NEXT_PUBLIC_API_URL`. If you change the
frontend origin, update the CORS `allowedOrigins` list.

---

## 8. Production and security notes

The current code is suitable for learning and local development. Before
production:

1. **Enable issuer and audience validation.**
   `JwtTokenService` currently calls `verifyWith(publicKey)` but the
   `requireIssuer(issuer)` and `requireAudience(audience)` lines are commented
   out. Re-enable them after confirming the exact `iss` and `aud` values in
   your Clerk tokens.

2. **Use environment-specific secrets.**
   Keep Clerk test keys out of production. Rotate any key that was ever
   committed or shared.

3. **Replace the hardcoded CORS origin.**
   `SecurityConfig` hardcodes `http://localhost:3000`. Use your deployed
   frontend origin, preferably from configuration.

4. **Disable verbose security logging.**
   `application.properties` currently sets
   `logging.level.org.springframework.security=TRACE`. Reduce this in
   production to avoid logging sensitive request details.

5. **Use migrations instead of `ddl-auto=update`.**
   Use Flyway or Liquibase and set
   `spring.jpa.hibernate.ddl-auto=validate` in production.

6. **Serve everything over HTTPS.**
   Clerk, the frontend, the backend API, and webhook endpoints should all use
   HTTPS in production.

7. **Keep the webhook signature check.**
   `/api/webhooks/clerk` is public by design, but its Svix signature
   verification is the security control that prevents forged user events.

8. **Do not add a backend password login.**
   Clerk owns passwords and sessions. This backend should remain a resource
   server that verifies Clerk-issued JWTs. The `BCryptPasswordEncoder` bean in
   `SecurityConfig` is not used by the Clerk flow and can be removed if you do
   not need it elsewhere.

9. **Remember webhook eventual consistency.**
   For a short period after sign-up, the user can have a valid Clerk session
   while the local `students` row is still being created. Design the UI to
   tolerate a temporary `401 No local user record` response.

10. **Review profile field requirements.**
    Clerk may omit first/last names depending on the sign-up method. Decide
    whether those fields are truly required in your local schema.

---

## 9. Quick reference

```text
Frontend:        http://localhost:3000
Backend API:     http://localhost:8081
Webhook:         POST http://localhost:8081/api/webhooks/clerk
Database:        postgresql://localhost:5432/student_portal
Protected pages: /workspace(.*)
Public page:     /
Sign-in page:    /sign-in
```

Run order:

```text
1. Start PostgreSQL
2. Start backend:   cd backend && ./mvnw spring-boot:run
3. Start ngrok:     ngrok http 8081
4. Configure Clerk webhook with the ngrok URL
5. Start frontend:  cd frontend && npm run dev
6. Open http://localhost:3000
```
