export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Use GET or POST' });
  }

  try {
    const input = req.method === 'POST'
      ? (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}))
      : req.query;

    const prompt = String(input.prompt || '').trim();
    if (!prompt) {
      return res.status(400).json({
        error: 'prompt is required',
        example: '/api/generate?prompt=a%20sunset%20over%20mountains'
      });
    }

    if (prompt.length > 1000) {
      return res.status(400).json({ error: 'prompt must be 1000 characters or less' });
    }

    const width = clampNumber(input.width, 1024, 256, 2048);
    const height = clampNumber(input.height, 1024, 256, 2048);
    const seed = input.seed === undefined || input.seed === ''
      ? Math.floor(Math.random() * 2_147_483_647)
      : clampNumber(input.seed, 0, 0, 2_147_483_647);

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;
    const upstream = await fetch(imageUrl);

    if (!upstream.ok) {
      return res.status(502).json({ error: 'Image provider failed', status: upstream.status });
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Image-Seed', String(seed));
    return res.status(200).send(buffer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not generate image' });
  }
}

function clampNumber(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}
