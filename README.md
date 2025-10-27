# Social Media API (socmed_api)

A distributed, containerized microservices-based RESTful API for a social media platform. It provides endpoints for user authentication, post creation, media uploads, and content search. All designed with scalability, observability, and performance in mind.


## 📝 Project Description
 This project implements a complete backend ecosystem for a social media platform. It consists of multiple services communicating asynchronously via RabbitMQ, providing modular scalability and fault isolation. Media files are stored in Cloudinary, structured data in PostgreSQL, and unstructured data in MongoDB. The application is containerized with Docker, monitored with Prometheus + Grafana, and protected by rate limiting and Redis caching for performance optimization.

---
## 🧩 System Architecture

This system follows a microservices architecture with the following components:

*   **API Gateway:** Central entry point for all client requests. Handles routing, authentication, rate limiting, and request aggregation.
*   **Auth Service:** Manages user registration, authentication, and JWT issuance.
*   **Post Service:** Handles post creation, retrieval, and updates. Use PostgreSQL as it databases.
*   **Media Service:** Manages media uploads and retrieval to and from Cloudinary.
*   **Search Service:**	Enables text-based post searching using MongoDB with indexing.
*   **RabbitMQ:** Acts as a message broker for asynchronous communication between services.
*   **Redis:** Used for caching frequently accessed data and enforcing rate limiting.
*   **Prometheus & Grafana:** Used for metrics collection and real-time monitoring of system health and performance.
---

## ✨ Key Features

Here are some of the standout features of the project:

*   **User Authentication:** Secure user registration and login using JWT with refresh token support.
*   **Distributed Microservices:** Each core functionality (auth, post, media, search) runs as an independent service connected via RabbitMQ.
*   **Rate Limiting & Throttling:** Protects the system against abuse using rate-limit-redis, express-rate-limit, and rate-limiter-flexible, with Redis as the main storage.
*   **Caching:** Improves performance and reduces database load with Redis-based caching.
*   **Media Handling:** Uses Cloudinary for media storage and delivery.
*   **Search Capability:** Full-text search across posts content powered by MongoDB and Mongoose indexing.
*   **Monitoring & Observability:** Exposes /metrics endpoints for Prometheus, with Grafana dashboards for visualization.
*   **Data Persistence:** PostgreSQL (via Prisma ORM), MongoDB (via Mongoose ORM)
*   **Containerized Deployment:** Fully orchestrated via Docker Compose, ensuring consistent development and production environments.

---

## 🛠️ Tech Stack

This project is built with a modern and scalable technology stack:

*   **Backend Framework:**Node.js, Express.js
*   **Databases:** PostgreSQL, MongoDB
*   **ORM/ODM:** Prisma (Postgres), Mongoose (Mongo)
*   **Caching/Rate Limiting:**	Redis
*   **Message Broker:**	RabbitMQ
*   **Media Storage:** Cloudinary
*   **Authentication:** JSON Web Tokens (JWT)
*   **Monitoring:**	Prometheus, Grafana
*   **Containerization:** Docker, Docker Compose

---

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following software installed on your system:

*   Docker
*   Docker Compose

### How to Run

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/socmed_api.git
    cd socmed_api
    ```

2.  **Set up environment variables:**
    This project uses `.env` files for managing environment variables. 
    Each service (api-gateway, auth, post, media, search) has its own .env.example. Copy and rename them to .env:

    ```bash
    # Example
    cp api-gateway/.env.example api-gateway/.env
    cp auth-service/.env.example auth-service/.env
    cp post-service/.env.example post-service/.env
    cp media-service/.env.example media-service/.env
    cp search-service/.env.example search-service/.env

    ```

    After creating the `.env` files, open them and fill in the required values (e.g., database credentials, API keys, secret keys)
    * PostgreSQL connection URL
    * MongoDB URI
    * Redis host and port
    * RabbitMQ connection URL
    * Cloudinary API credentials
    * JWT secret keys

3.  **Build and run the containers:**
    Use Docker Compose to build the images and start the containers for all the services (backend, database).

    ```bash
    docker-compose up --build -d
    ```

4.  **Access the application:**
    Once the containers are running, you should be able to access all the service from:
    * API Gateway: http://localhost:3000/v1
    * Prometheus: http://localhost:9090
    * Grafana: http://localhost:3001

---
