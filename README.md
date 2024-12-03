## Project: GraphQL with Apollo Sandbox and PostGraphile Middleware

This project demonstrates how to embed Apollo Sandbox in an Angular application and uses PostGraphile as middleware to automatically generate and expose GraphQL APIs of a PostgreSQL database in a NestJS application.

### Getting Started

Follow these steps to serve both the Angular and NestJS applications on your local environment.

#### Step 0: Prerequisites

- npm
- Node.js
- Angular CLI

#### Step 1: Serve the Angular App

- In a new terminal, navigate to the angular directory and install dependencies and start the Angular app
- The app will be accessible at http://localhost:4200.

```
cd angular
npm install
ng serve
```

#### Step 2: Serve the NestJS App

- In another terminal, navigate to the nestjs directory, install dependencies, and start the NestJS server
- The app will be accessible at http://localhost:3000.

```
cd nestjs
npm install
npm run start
```

### Blog Posts

https://medium.com/@gracegan_7/graphql-apis-with-postgraphile-auth0-in-nestjs-26b4cef7cded
https://medium.com/@gracegan_7/apollo-sandbox-in-angular-with-auth0-839d6ebf5d23
https://medium.com/@gracegan_7/custom-subscription-with-postgraphile-in-nestjs-3f26440e3154
