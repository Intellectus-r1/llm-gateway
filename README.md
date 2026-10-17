# LLM Gateway With Smart Analytics And Usage Monitoring

## 1. About the Project

The **LLM Gateway With Smart Analytics And Usage Monitoring** is a project developed to manage requests to different Large Language Model (LLM) providers through a single backend.

Instead of connecting an application directly to each AI provider, users can send requests through the gateway. The backend handles authentication, selects the required provider, processes the request, and records usage information.

The project also includes a dashboard where users can view usage statistics, request history, provider information, and basic system health details.

The main purpose of this project is to make working with multiple AI providers easier to manage and monitor through one interface.

## 2. Problem Statement

Applications that use multiple AI providers often need separate integrations, authentication handling, and usage tracking for each provider. Managing these things separately can make the application more complicated.

This project provides a common gateway for handling AI requests. It also records usage information and displays the collected data through a dashboard.

## 3. Objectives

The main objectives of this project are:

- To provide a common API for sending requests to supported AI providers.
- To implement user registration and login.
- To manage API keys securely.
- To support multiple AI providers.
- To implement provider selection and fallback handling.
- To record request and token usage information.
- To display usage statistics through a dashboard.
- To monitor basic application and provider health.
- To simplify deployment using Docker.

## 4. Main Features

### 4.1 User Authentication

The application supports user registration and login. JWT-based authentication is used to protect the relevant backend endpoints.

### 4.2 API Key Management

Users can manage gateway API keys from the application. Keys are stored in hashed form rather than being stored as plain-text values, and keys can be revoked.

### 4.3 Multiple AI Providers

The gateway supports integrations with:

- Google Gemini
- NVIDIA AI services

The actual models available depend on the provider configuration and the API credentials supplied.

### 4.4 Unified Chat API

Applications can send chat requests through a common gateway endpoint rather than implementing a separate gateway integration for each supported provider.

### 4.5 Provider Routing and Fallback

The gateway includes provider-selection and fallback logic. If the primary provider request fails under the configured fallback conditions, the gateway can attempt another supported provider.

Fallback depends on the available provider configuration and the type of error encountered.

### 4.6 Usage Monitoring

The backend records usage information for gateway requests. The dashboard provides usage summaries and request history, helping users understand how the gateway is being used.

### 4.7 Analytics Dashboard

The dashboard provides sections for viewing usage statistics, historical requests, provider information, and monitoring information.

### 4.8 Health Monitoring

The application includes basic health-monitoring functionality to help users check the status of the gateway and its configured services.

### 4.9 Docker Deployment

Docker Compose is used to run the frontend, backend, and PostgreSQL database as separate services.

## 5. Technology Stack

| Component | Technology |
|---|---|
| Backend language | Java 21 |
| Backend framework | Spring Boot |
| Security | Spring Security and JWT |
| Database | PostgreSQL |
| Frontend | React |
| Frontend build tool | Vite |
| Styling | Tailwind CSS |
| Backend build tool | Maven |
| Containerization | Docker and Docker Compose |
| AI providers | Google Gemini and NVIDIA |

## 6. System Architecture

The project follows a frontend-backend architecture. The frontend communicates with the Spring Boot backend, which handles authentication, AI provider requests, and usage recording. PostgreSQL stores application data.

```mermaid
flowchart TD
    U[User] --> F[React Frontend]
    F --> B[Spring Boot Backend]

    B --> A[Authentication and Authorization]
    A --> G[LLM Gateway]

    G --> R[Provider Routing]
    R --> P1[Google Gemini]
    R --> P2[NVIDIA AI Services]

    P1 -. Fallback when configured .-> P2

    B --> DB[(PostgreSQL Database)]
    G --> L[Usage Logging]
    L --> DB

    DB --> D[Usage Analytics]
    D --> F
```

### Architecture Explanation

1. The user interacts with the React frontend.
2. The frontend sends requests to the backend.
3. The backend checks authentication and authorization where required.
4. The gateway processes the AI request and selects a configured provider.
5. The selected provider processes the request.
6. If configured fallback conditions are met, the gateway can try another provider.
7. Usage information is recorded in the database.
8. The dashboard displays the available usage and monitoring information.

