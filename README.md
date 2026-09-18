# Vercel Image Generator API

A minimal Vercel serverless API for generating images from a text prompt.

## Deploy

1. Import this repository into Vercel.
2. Deploy with the default settings.
3. Call the endpoint:

```text
GET https://YOUR-DOMAIN.vercel.app/api/generate?prompt=a%20futuristic%20city%20at%20sunset
```

The endpoint also accepts JSON via `POST`:

```bash
curl -X POST https://YOUR-DOMAIN.vercel.app/api/generate \
  -H "content-type: application/json" \
  -d '{"prompt":"a futuristic city at sunset","width":1024,"height":1024,"seed":42}' \
  --output image.jpg
```

Supported fields: `prompt`, `width`, `height`, and `seed`. Width and height are limited to 256–2048 pixels to prevent accidental oversized requests.

## Important limitation

There is no application-level request counter or artificial quota in this code, but “unlimited” requests cannot be guaranteed. Vercel has execution, bandwidth, concurrency, and plan limits, and the upstream image provider may also throttle or change availability. Add authentication and rate limiting before exposing this publicly to avoid abuse and unexpected bills.
