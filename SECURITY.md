# Security Policy

This project is a personal application built to explore the integration of the **TMDB API** and asynchronous JavaScript. While this is a learning-focused project, I am committed to following secure development practices.

## Supported Versions

I am currently focusing on the development of the hybrid Movie and TV series features. Only the latest version is actively maintained.

| Version | Supported | Description |
| :--- | :--- | :--- |
| **v2.0 (Latest)** | ✅ YES | Hybrid Movie/TV integration with synchronized Wishlist logic. |
| v1.0 | ❌ NO | Initial release (Movies only). |

## Security Implementation

The following measures have been implemented to ensure the application remains stable and secure:

* **API Authentication:** Sensitive credentials (API Keys and Bearer Tokens) are centralized in `userData.js` to prevent hardcoding secrets directly into logic files.
* **Input Sanitization:** All user-generated search queries are processed using `encodeURIComponent()` to prevent URL injection and ensure valid API requests.
* **Data Integrity:** Implemented **Optimistic UI updates** with automatic rollback logic. If a fetch request to the TMDB API fails, the UI state (e.g., the Heart button color) automatically reverts to stay in sync with the server.
* **Graceful Error Handling:** All API interactions are wrapped in `try...catch` blocks to prevent application crashes during network failures or server-side errors.

## Reporting a Vulnerability

If you discover a security flaw or exposed API credentials, please do not open a public issue. Instead:

1.  **Contact me** via a private message on LinkedIn or GitHub.
2.  I will acknowledge your report within **48 hours**.
3.  A fix will be pushed to the `main` branch once the logic is validated.

## Disclaimer
This project is for educational purposes. It is not intended for production environments where high-level data encryption or advanced user authentication is required.