## 7. AI Request Processing Flow

The following diagram shows the general flow of a chat request through the gateway.

```mermaid
flowchart TD
    A[Client Sends Chat Request] --> B[Validate Request and Credentials]
    B --> C{Request Authorized?}

    C -- No --> D[Return Authentication Error]
    C -- Yes --> E[Select Primary Provider]

    E --> F[Send Request to Provider]
    F --> G{Request Successful?}

    G -- Yes --> H[Record Usage Information]
    G -- No --> I{Fallback Available?}

    I -- Yes --> J[Try Fallback Provider]
    J --> K{Fallback Successful?}
    K -- Yes --> H
    K -- No --> L[Record Failure Information]

    I -- No --> L

    H --> M[Return Response to Client]
    L --> N[Return Error Response]
```

*Note: This diagram represents the intended request-processing flow. The exact logging behavior for failed requests depends on the implementation.*

## 8. Deployment Architecture

Docker Compose is used to run the main application services. The frontend is exposed to the browser, while the backend communicates with PostgreSQL and the configured external AI providers.

```mermaid
flowchart TB
    U[User Browser]

    subgraph Docker["Docker Compose Environment"]
        F[Frontend Container<br/>React and Nginx]
        B[Backend Container<br/>Spring Boot]
        DB[(PostgreSQL Container)]

        F --> B
        B --> DB
    end

    P1[Google Gemini API]
    P2[NVIDIA AI API]

    U -->|HTTP| F
    B --> P1
    B --> P2
```

### Services

| Service | Purpose |
|---|---|
| Frontend | Displays the dashboard and provides the user interface. |
| Backend | Handles authentication, API requests, provider integration, and usage processing. |
| PostgreSQL | Stores application and usage data. |
| Gemini API | Provides access to configured Gemini models. |
| NVIDIA API | Provides access to configured NVIDIA AI services. |

## 9. Project Structure

The main project folders are organized as follows:

```text
llm-gateway/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   └── test/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── docker-compose.yml
├── README.md
└── .env
```

The `.env` file contains environment-specific configuration and should not be committed to the public repository. The exact source files and subfolders may differ depending on the current implementation.

## 10. Requirements

Before running the project, make sure the following software is installed:

- Java 21, if running the backend outside Docker.
- Maven, if building or testing the backend locally.
- Node.js and npm, if running the frontend locally.
- Docker.
- Docker Compose.
- API credentials for the AI providers you want to use.

If the frontend and backend are run entirely through Docker Compose, Java, Maven, Node.js, and npm may not need to be installed separately on the host machine.

## 11. Environment Configuration

The application uses environment variables for database credentials, authentication, and provider API keys.

Create or update the root `.env` file with the variable names expected by your Docker Compose configuration.

Example:

```env
DB_URL=jdbc:postgresql://postgres:5432/llmgateway
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password

JWT_SECRET=replace_with_a_secure_secret

GEMINI_API_KEY=your_gemini_api_key
NVIDIA_API_KEY=your_nvidia_api_key
```

**Important:**

- Replace the example values with your actual configuration.
- Confirm the database name and credentials against `docker-compose.yml` and the backend configuration.
- Use a sufficiently strong JWT secret.
- Keep `.env` out of Git.
- Never publish real API keys, passwords, or JWT secrets.
- Do not use the example values as production credentials.

## 12. How to Run the Project

### Step 1: Open the Project Directory

```bash
cd llm-gateway
```

### Step 2: Configure Environment Variables

Check that the required variables are available in your root `.env` file and match the application configuration.

### Step 3: Start the Application

Run:

```bash
docker compose up -d --build
```

This builds the required images and starts the configured services in the background.

### Step 4: Check the Services

```bash
docker compose ps
```

To view the application logs:

```bash
docker compose logs -f
```

To view logs for a particular service, use its service name from `docker-compose.yml`. For example:

```bash
docker compose logs -f backend
```

### Step 5: Open the Application

Open the frontend in your browser:

**http://localhost:8081**

The application should display the frontend dashboard. Use the registration and login screens as appropriate for your configured application.

