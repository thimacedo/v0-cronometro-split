# Security Policy - SPH_Partilhas (zoom-app)
**Version: 1.0.0 | Date: 2026-04-18**

## 1. Security Architecture
The SPH_Partilhas application is built on a "Secure by Design" philosophy, utilizing a modern tech stack focused on isolation and data integrity.

## 2. Infrastructure Security
*   **Cloud Hosting:** Our backend runs on encrypted containers with automated scaling and monitoring.
*   **Database Encryption:** Data at rest is encrypted using **AES-256**.
*   **Network Protection:** All endpoints are protected by HSTS (HTTP Strict Transport Security) and require TLS 1.2 or higher.

## 3. Application Security (SSDLC)
Our Secure Software Development Life Cycle includes:
*   **Secret Management:** No API keys or secrets are committed to source control. We use environment variables and encrypted secret stores.
*   **Webhook Integrity:** Every incoming request from Zoom is validated using **HMAC-SHA256 (v0)** signatures.
*   **Content Security Policy (CSP):** A strict CSP is implemented to prevent Cross-Site Scripting (XSS) and Clickjacking within the Zoom Client.

## 4. Authentication and Authorization
*   We implement the **OAuth 2.0** protocol for all Zoom integrations.
*   Access is limited to the minimum scopes required for the timer synchronization feature.

## 5. Incident Response
In the event of a security breach, our team follows a strict incident management protocol, including notification to affected users and Zoom within 72 hours of discovery.
