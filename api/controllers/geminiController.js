const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// List of models to try in order
const AVAILABLE_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-1.0-pro',
  'models/gemini-pro'
];

const generateContent = async (req, res) => {
  try {
    const { prompt, config = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required'
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key not configured on server'
      });
    }

    let lastError = null;

    // Try each model until one works
    for (const model of AVAILABLE_MODELS) {
      try {
        console.log(`Trying model: ${model}`);
        
        const response = await axios.post(
          `${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`,
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
            generationConfig: {
              temperature: config.temperature || 0.7,
              topK: config.topK || 40,
              topP: config.topP || 0.95,
              maxOutputTokens: config.maxOutputTokens || 2048,
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000 // 30 seconds timeout
          }
        );

        if (response.data.candidates && response.data.candidates[0]) {
          console.log(`✅ Success with model: ${model}`);
          return res.json({
            ...response.data,
            modelUsed: model
          });
        }
      } catch (error) {
        lastError = error;
        console.log(`❌ Model ${model} failed:`, error.response?.status, error.response?.statusText);
        
        // If it's not a model availability error, break
        if (error.response?.status !== 404 && error.response?.status !== 400) {
          break;
        }
      }
    }

    // If all models failed
    throw lastError || new Error('All models failed');

  } catch (error) {
    console.error('Error in generateContent:', error.response?.data || error.message);

    // Handle specific error cases
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'No available models found. Please check your API key permissions.'
      });
    } else if (error.response?.status === 403) {
      return res.status(403).json({
        error: 'API key is invalid or has insufficient permissions.'
      });
    } else if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.'
      });
    } else if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        error: 'Request timeout. The AI is taking too long to respond.'
      });
    } else {
      return res.status(500).json({
        error: 'Internal server error',
        details: error.response?.data?.error?.message || error.message
      });
    }
  }
};

// Test all available models
const testModels = async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key not configured'
      });
    }

    const workingModels = [];

    for (const model of AVAILABLE_MODELS) {
      try {
        const response = await axios.post(
          `${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: "Say 'Hello' in one word"
                  }
                ]
              }
            ]
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000
          }
        );

        if (response.data.candidates && response.data.candidates[0]) {
          workingModels.push(model);
        }
      } catch (error) {
        console.log(`Model ${model} failed:`, error.response?.status);
      }
    }

    res.json({
      workingModels,
      totalTested: AVAILABLE_MODELS.length,
      available: workingModels.length > 0
    });

  } catch (error) {
    console.error('Error testing models:', error);
    res.status(500).json({
      error: 'Error testing models',
      details: error.message
    });
  }
};

module.exports = {
  generateContent,
  testModels
};