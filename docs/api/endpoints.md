# API Endpoints (Recommended)

This page suggests the endpoints that the frontend expects when using a real backend.

- GET /rewards — returns list of rewards (array of Reward)
- GET /rewards/:id — returns single reward by id
- POST /rewards/:id/open — attempts to open a reward and returns status + updated reward

Example response shape (GET /rewards)

```json
[
  {
    "id": "1",
    "name": "Common NFT",
    "description": "...",
    "image": "https://...",
    "probability": 0.5,
    "remaining": 45,
    "total": 100,
    "type": "common"
  }
]
```

Authentication & headers
- Use a Bearer token or API key if endpoints are protected. Set `NEXT_PUBLIC_API_URL` to Base URL.

Caching
- Consider ETag or Cache-Control headers for performance.
