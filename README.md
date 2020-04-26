# Carsome Socket Challenge

## Description

Socket service for car bidding with cluster enabled using NestJS, TypeORM, Socket.io Redis for broadcast across nodes and Postgres as storage.

A simple frontend to showcase the socket service built using Vue.js.

Container ready through Docker for simulating multiple instances of socket capabilities.

## Install dependencies

```bash
# socket service dependencies
$ yarn

# frontend dependencies
$ yarn
$ yarn build
```

## Running the app

The socket service is configured with 2 instances that listening on port `3000` and `4000`.

```bash
$ docker-compose up

```

Navigate to `http://localhost:3000` or `http://localhost:4000` to access the frontend.

## Running the simulation

The simulation contains 2 mode, `sync` and `real`.

```bash
# The `sync` mode follow the challenge requirement.
$ yarn simulate

# The `real` mode will cast the bids asynchronously mimicking real-world situation.
$ yarn simulate:real

```
