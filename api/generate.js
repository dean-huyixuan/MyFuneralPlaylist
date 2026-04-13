export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const response = await fetch('https://api.siliconflow.cn/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen-Image',
        prompt: prompt,
        image_size: '1024x1024',
        num_inference_steps: 50,
        cfg: 4
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || `Status ${response.status}`);
    }

    const imageUrl = data.images && data.images[0] && data.images[0].url;
    if (!imageUrl) {
      throw new Error('No image URL returned');
    }

    res.status(200).json({ imageUrl, timings: data.timings || null, seed: data.seed || null });

  } catch (error) {
    res.status(500).json({ error: error.message || 'Generation failed' });
  }
}
