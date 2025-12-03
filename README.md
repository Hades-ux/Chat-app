Overview

This project is a full-stack real-time chat application designed to simulate the architecture of modern messaging platforms.
It focuses on performance, security, background processing, and distributed system concepts.

The system uses:

React for the responsive UI

Node.js (Express) as the main API + WebSocket server

Redis for caching + Pub/Sub

JWT with HttpOnly cookies for secure authentication


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

🗂️ Backend Functionality

Modular Express architecture

Proper input validation

Centralized error handling

Logging system

Rate limiting (anti-abuse)