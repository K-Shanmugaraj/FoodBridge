# FoodBridge – Food Donation Management System

Backend for registering donors and NGOs, publishing surplus food, and letting an NGO collect a donation once.

Stack: Java 17, Spring Boot 3.4, Spring Web, Spring Data JPA, Hibernate, MySQL, Maven, Docker.

The React folder `food-waste-frontend` next to `backend` is separate. This README is for the API.

## How the code is organized

```
backend/src/main/java/com/foodbridge
  entity        User and Donation tables, plus Role and DonationStatus
  repository    Spring Data JPA interfaces
  service       Registration, donation, and collection rules
  controller    REST endpoints
  dto           JSON request and response records
  exception     Error types and one @RestControllerAdvice
  config        BCrypt password encoder and CORS
```

A `User` can post many donations (`donor_id`). A donation may later point at the NGO who collected it (`collected_by_id`).

Passwords are stored as BCrypt hashes. Responses never include the password.

This project checks the DONOR or NGO role from the user id in the request. It does not have login tokens. A later Spring Security login would stop a client from sending someone else's id.

## What you need installed

- JDK 17 (this project compiles with release 17)
- Maven 3.9+
- MySQL 8, **or** Docker Desktop if you use Compose instead of a local MySQL install

On this PC, `java -version` may show a newer JDK while Maven uses Temurin 17. Check with:

```powershell
mvn -version
```

The `Java version` line should be 17. If it is not, set `JAVA_HOME` to a JDK 17 folder and open a new terminal. Example:

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
```

## Manual setup with MySQL on your machine

1. Install MySQL 8 and start the MySQL service (Services app, or MySQL Workbench, or `net start MySQL80` if that service name exists).
2. Open a MySQL prompt as an administrator account. The default settings in `src/main/resources/application.properties` expect user `root` and password `root`.
3. Either keep those defaults, or create a dedicated account and edit the properties file.

Dedicated account:

```sql
CREATE DATABASE IF NOT EXISTS foodbridge;
CREATE USER IF NOT EXISTS 'foodbridge'@'localhost' IDENTIFIED BY 'foodbridge';
GRANT ALL PRIVILEGES ON foodbridge.* TO 'foodbridge'@'localhost';
FLUSH PRIVILEGES;
```

Then change these lines in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.username=foodbridge
spring.datasource.password=foodbridge
```

If your root password is not `root`, change `spring.datasource.password` to the real password. Hibernate creates the `users` and `donations` tables on startup (`spring.jpa.hibernate.ddl-auto=update`). You do not need to write `CREATE TABLE` statements.

4. From the backend folder, compile and run the tests (they use an in-memory H2 database, so MySQL can be stopped):

```powershell
cd C:\Users\admin\FoodBridge\backend
mvn test
```

5. Start the API:

```powershell
mvn spring-boot:run
```

The server listens on http://localhost:8080. Stop it with Ctrl+C.

## Manual setup with Docker

Docker starts MySQL and the API together. You do not need a local MySQL install. Port 3306 and port 8080 must be free.

```powershell
cd C:\Users\admin\FoodBridge\backend
docker compose up --build
```

The API waits until MySQL answers a health check. Compose sets the datasource to user `foodbridge` / password `foodbridge` on the `mysql` service. Data is kept in the `foodbridge-mysql-data` volume.

Stop the containers:

```powershell
docker compose down
```

Add `-v` only when you also want to delete the database volume.

## API

Dates use local date-time text without a timezone, for example `2026-11-22T18:30:00`.

| Method | Path | Success | Purpose |
| --- | --- | --- | --- |
| POST | `/api/users/register` | 201 | Register a DONOR or NGO |
| GET | `/api/users` | 200 | List users |
| GET | `/api/users/{id}` | 200 | Fetch one user |
| POST | `/api/donations` | 201 | Donor adds food |
| GET | `/api/donations` | 200 | List donations still AVAILABLE |
| GET | `/api/donations/{id}` | 200 | Fetch one donation, including collected ones |
| PUT | `/api/donations/{id}` | 200 | Donor updates an available donation |
| DELETE | `/api/donations/{id}?donorId=` | 204 | Donor deletes an available donation |
| POST | `/api/donations/{id}/collect` | 200 | NGO collects an available donation |

Common errors: `400` validation or a rule was broken, `404` missing user or donation, `409` duplicate email or the donation was already collected.

### Register

```powershell
curl.exe -X POST http://localhost:8080/api/users/register -H "Content-Type: application/json" -d "{\"name\":\"Asha Donor\",\"email\":\"asha@example.com\",\"password\":\"secret12\",\"role\":\"DONOR\"}"
```

```powershell
curl.exe -X POST http://localhost:8080/api/users/register -H "Content-Type: application/json" -d "{\"name\":\"Helping Hands\",\"email\":\"ngo@example.com\",\"password\":\"secret12\",\"role\":\"NGO\"}"
```

Use the numeric `id` values from those responses below. Registering the same email again returns 409. Role must be `DONOR` or `NGO`.

### Add, list, fetch, update, delete

```powershell
curl.exe -X POST http://localhost:8080/api/donations -H "Content-Type: application/json" -d "{\"foodName\":\"Veg biryani\",\"quantity\":10,\"preparedTime\":\"2026-11-22T12:00:00\",\"expiryTime\":\"2026-11-22T20:00:00\",\"pickupLocation\":\"Community Hall, Pune\",\"donorId\":1}"
```

```powershell
curl.exe http://localhost:8080/api/donations
curl.exe http://localhost:8080/api/donations/1
```

```powershell
curl.exe -X PUT http://localhost:8080/api/donations/1 -H "Content-Type: application/json" -d "{\"foodName\":\"Veg biryani (large tray)\",\"quantity\":8,\"preparedTime\":\"2026-11-22T12:00:00\",\"expiryTime\":\"2026-11-22T20:00:00\",\"pickupLocation\":\"Community Hall, Pune\",\"donorId\":1}"
```

```powershell
curl.exe -X DELETE "http://localhost:8080/api/donations/1?donorId=1"
```

`donorId` must be the donor who created that donation. Collected donations cannot be updated or deleted.

### Collect

```powershell
curl.exe -X POST http://localhost:8080/api/donations/1/collect -H "Content-Type: application/json" -d "{\"ngoId\":2}"
```

The status changes from `AVAILABLE` to `COLLECTED`. A second collect returns 409. A donor id, an unknown user, or an expired donation is rejected. After collection the item disappears from `GET /api/donations` and remains available at `GET /api/donations/{id}`.

## Tests

`mvn test` compiles the project and runs `FoodBridgeApplicationTests` plus `FoodBridgeApiTest`. API tests call the real controllers, services, and JPA repositories against H2. They cover registration, duplicate email, validation, create, list, fetch, update, delete, collection, duplicate collection, and expired food.

## Database configuration summary

| Setting | Local `application.properties` | Docker Compose |
| --- | --- | --- |
| URL | `jdbc:mysql://localhost:3306/foodbridge` | `jdbc:mysql://mysql:3306/foodbridge` |
| User | `root` (change if needed) | `foodbridge` |
| Password | `root` (change if needed) | `foodbridge` |
| Tables | Created by Hibernate on startup | Created by Hibernate on startup |
