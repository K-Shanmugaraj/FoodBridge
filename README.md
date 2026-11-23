# 🌱 FoodBridge – Food Donation Management System

**Good Food. Greater Good.**

FoodBridge is a web-based food donation management system that connects food donors with NGOs to reduce food wastage and support communities in need.

The platform allows donors to publish surplus food donations and enables NGOs to discover and collect available food before it expires.

---

## 📌 Project Overview

Food wastage is a major issue, while many communities struggle with food shortages. FoodBridge aims to bridge this gap by providing a digital platform where surplus food can be shared with organizations that need it.

The application manages user registration, food donation publishing, donation tracking and food collection through RESTful APIs.

## ✨ Key Features

- 👤 **User Registration:** Register users as DONOR or NGO.
- 🍱 **Food Donation:** Donors can publish surplus food with quantity, preparation time, expiry time and pickup location.
- 📋 **Donation Management:** Donors can view, update and delete their available donations.
- 🏢 **NGO Collection:** NGOs can browse available donations and collect food.
- 🔄 **Collection Tracking:** Donation status automatically changes from AVAILABLE to COLLECTED.
- 🛡️ **Duplicate Collection Prevention:** Prevents multiple NGOs from collecting the same donation.
- ⏰ **Expiry Validation:** Prevents collection of expired food.
- 🔐 **Password Security:** Passwords are stored using BCrypt hashing.
- ⚠️ **Exception Handling:** Centralized error handling for validation and application errors.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Programming Language | Java 17 |
| Backend Framework | Spring Boot 3.4.5 |
| API Development | Spring Web |
| ORM | Hibernate |
| Data Access | Spring Data JPA |
| Database | MySQL 8 |
| Build Tool | Maven |
| Password Hashing | BCrypt |
| Testing | JUnit, Spring Boot Test, H2 |
| Containerization | Docker, Docker Compose |
| API Testing | Postman |
| Frontend | React, Vite, JavaScript, Tailwind CSS |

## 🏗️ System Architecture

FoodBridge follows a layered architecture to maintain separation of concerns and make the application easier to maintain.

```text
                  React Frontend
                        |
                        | HTTP / JSON
                        |
                 Spring Boot API
                        |
                 Controller Layer
                        |
                   Service Layer
                        |
                 Repository Layer
                        |
                  Spring Data JPA
                        |
                  MySQL Database
```

### Backend Architecture

```text
backend/
│
├── src/
│   ├── main/
│   │   ├── java/com/foodbridge/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   ├── exception/
│   │   │   ├── repository/
│   │   │   ├── service/
│   │   │   └── FoodBridgeApplication.java
│   │   │
│   │   └── resources/
│   │       └── application.properties
│   │
│   └── test/
│       └── java/com/foodbridge/
│
├── pom.xml
└── docker-compose.yml
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| Controller | Handles incoming HTTP requests and sends responses. |
| Service | Contains business logic for registration, donations and collection. |
| Repository | Performs database operations using Spring Data JPA. |
| Entity | Represents database tables and relationships. |
| DTO | Transfers request and response data. |
| Config | Manages application configuration, BCrypt and CORS. |
| Exception | Handles application errors centrally. |

## 🗄️ Database Design

FoodBridge uses MySQL as its relational database.

### 1. User Entity

Stores registered donor and NGO information.

| Field | Description |
|---|---|
| id | Unique user ID |
| name | User or organization name |
| email | Registered email address |
| password | BCrypt hashed password |
| role | DONOR or NGO |
| created_at | Account creation time |

### 2. Donation Entity

Stores food donation information.

| Field | Description |
|---|---|
| id | Unique donation ID |
| food_name | Name of the food |
| quantity | Available food quantity |
| prepared_time | Food preparation time |
| expiry_time | Food expiry time |
| pickup_location | Food collection location |
| status | AVAILABLE or COLLECTED |
| donor_id | ID of the donor |
| collected_by_id | ID of the NGO that collected the food |
| collected_at | Collection timestamp |

### Entity Relationships

- One donor can create multiple food donations.
- Each donation belongs to one donor.
- A donation can be collected by an NGO.
- The collected NGO and collection timestamp are recorded.

Hibernate manages the database schema based on the JPA entity classes.

## 🔄 Application Workflow

```text
              User Registration
                     |
              Select User Role
                     |
                DONOR / NGO
                     |
              Donor Adds Food
                     |
            Donation AVAILABLE
                     |
             NGO Views Donations
                     |
              NGO Collects Food
                     |
            Donation COLLECTED
                     |
             Collection Recorded
```

## 🔗 REST API Documentation

**Base URL:**

```text
http://localhost:8080
```

### User APIs

| HTTP Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/register` | Register a new donor or NGO |
| GET | `/api/users` | Retrieve all users |
| GET | `/api/users/{id}` | Retrieve user by ID |

### Donation APIs

