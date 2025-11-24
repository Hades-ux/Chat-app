Overview

This project is a full-stack real-time chat application designed to simulate the architecture of modern messaging platforms.
It focuses on performance, security, background processing, and distributed system concepts.

The system uses:

React for the responsive UI

Node.js (Express) as the main API + WebSocket server

Redis for caching + Pub/Sub

Python background workers for message filtering

Java high-performance filters for heavy text processing

JWT with HttpOnly cookies for secure authentication

Docker for multi-service deployment

This project is designed to demonstrate system design thinking, multi-language pipelines, and production-grade backend skills for interviews.

🧩 Features

🔐 Authentication

JWT authentication with HttpOnly cookies

Secure session handling

Automatic token refresh

💬 Real-Time Messaging

Send & receive messages instantly

WebSocket-based communication

Delivery acknowledgment

⌨️ Typing Indicator

Real-time "user is typing…" status

Only visible in 1-on-1 chats

Efficient throttled events

🟢 Online/Offline Status

Presence tracking using Redis

Auto-updates when users connect/disconnect

⚙️ Multi-Language Message Filter Pipeline

Why? To simulate how large chat apps use microservices for extra processing.

Components:

Python worker: NLP-based filter

Java worker: High-performance profanity + spam detector

Redis → Pub/Sub for inter-service communication

🗂️ Backend Functionality

Modular Express architecture

Proper input validation

Centralized error handling

Logging system

Rate limiting (anti-abuse)

🐳 Dockerized Deployment

Node service

React service

Python worker

Java worker

Redis

Nginx optional