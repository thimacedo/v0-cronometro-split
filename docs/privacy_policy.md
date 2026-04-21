# Privacy Policy - SPH_Partilhas (zoom-app)
**Last Updated: 2026-04-18**

## 1. Introduction
SPH_Partilhas ("we," "our," or "the App") is a synchronized timer application designed specifically for the Zoom platform. We are committed to protecting the privacy and security of Zoom users who interact with our service.

## 2. Information We Collect
To provide synchronization features, we collect the following data types from Zoom:
*   **Zoom OAuth Tokens:** Access and Refresh tokens required to identify the session and maintain timer continuity.
*   **Meeting Metadata:** Meeting UUID (Unique Identifier) used to create synchronized "rooms" via WebSockets.
*   **Usage Data:** Basic interaction logs (Start/Pause/Reset actions) to ensure service stability.

**Note:** We do **NOT** record audio, video, chat messages, or participant lists.

## 3. How We Use Your Data
Data is used exclusively for:
*   Synchronizing the timer state across all participants in a specific Zoom meeting.
*   Authenticating the installation and authorization of the App within the Zoom client.

## 4. Data Retention and Deletion
*   **Retention:** OAuth tokens are stored as long as the App is installed. Meeting UUIDs and timer states are retained for a maximum of 24 hours after the meeting ends.
*   **Deletion:** Users can uninstall the App via the Zoom Marketplace, which triggers an automatic deauthorization webhook, leading to the immediate deletion of all associated user tokens from our database.

## 5. Data Security (At Rest and In Transit)
*   **In Transit:** All communications use TLS 1.2+ (HTTPS/WSS).
*   **At Rest:** Sensitive tokens are stored in an encrypted PostgreSQL database (AES-256) hosted via Supabase.

## 6. Third-Party Sharing
We do **not** sell, trade, or share Zoom user data with third parties for marketing or any other purposes, except as required by law or to provide essential infrastructure services (e.g., Supabase for database hosting).

## 7. Contact Us
For privacy-related inquiries, please contact: `support@sph-partilhas.com`