| HTTP Method | Endpoint | Description |
|---|---|---|
| POST | `/api/donations` | Create a food donation |
| GET | `/api/donations` | Retrieve available donations |
| GET | `/api/donations/{id}` | Retrieve donation by ID |
| PUT | `/api/donations/{id}` | Update an available donation |
| DELETE | `/api/donations/{id}?donorId={id}` | Delete an available donation |
| POST | `/api/donations/{id}/collect` | Collect a donation as an NGO |

### HTTP Response Codes

| Status Code | Description |
|---|---|
| 200 | Request completed successfully |
| 201 | Resource created successfully |
| 204 | Resource deleted successfully |
| 400 | Invalid request or business rule violation |
| 404 | Requested resource not found |
| 409 | Duplicate email or donation already collected |

## 🧪 Sample API Requests

### 1. Register a Donor

**POST** `/api/users/register`

Request Body:

```json
{
  "name": "Asha Donor",
  "email": "asha@example.com",
  "password": "secret12",
  "role": "DONOR"
}
```

### 2. Register an NGO

**POST** `/api/users/register`

Request Body:

```json
{
  "name": "Helping Hands",
  "email": "ngo@example.com",
  "password": "secret12",
  "role": "NGO"
}
```

### 3. Create a Food Donation

**POST** `/api/donations`

Request Body:

```json
{
  "foodName": "Veg Biryani",
  "quantity": 10,
  "preparedTime": "2026-11-22T12:00:00",
  "expiryTime": "2026-11-22T20:00:00",
  "pickupLocation": "Community Hall, Chennai",
  "donorId": 1
}
```

### 4. Retrieve Available Donations

**GET** `/api/donations`

Returns donations currently having AVAILABLE status.

### 5. Collect a Donation

**POST** `/api/donations/1/collect`

Request Body:

```json
{
  "ngoId": 2
}
```

After successful collection, the donation status changes from AVAILABLE to COLLECTED.

A second collection attempt is rejected.

## ⚙️ Installation and Setup

### Prerequisites

Make sure the following software is installed:

- Java Development Kit (JDK) 17
- Apache Maven 3.9+
- MySQL 8
- Git
- Docker Desktop (optional)

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd FoodBridge
```

### 2. Configure MySQL

Start your MySQL server and create the database:

```sql
CREATE DATABASE foodbridge;
```

Update the database configuration in:

`backend/src/main/resources/application.properties`

Example configuration:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/foodbridge
spring.datasource.username=root
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.open-in-view=false
```

Set the `DB_PASSWORD` environment variable to your MySQL password.

Make sure the database name and credentials match your local configuration.

Hibernate automatically creates or updates the required tables when the application starts.

### 3. Build the Backend

Navigate to the backend directory:

```bash
cd backend
```

Run:

```bash
mvn clean package
```

### 4. Run Tests

```bash
mvn test
```

The test configuration uses an in-memory H2 database.

### 5. Start the Backend Application

```bash
mvn spring-boot:run
```

The backend will start at:

```text
http://localhost:8080
```

## 🐳 Running with Docker

FoodBridge includes a Docker Compose configuration for running the backend and MySQL together.

Make sure Docker Desktop is running.

From the backend directory, execute:

```bash
docker compose up --build
```

The Docker Compose configuration starts the MySQL database and Spring Boot application.

To stop the containers:

```bash
docker compose down
```

To stop the containers and delete the database volume:

```bash
docker compose down -v
```

**Note:** Removing the volume permanently deletes the database data stored in that volume.

## 🧪 Testing

The backend includes automated tests using Spring Boot Test and H2.

The tests cover:

- User registration.
- Duplicate email validation.
- Request validation.
- Food donation creation.
- Donation retrieval.
- Donation updates and deletion.
- Successful food collection.
- Duplicate collection prevention.
- Expired food validation.

Run the tests using:

```bash
mvn test
```

## 🔐 Security and Current Limitations

- Passwords are stored as BCrypt hashes instead of plain text.
- User roles are checked using the supplied user ID.
- Donation operations validate donor and NGO roles.
- Collected donations cannot be collected again.

**Authentication limitation:** The current API does not implement JWT-based login or token validation. Role checks based on IDs supplied in requests are not sufficient for production security.

JWT-based authentication and Spring Security authorization are potential future improvements.

## 🚀 Future Enhancements

- JWT authentication and Spring Security.
- Secure role-based authorization.
- Enhanced admin management.
- Email notifications for donation and collection updates.
- Cloud deployment.
- Donation analytics and reporting.

## 📁 Complete Project Structure

The project contains two separate applications:

```text
FoodBridge/
│
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── docker-compose.yml
│
└── food-waste-frontend/
    ├── src/
    ├── public/
    ├── package.json
    └── vite.config.js
```

The React frontend is maintained separately from the Spring Boot backend.

## 👨‍💻 Author

**Shanmuga Raj K.**

BE Computer Science and Engineering

Saveetha Engineering College, Chennai

---

<p align="center">
  <b>🌱 FoodBridge – Good Food. Greater Good.</b>
  <br/>
  Connecting surplus food with communities in need.
</p>
