# Project Management API

This is a **Project Management API** built using **NestJS** and **Prisma ORM**, providing **JWT authentication**, **Role-Based Access Control (RBAC)**, and **Swagger API documentation**. The application supports **project** and **task management**, and different user roles define access to various features.

## Table of Contents

1. [Technologies Used](#technologies-used)
2. [Features](#features)
3. [Setup](#setup)
4. [API Documentation](#api-documentation)
5. [Authentication](#authentication)
6. [RBAC (Role-Based Access Control)](#rbac-role-based-access-control)
7. [Environment Variables](#environment-variables)
8. [Running Tests](#running-tests)

## Technologies Used

- **NestJS**: Node.js framework for building efficient and scalable server-side applications.
- **Prisma**: Modern ORM for database interactions, replacing TypeORM.
- **JWT**: JSON Web Token for authentication and securing routes.
- **jsonwebtoken**: For creating and verifying JWT tokens.
- **bcrypt**: For hashing passwords.
- **Swagger**: API documentation for easier exploration and testing of endpoints.

## Features

- **User Authentication**: JWT-based login system.
- **Role-Based Access Control (RBAC)**: Protects routes based on user roles (OWNER, ADMIN, CONTRIBUTOR).
- **Project and Task Management**: Ability to create, update, start, complete, and delete projects and tasks.
- **Swagger Documentation**: Automatically generated API documentation for easy exploration.

## Setup

### 1. Make Sure Node.js is Installed

Before proceeding, make sure **Node.js** is installed on your machine. You can verify this by running:

```bash
node -v
```

If Node.js is not installed, you can download it from [nodejs.org](https://nodejs.org/) and follow the installation instructions.

### 2. Clone the repository

```bash
git clone https://github.com/ericjmoliveira/project-management-api.git
cd project-management-api
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

In the root directory of the project, you'll find a `.env.example` file. This file contains all the environment variables that the application requires. Copy the contents of the `.env.example` file to a new file named `.env` and set the following variables:

```env
# Database variables
DATABASE_URL=

# JWT variables
JWT_SECRET=

# Other variables
PORT=3000  # Default port for the server (can be customized)
```

### 5. Docker Compose for PostgreSQL Database

This project includes a `docker-compose.yml` file that will set up a PostgreSQL database container. To run the PostgreSQL database using Docker Compose:

1. Make sure you have **Docker** and **Docker Compose** installed on your machine.
2. From the root directory of the project, run the following command to start the PostgreSQL container:

```bash
docker-compose up -d
```

This will start a PostgreSQL container with the following credentials:

- **Username**: `johndoe`
- **Password**: `randompassword`
- **Database Name**: `mydb`

Additionally, the PostgreSQL data will persist in the volume `postgres_data` to ensure it is not lost when the container is restarted.

3. After the PostgreSQL container is running, the database will be accessible at `localhost:5432`.

4. Update the `.env` file with the correct `DATABASE_URL` to match the PostgreSQL configuration from the `docker-compose.yml` file:

```env
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
```

### 6. Prisma Setup

1. Run Prisma to push the schema to the database:

```bash
npx prisma db push
```

This command will synchronize the Prisma schema with the PostgreSQL database and automatically create the necessary tables.

### 7. Run the application

To run the application locally, use the following command:

```bash
npm run start:dev
```

The application will be available at `http://localhost:3000`.

## API Documentation

The API is documented using **Swagger**. To access the documentation, navigate to:

```
http://localhost:3000/api/docs
```

Here, you can see all available routes, request parameters, and test the endpoints directly.

## RBAC (Role-Based Access Control)

Roles and permissions are defined as follows:

### Roles and Permissions:

- **OWNER**:

  - Can create, update, delete, and manage projects and tasks.
  - Can invite and remove members.
  - Can start and complete tasks.
  - Full control over project and task management.

- **ADMIN**:

  - Can update project details.
  - Can create, update, delete, and manage tasks.
  - Can invite and remove members.
  - Cannot start or delete projects.

- **CONTRIBUTOR**:
  - Can start tasks.
  - Can complete tasks.
  - Cannot create, update, or delete projects.
  - Cannot manage project members.

### Role Assignment

Roles are assigned during user registration or can be updated by an owner or admin. The user object in the database has a `role` field (e.g., `'OWNER'`, `'ADMIN'`, `'CONTRIBUTOR'`).

## Environment Variables

Make sure the following environment variables are configured correctly in the `.env` file:

| Variable       | Description                                        |
| -------------- | -------------------------------------------------- |
| `JWT_SECRET`   | Secret key for signing JWT tokens.                 |
| `DATABASE_URL` | Database connection URL (PostgreSQL, MySQL, etc.). |
| `PORT`         | Port on which the server runs (default is `3000`). |

## Running Tests

To run the tests, use the following command:

```bash
npm run test
```

This will execute the tests for the project. You can also run the tests in watch mode:

```bash
npm run test:watch
```
