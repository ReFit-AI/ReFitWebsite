# Mobile API Documentation

## Overview

This is the dedicated API for the Refit mobile application, designed specifically for Solana Saga integration. All endpoints are prefixed with `/api/mobile/v1/` to maintain separation from the main web application.

## Authentication

All endpoints (except `/auth/connect`) require a Bearer token in the Authorization header:

```
Authorization: Bearer <session_token>
```

## Base URL

```
https://your-domain.com/api/mobile/v1
```

## Endpoints

### Authentication

#### POST `/auth/connect`
Connect a Solana wallet to create a mobile session.

**Request Body:**
```json
{
  "publicKey": "wallet_public_key",
  "signature": "message_signature",
  "message": "signed_message"
}
```

**Response:**
```json
{
  "sessionToken": "uuid",
  "expiresAt": "2024-01-01T00:00:00Z",
  "walletAddress": "wallet_public_key"
}
```

### Phone Management

#### GET `/phone/models`
Get all available phone models and their pricing.

**Response:**
```json
{
  "models": [
    {
      "model": "iPhone 16 Pro Max",
      "basePrice": 1199,
      "conditions": [
        {
          "condition": "excellent",
          "multiplier": 0.85,
          "estimatedPrice": 1019
        }
      ]
    }
  ],
  "lastUpdated": "2024-01-01T00:00:00Z",
  "currency": "USD"
}
```

#### POST `/phone/quote`
Generate a quote for a specific phone.

**Request Body:**
```json
{
  "model": "iPhone 16 Pro Max",
  "condition": "excellent",
  "carrier": "unlocked",
  "storage": "256GB"
}
```

**Response:**
```json
{
  "quoteId": "uuid",
  "model": "iPhone 16 Pro Max",
  "condition": "excellent",
  "carrier": "unlocked",
  "storage": "256GB",
  "quoteUSD": 1120,
  "quoteSOL": 7.4667,
  "solPrice": 150,
  "expiresAt": "2024-01-01T00:10:00Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## Database Schema

### mobile_sessions table
```sql
CREATE TABLE mobile_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token UUID NOT NULL UNIQUE,
  wallet_address TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  device_info TEXT,
  last_used TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Rate Limiting

- 100 requests per minute per session token
- 10 requests per minute for unauthenticated endpoints

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE" // optional
}
```

Common HTTP status codes:
- 400: Bad Request
- 401: Unauthorized
- 429: Too Many Requests
- 500: Internal Server Error