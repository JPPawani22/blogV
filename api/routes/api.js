// In your backend (e.g., app.js or routes/api.js)
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, config } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: config
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});