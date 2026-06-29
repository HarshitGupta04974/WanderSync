# WanderSync
A high-performance Spring Boot REST API for a peer-to-peer travel matching platform. It features robust session-based authentication, a transactional trip-request engine, rule-based feed generation using the Strategy pattern, and a real-time WebSocket chat system for matched users.

# Peer-to-Peer Travel Matching API

A scalable Spring Boot backend designed to facilitate peer-to-peer travel connections. Users can create trip itineraries, request to join existing trips, manage incoming/outgoing requests, and communicate in real-time via WebSockets once a match is confirmed.

## Technical Highlights

* Engineered a peer-to-peer travel matching backend using **Spring Boot** and **Java**, delivering **15+ scalable REST APIs** for post management, real-time trip requests, and user authentication.
* Implemented real-time bidirectional communication using **WebSockets** and the **STOMP protocol** via `SimpMessagingTemplate`, enabling sub-second latency for live chat execution between matched users.
* Integrated **Spring Security** with `HttpSessionSecurityContextRepository` for robust session-based authentication, enforcing strict ownership-level authorization and stateless validation across **100%** of secured service endpoints.
* Utilized the **Strategy Design Pattern** to build a dynamic feed generation system, isolating specific filtering behaviors (e.g., gender-specific constraints) and eliminating complex conditional logic in the service layer.
* Architected a highly concurrent, transactional matching engine using `@Transactional` operations to process trip approvals and rejections, guaranteeing **100% ACID compliance** and preventing invalid state transitions during concurrent database operations.

## Tech Stack

* **Core:** Java, Spring Boot, Spring MVC
* **Security:** Spring Security (Session-based via `HttpSessionSecurityContextRepository`)
* **Real-time Communication:** Spring WebSockets, STOMP
* **Data Access:** Spring Data JPA / Hibernate
* **Design Patterns:** Strategy Pattern, MVC

## Core Modules

### 1. Authentication (`/api/v1/auth`)
Handles user registration, login, and session validation. Security context is explicitly managed and stored in the HTTP session.

### 2. Travel Posts (`/api/v1/posts`)
Allows users to publish travel itineraries (origin, destination, time) and fetch available open posts. Includes specific filtering logic (e.g., `isFemaleOnly`) managed via `PostSearchStrategy` implementations (`InclusiveSearchStrategy`, `StandardSearchStrategy`).

### 3. Request Engine (`/api/v1/requests`)
The transactional core for matching. 
* Users can request to join a trip (`INTERESTED`).
* Post owners can `ACCEPT` or `REJECT` requests.
* Strict authorization checks ensure only post owners can mutate request states.

### 4. Real-time Chat (`/api/v1/chat` & `/chat/...`)
Once a travel request is accepted, users can communicate via STOMP over WebSockets. Chat history is persisted and retrievable via a dedicated REST endpoint.

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd travel-matching-api