### Stopping the Application

To stop the services without deleting the stored database volume, run:

```bash
docker compose down
```

Avoid using `docker compose down -v` unless you deliberately intend to remove the associated volumes. Removing the database volume can permanently delete locally stored application data.

## 13. API Endpoints

The following table describes the main API areas. Confirm the exact paths, HTTP methods, and request formats against the current backend source before using them in an external application.

| Endpoint | Purpose |
|---|---|
| `/api/chat` | Sends a chat request through the gateway. |
| `/api/usage/summary` | Retrieves usage summary information. |
| `/api/usage/history` | Retrieves usage history. |
| `/api/usage/providers` | Retrieves provider-related usage information. |
| `/api/monitoring/health` | Retrieves basic monitoring or health information. |

Authentication and API-key endpoints are also part of the application. Their exact paths should be taken from the implemented controller mappings.

### Example Chat Request

The following is an illustrative request shape. Confirm the required fields and authentication headers in the backend before using it.

```bash
curl -X POST http://localhost:8081/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_GATEWAY_API_KEY" \
  -d '{
    "model": "your-configured-model",
    "messages": [
      {
        "role": "user",
        "content": "Explain what an LLM gateway does."
      }
    ]
  }'
```

Replace the example model and credentials with values supported by the application. The authentication scheme and request format must match the actual `/api/chat` implementation.

## 14. Testing

The project includes backend tests, and the backend test suite has been run during development.

To run the backend tests locally:

```bash
cd backend
./mvnw test
```

If the project does not include the Maven Wrapper, use:

```bash
mvn test
```

Testing helps verify the backend logic and identify issues before deploying changes. External provider requests may require valid API credentials and network access.

## 15. Usage Analytics and Cost Tracking

The gateway records usage information and provides dashboard views for examining request activity.

The information available depends on what the backend records and what the configured providers return.

**Cost calculation limitation:** Cost is not currently treated as a verified billing amount. The dashboard may show zero cost because reliable, verified pricing has not been configured. A zero value should not be interpreted as proof that the provider request was free.

For accurate cost reporting, provider-specific pricing, model rates, token definitions, and billing rules must be verified and implemented.

## 16. Current Limitations

Some limitations of the current project are:

- The gateway supports only the providers and models configured in the application.
- Provider fallback depends on the implemented routing rules and available credentials.
- Usage analytics depend on the data returned by providers and recorded by the backend.
- Cost reporting is not reliable until verified pricing rules are implemented.
- Health monitoring provides only the checks implemented by the application.
- Production deployment may require additional security, rate limiting, monitoring, and operational configuration.

## 17. Future Enhancements

The project can be improved further by adding:

1. **More AI providers:** Add support for other LLM providers through the common gateway interface.
2. **Accurate cost calculation:** Implement verified pricing rules for each supported model.
3. **Advanced analytics:** Add charts for token usage, request volume, provider usage, and errors over time.
4. **Rate limiting:** Limit request volume to help prevent misuse and control resource consumption.
5. **Caching:** Cache suitable requests to reduce repeated work where the request semantics allow it.
6. **Improved monitoring:** Add latency tracking, error-rate metrics, and provider availability checks.
7. **Role-based access control:** Introduce additional roles and permissions where required.
8. **Automated testing:** Expand unit, integration, and end-to-end test coverage.
9. **Production deployment:** Add deployment automation, secret management, and centralized logging.

## 18. Conclusion

The LLM Gateway With Smart Analytics And Usage Monitoring project provides a common interface for working with supported AI providers. It combines authentication, API key management, provider routing, request processing, usage logging, and a dashboard in one application.

The project demonstrates how a Java Spring Boot backend, a React frontend, PostgreSQL, and Docker Compose can be combined to build and run an AI gateway. It also provides a foundation for future improvements in analytics, cost tracking, security, and monitoring.

---

**Project:** LLM Gateway With Smart Analytics And Usage Monitoring

**Backend:** Java 21 and Spring Boot

**Frontend:** React, Vite, and Tailwind CSS

**Database:** PostgreSQL

**Deployment:** Docker Compose
