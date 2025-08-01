## System Architecture Overview

(Detailed explanation of the overall system architecture, how different applications and services interact, and high-level data flows. Consider including a diagram here using Mermaid or linking to an external diagram.)

```mermaid
C4Context
    title System Context for BookMySportz

    Person(user, "User", "A customer using the BookMySportz platform to find and book sports venues.")
    Person(admin, "Admin", "An administrator managing venues, users, and platform settings.")
    Person(venue_owner, "Venue Owner", "An owner or manager of a sports venue listing their facilities.")

    System(admin_web, "Admin Web App", "The web application for administrators to manage the platform.")
    System(user_web, "User Web App", "The public-facing web application for users to browse and book.")
    System(http_backend, "HTTP Backend API", "Provides RESTful APIs for authentication, venue management, bookings, and other core functionalities.")
    System(ws_backend, "WebSocket Backend", "Handles real-time communication, notifications, and live updates.")
    SystemDb(database, "PostgreSQL Database", "Stores all application data, including user profiles, venue details, bookings, and audit logs.")
    System(redis, "Redis Cache", "Used for caching, session management, and real-time data.")
    System(sms_gateway, "SMS Gateway", "External service for sending SMS notifications (e.g., Twilio).")
    System(email_service, "Email Service", "External service for sending email notifications (e.g., SendGrid, Nodemailer).")
    System(google_auth, "Google Auth", "Google's OAuth2 service for user authentication.")

    Rel(user, user_web, "Uses")
    Rel(admin, admin_web, "Uses")
    Rel(venue_owner, admin_web, "Manages their venue via")

    Rel(user_web, http_backend, "Makes API calls to")
    Rel(admin_web, http_backend, "Makes API calls to")
    Rel(http_backend, database, "Reads from and writes to")
    Rel(http_backend, redis, "Uses for caching and sessions")
    Rel(http_backend, sms_gateway, "Sends notifications via")
    Rel(http_backend, email_service, "Sends notifications via")
    Rel(http_backend, google_auth, "Authenticates users via")

    Rel(user_web, ws_backend, "Connects to for real-time updates")
    Rel(admin_web, ws_backend, "Connects to for real-time updates")
    Rel(ws_backend, database, "Reads data from")
    Rel(ws_backend, redis, "Publishes/Subscribes to events")

    UpdateLayoutConfig($c4Context, "LeftToRight")
```