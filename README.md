# Book Recommendation System Documentation

> **⚠️ IMPORTANT:** Before running the application, **run the seeder** to populate the database with initial data.
>
> ```bash
> yarn seed
> ```

## Table of Contents

1. [Project Overview](#project-overview)
2. [Setup and Installation](#setup-and-installation)
   - [Running with Docker](#running-with-docker)
   - [Running Locally (Without Docker)](#running-locally-without-docker)
3. [Database Initialization](#database-initialization)
4. [API Endpoints](#api-endpoints)
5. [Testing & Coverage](#testing--coverage)
6. [Additional Notes](#additional-notes)

---

## Project Overview

The **Book Recommendation System** is an API that helps users discover books based on their preferences, reading history, and ratings. The system supports:

- **User Registration & Authentication** (JWT-based)
- **Role-based Access Control** (Admin/User)
- **Book Management**
- **Reading Progress Tracking**
- **Top Recommended Books** based on reading activity

The system also includes a **Health Check** to monitor the application's uptime and status.

---

## Setup and Installation

### Running with Docker

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Abduallah-Mohamed/reading_recommendation_system.git
   cd reading_recommendation_system
   ```

2. **Run Docker Compose:**

   ```bash
   docker-compose up --build
   ```

   This will:

   - Build the Docker images.
   - Seed the database automatically.
   - Start the application on [http://localhost:3000/api/v1/health-check](http://localhost:3000/api/v1/health-check).

3. **Access Swagger Docs:**
   Visit [http://localhost:3000/api/docs](http://localhost:3000/api/docs) for API documentation.

### Running Locally (Without Docker)

1. **Install Dependencies:**

   ```bash
   yarn install
   ```

2. **Set Up Environment Variables:**
   Create a `.env` file based on `.env.example` and configure your database settings.

3. **Run Database Seeder:**

   ```bash
   yarn seed
   ```

4. **Start the Application:**

   ```bash
   yarn start:dev
   ```

5. **Access Swagger Docs:**
   Visit [http://localhost:3000/api/docs](http://localhost:3000/api/docs).

---

## Database Initialization

Run the following SQL queries if you prefer manual database setup:

### Create Tables:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user'
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    num_of_pages INT NOT NULL
);

CREATE TABLE readings (
    id SERIAL PRIMARY KEY,
    start_page INT NOT NULL,
    end_page INT NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    book_id INT REFERENCES books(id) ON DELETE CASCADE
);
```

### Insert Sample Data:

```sql
INSERT INTO users (username, email, password, role) VALUES
('admin_user', 'admin@example.com', '<hashed_password_admin>', 'admin'),
('john_doe', 'john@example.com', '<hashed_password_1>', 'user');

INSERT INTO books (title, num_of_pages) VALUES
('To Kill a Mockingbird', 281),
('1984', 328),
('The Great Gatsby', 180),
('Pride and Prejudice', 279),
('The Catcher in the Rye', 214);

INSERT INTO readings (start_page, end_page, user_id, book_id) VALUES
(1, 50, 1, 1),
(10, 100, 2, 2),
(20, 150, 1, 3);
```

### Reset Database:

```sql
DROP TABLE IF EXISTS readings;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS users;
```

---

## API Endpoints

### **Authentication**

- **Register:** `POST /api/v1/auth/register`

  - Registers a new user with hashed password.

- **Login:** `POST /api/v1/auth/login`
  - Authenticates a user and returns a JWT token.

### **Books**

- **Create Book:** `POST /api/v1/books`

  - Add a new book. Admin guard added by default.

- **Get Top Recommended:** `GET /api/v1/books/top-recommended`

  - Retrieves top 5 books based on pages read.

### **Readings**

- **Create Reading:** `POST /api/v1/readings`
  - Log reading progress by specifying `book_id`, `start_page`, and `end_page`.

### **Health Check**

- **Health Status:** `GET /api/v1/health-check`
  - Simple endpoint to verify the application's health.

---

## Testing & Coverage

Run tests using:

```bash
yarn test
```

**Coverage Report:**

```bash
yarn test:cov
```

Our current test coverage exceeds **85%**, covering unit and integration tests across major modules like authentication, book management, and reading tracking.

---

## Additional Notes

- **Seeding:** The application uses custom seeders to populate initial data. Always run `yarn seed` after cloning the repository.
- **Swagger Documentation:** All API endpoints and models are documented using Swagger and accessible at `/api/docs`.
- **Postman Collection:** You can import the provided Postman collection `Book Recommendation System.postman_collection.json` for easy API testing.

---

Enjoy using the **Book Recommendation System**! 📖🚀
