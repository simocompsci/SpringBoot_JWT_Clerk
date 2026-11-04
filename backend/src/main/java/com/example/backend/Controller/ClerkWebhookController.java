// package com.example.backend.Controller;

// import java.net.http.HttpHeaders;
// import java.util.List;
// import java.util.Map;


// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import tools.jackson.databind.JsonNode;
// import tools.jackson.databind.ObjectMapper;

// import com.example.backend.Service.ClerkService;
// import com.svix.Webhook;
// import com.svix.exceptions.EmptyWebhookSecretException;

// @RestController
// @RequestMapping("/api/webhooks")
// public class ClerkWebhookController {

//     private final Webhook webhook;
//     private final ObjectMapper objectMapper;
//     private final ClerkService clerkService;

//     public ClerkWebhookController(
//             @Value("${clerk.webhook.signing-secret}") String signingSecret,
//             ObjectMapper objectMapper,
//             ClerkService clerkService)
//             throws EmptyWebhookSecretException {

//         this.webhook = new Webhook(signingSecret);
//         this.objectMapper = objectMapper;
//         this.clerkService = clerkService;
//     }

//     @PostMapping("/clerk")
//     public ResponseEntity<Void> handleClerkWebhook(
//             @RequestBody String payload,
//             @RequestHeader("svix-id") String svixId,
//             @RequestHeader("svix-timestamp") String svixTimestamp,
//             @RequestHeader("svix-signature") String svixSignature) {

//         try {
//             /*
//              * ---------------------------------------------------------
//              * 1. Verify that the webhook really came from Clerk/Svix
//              * ---------------------------------------------------------
//              */

//             HttpHeaders headers = HttpHeaders.of(
//                     Map.of(
//                             "svix-id", List.of(svixId),
//                             "svix-timestamp", List.of(svixTimestamp),
//                             "svix-signature", List.of(svixSignature)),
//                     (name, value) -> true);

//             webhook.verify(payload, headers);

//             /*
//              * ---------------------------------------------------------
//              * 2. Parse the verified webhook payload
//              * ---------------------------------------------------------
//              */

//             JsonNode event = objectMapper.readTree(payload);

//             String eventType = event.path("type").asText();

//             JsonNode userData = event.path("data");

//             if (userData.isMissingNode()) {
//                 return ResponseEntity.badRequest().build();
//             }

//             /*
//              * ---------------------------------------------------------
//              * 3. Handle Clerk user events
//              * ---------------------------------------------------------
//              */

//             switch (eventType) {

//                 case "user.created":
//                     clerkService.upsertUser(userData);
//                     break;

//                 case "user.updated":
//                     clerkService.upsertUser(userData);
//                     break;

//                 case "user.deleted":
//                     clerkService.deleteUser(userData);
//                     break;

//                 default:
//                     /*
//                      * We received a valid Clerk webhook, but it is
//                      * an event that this application does not need.
//                      *
//                      * Return 200 so Clerk does not retry it.
//                      */
//                     break;
//             }

//             /*
//              * ---------------------------------------------------------
//              * 4. Tell Clerk/Svix that the webhook was processed
//              * ---------------------------------------------------------
//              */

//             return ResponseEntity.ok().build();

//         } catch (Exception e) {

//             /*
//              * Returning 4xx/5xx causes Clerk/Svix to retry the webhook.
//              */
//             return ResponseEntity
//                     .status(HttpStatus.BAD_REQUEST)
//                     .build();
//         }
//     }

// }