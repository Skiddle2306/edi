# ServerManager

Distributed server monitoring and vulnerability detection system built using:

- Spring Boot (Server)
- Spring Boot (Client Agents)
- Node.js
- React + Vite
- PostgreSQL

---

# Setup Guide

## Requirements

Install the following:

- Java 17+
- Maven
- Node.js (v18+ recommended)
- PostgreSQL
- npm

---

# 1. Database Setup

## Create Database

```sql
CREATE DATABASE servermanager;
```

---

## Use Database

```sql
\c servermanager;
```

---

## Create Tables

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,

    PRIMARY KEY (user_id, role_id),

    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE
);

CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_post_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comment_post
        FOREIGN KEY (post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comment_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
```

---

# 2. Spring Boot Server Setup

Go to the server folder:

```bash
cd server
```

---

## Configure Database

Edit:

```text
src/main/resources/application.properties
```

Add:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/servermanager
spring.datasource.username=postgres
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

## Install Dependencies & Run

```bash
mvn clean install
mvn spring-boot:run
```

Server starts at:

```text
http://localhost:8080
```

---

# 3. Spring Boot Client Setup

Go to the client folder:

```bash
cd client
```

---

## Create Client Config

Create file:

```text
client-config.properties
```

Add:

```properties
server.url=http://localhost:8080
client.name=client-1
```

---

## Run Client

```bash
mvn clean install
mvn spring-boot:run
```

Run multiple clients with different:

```properties
client.name
```

values.

---

# 4. Node.js Server Setup

Go to node server folder:

```bash
cd node-server
```

---

## Install Dependencies

```bash
npm install
```

---

## Run Node Server

```bash
npm start
```

or

```bash
node index.js
```

Server runs at:

```text
http://localhost:3000
```

---

# 5. React + Vite Frontend Setup

Go to frontend folder:

```bash
cd frontend
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment

Create:

```text
.env
```

Add:

```env
VITE_API_URL=http://localhost:3000
```

---

## Run Frontend

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

# Running Full System

## Step 1 — Start PostgreSQL

Ensure PostgreSQL is running.

---

## Step 2 — Start Spring Server

```bash
cd server
mvn spring-boot:run
```

---

## Step 3 — Start Node.js Server

```bash
cd node-server
npm install
npm start
```

---

## Step 4 — Start React Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Step 5 — Start Client Agents

```bash
cd client
mvn spring-boot:run
```

Run multiple clients on different systems.

---
