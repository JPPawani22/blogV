import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';

const Write = () => {
  const navigate = useNavigate();
  const state = useLocation().state;
  const [value, setValue] = useState(state?.desc || '');
  const [title, setTitle] = useState(state?.title || '');
  const [file, setFile] = useState(null);
  const [cat, setCat] = useState(state?.cat || '');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [workingModel, setWorkingModel] = useState(null);

  // Gemini API configuration
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  console.log('Gemini API Key:', GEMINI_API_KEY ? 'Loaded' : 'Not found');

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
  };

  const upload = async () => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post('/api/upload', formData, {
        withCredentials: true
      });
      return res.data.filename;
    } catch (err) {
      console.error('Error uploading file:', err);
      showNotification('Error uploading image', 'error');
      return null;
    }
  };

  // Test all available models to find one that works
  const testAllModels = async () => {
    if (!GEMINI_API_KEY) {
      showNotification('API key not found', 'error');
      return null;
    }

    const models = [
      'gemini-pro',
      'gemini-1.0-pro',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'models/gemini-pro',
      'models/gemini-1.0-pro'
    ];

    for (const model of models) {
      try {
        console.log(`Testing model: ${model}`);
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
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
          console.log(`✅ Model ${model} works!`);
          setWorkingModel(model);
          showNotification(`✅ Connected to ${model}`, 'success');
          return model;
        }
      } catch (error) {
        console.log(`❌ Model ${model} failed:`, error.response?.status);
      }
    }

    showNotification('❌ No working models found. Check API key permissions.', 'error');
    return null;
  };

  // Test API connection
  const testAPI = async () => {
    const model = await testAllModels();
    return model !== null;
  };

  // Generic AI call function
  // Replace the callGeminiAPI function with:
const callGeminiAPI = async (prompt, config = {}) => {
  const response = await axios.post(
    '/api/gemini/generate',
    {
      prompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        ...config
      }
    },
    {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );

  return response.data;
};

  // Direct Gemini API call for content generation
  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      showNotification('Please enter a prompt for AI generation', 'error');
      return;
    }

    if (!GEMINI_API_KEY) {
      showNotification('Gemini API key not found. Please check your environment variables.', 'error');
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `Create a blog post about: "${aiPrompt}"${cat ? ` in the ${cat} category` : ''}. 
      Please provide a compelling title and well-structured content in HTML format. 
      The content should be rich, engaging, and properly formatted with HTML tags for a blog.
      
      Format your response as:
      TITLE: [Your generated title here]
      CONTENT: [Your HTML content here]`;

      const result = await callGeminiAPI(prompt);

      if (result.candidates && result.candidates[0]) {
        const aiText = result.candidates[0].content.parts[0].text;
        console.log('Raw AI Response:', aiText);
        
        // Parse the response
        const titleMatch = aiText.match(/TITLE:\s*(.+?)(?=CONTENT:|$)/i);
        const contentMatch = aiText.match(/CONTENT:\s*(.+)/is);
        
        if (titleMatch && contentMatch) {
          setTitle(titleMatch[1].trim());
          setValue(contentMatch[1].trim());
        } else {
          // Fallback: use first line as title, rest as content
          const lines = aiText.split('\n').filter(line => line.trim());
          const aiTitle = lines[0]?.replace(/^["']|["']$/g, '').trim() || `AI Post: ${aiPrompt.substring(0, 50)}...`;
          const aiContent = lines.slice(1).join('\n').trim() || aiText;
          
          setTitle(aiTitle);
          setValue(aiContent);
        }
        
        setShowAIAssistant(false);
        setAiPrompt('');
        showNotification('AI content generated successfully!', 'success');
      } else {
        throw new Error('No content generated');
      }
    } catch (err) {
      console.error('Error generating content with AI:', err);
      if (err.response?.status === 404) {
        showNotification('Model not available. Please try a different model.', 'error');
      } else if (err.response?.status === 403) {
        showNotification('API key is invalid or has insufficient permissions.', 'error');
      } else if (err.response?.status === 429) {
        showNotification('Rate limit exceeded. Please try again in a moment.', 'error');
      } else if (err.code === 'ECONNABORTED') {
        showNotification('Request timeout. The AI is taking too long to respond.', 'error');
      } else {
        showNotification('Error generating content with AI. Please try again.', 'error');
      }
    } finally {
      setAiLoading(false);
    }
  };

  // Direct Gemini API call for recommendations
  const getRecommendations = async () => {
    if (!title && !value) {
      showNotification('Please add some content first to get recommendations', 'error');
      return;
    }

    if (!GEMINI_API_KEY) {
      showNotification('Gemini API key not found. Please check your environment variables.', 'error');
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `As a writing assistant, provide 3 concise recommendations to improve this blog post:
      
      Title: "${title}"
      Content: "${value.substring(0, 1000)}..."${cat ? `\nCategory: ${cat}` : ''}
      
      Please provide specific, actionable suggestions for improvement. Return only the recommendations as a bulleted list.`;

      const result = await callGeminiAPI(prompt, {
        temperature: 0.5,
        maxOutputTokens: 1024,
      });

      if (result.candidates && result.candidates[0]) {
        const recommendations = result.candidates[0].content.parts[0].text;
        showNotification(`AI Recommendations: ${recommendations}`, 'info');
      } else {
        throw new Error('No recommendations generated');
      }
    } catch (err) {
      console.error('Error getting recommendations:', err);
      showNotification('Error getting AI recommendations. Please try again.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // Enhanced AI features
  const improveWriting = async () => {
    if (!value.trim()) {
      showNotification('Please add some content to improve', 'error');
      return;
    }

    if (!GEMINI_API_KEY) {
      showNotification('Gemini API key not found.', 'error');
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `Please improve the writing quality of this blog post content while maintaining its original meaning and style. Return only the improved version without any additional explanations:

      "${value.substring(0, 3000)}"`;

      const result = await callGeminiAPI(prompt, {
        temperature: 0.3,
        maxOutputTokens: 2048,
      });

      if (result.candidates && result.candidates[0]) {
        const improvedContent = result.candidates[0].content.parts[0].text;
        setValue(improvedContent);
        showNotification('Writing improved successfully!', 'success');
      }
    } catch (err) {
      console.error('Error improving writing:', err);
      showNotification('Error improving writing. Please try again.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const generateTitle = async () => {
    if (!value.trim() && !aiPrompt.trim()) {
      showNotification('Please add some content or a prompt to generate a title', 'error');
      return;
    }

    if (!GEMINI_API_KEY) {
      showNotification('Gemini API key not found.', 'error');
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `Generate a compelling blog post title based on: ${value ? `this content: "${value.substring(0, 500)}..."` : `this topic: "${aiPrompt}"`}${cat ? ` in the ${cat} category` : ''}. Return only the title without any additional text. Make it engaging and click-worthy.`;

      const result = await callGeminiAPI(prompt, {
        temperature: 0.7,
        maxOutputTokens: 100,
      });

      if (result.candidates && result.candidates[0]) {
        const generatedTitle = result.candidates[0].content.parts[0].text.trim();
        setTitle(generatedTitle);
        showNotification('Title generated successfully!', 'success');
      }
    } catch (err) {
      console.error('Error generating title:', err);
      showNotification('Error generating title. Please try again.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();
    
    if (!title || !value || !cat) {
      showNotification('Please fill in all required fields: title, content, and category', 'error');
      return;
    }

    setLoading(true);
    try {
      let imgUrl = state?.img || '';
      if (file) {
        imgUrl = await upload();
        if (!imgUrl) return;
      }

      if (state) {
        await axios.put(`/api/posts/${state.id}`, {
          title,
          desc: value,
          cat,
          img: imgUrl,
        }, {
          withCredentials: true
        });
        showNotification('Post updated successfully!', 'success');
      } else {
        await axios.post(`/api/posts/`, {
          title,
          desc: value,
          cat,
          img: imgUrl,
          date: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
        }, {
          withCredentials: true
        });
        showNotification('Post published successfully!', 'success');
      }

      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      console.error('Error saving post:', err);
      showNotification('Error saving post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='add'>
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button 
            className="notification-close"
            onClick={() => setNotification({ show: false, message: '', type: '' })}
          >
            ×
          </button>
        </div>
      )}
      
      <div className="content">
        <div className="title-section">
          <input
            type="text"
            value={title}
            placeholder='Enter your post title...'
            onChange={e => setTitle(e.target.value)}
            className="title-input"
          />
          <button 
            type="button" 
            className="ai-title-btn"
            onClick={generateTitle}
            disabled={aiLoading}
            title="Generate title with AI"
          >
            {aiLoading ? '⚡' : '✨'}
          </button>
        </div>
        
        <div className="ai-assistant-buttons">
          <button 
            type="button" 
            className="ai-btn"
            onClick={() => setShowAIAssistant(!showAIAssistant)}
          >
            {showAIAssistant ? 'Hide AI Assistant' : 'Show AI Assistant'}
          </button>
          <button 
            type="button" 
            className="ai-btn secondary"
            onClick={getRecommendations}
            disabled={aiLoading || (!title && !value)}
          >
            {aiLoading ? '🔮 Analyzing...' : 'Get Recommendations'}
          </button>
          <button 
            type="button" 
            className="ai-btn secondary"
            onClick={improveWriting}
            disabled={aiLoading || !value}
          >
            {aiLoading ? '✍️ Improving...' : 'Improve Writing'}
          </button>
          <button 
            type="button" 
            className="ai-btn test-btn"
            onClick={testAPI}
            disabled={!GEMINI_API_KEY}
          >
            {workingModel ? `Connected: ${workingModel}` : 'Test API Connection'}
          </button>
        </div>

        {showAIAssistant && (
          <div className="ai-assistant">
            <h3>🤖 AI Writing Assistant {workingModel && `(${workingModel})`}</h3>
            <p className="ai-description">Describe what you want to write about, and AI will generate a complete blog post for you.</p>
            <textarea
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="Example: 'The benefits of meditation for mental health in the modern workplace' or 'A beginner's guide to sustainable gardening'..."
              rows="4"
              className="ai-prompt-input"
            />
            <div className="ai-assistant-actions">
              <button 
                type="button" 
                onClick={generateWithAI}
                disabled={aiLoading || !aiPrompt.trim()}
                className="generate-btn"
              >
                {aiLoading ? '🎨 Generating...' : '🚀 Generate Full Post'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setAiPrompt('');
                  setShowAIAssistant(false);
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
            {!GEMINI_API_KEY && (
              <div className="api-warning">
                ⚠️ Gemini API key not found. Please check your environment variables.
              </div>
            )}
            {workingModel && (
              <div className="api-success">
                ✅ Connected to: {workingModel}
              </div>
            )}
          </div>
        )}

        <div className="editorContainer">
          <ReactQuill
            className="editor"
            theme="snow"
            value={value}
            onChange={setValue}
            placeholder="Start writing your amazing post... You can use the AI assistant above to help you generate content!"
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['blockquote', 'code-block'],
                ['link', 'image'],
                [{ 'align': [] }],
                ['clean']
              ],
            }}
          />
        </div>
      </div>

      <div className="menu">
        <div className="item">
          <h1>📤 Publish</h1>
          <span>
            <b>Status: </b> <span className="status-draft">Draft</span>
          </span>
          <span>
            <b>Visibility: </b> <span className="status-public">Public</span>
          </span>
          <input
            style={{ display: 'none' }}
            type="file"
            id="file"
            onChange={e => setFile(e.target.files[0])}
            accept="image/*"
          />
          <label className="file" htmlFor="file">
            {file ? `📷 ${file.name}` : '📁 Upload Featured Image'}
          </label>
          {file && (
            <button 
              type="button" 
              className="remove-file"
              onClick={() => setFile(null)}
            >
              Remove
            </button>
          )}
          <div className="buttons">
            <button type="button" className="save-draft">
              💾 Save Draft
            </button>
            <button onClick={handleClick} disabled={loading} className="publish-btn">
              {loading ? '⏳ Publishing...' : state ? '📝 Update' : '🚀 Publish'}
            </button>
          </div>
        </div>

        <div className="item">
          <h1>📑 Category</h1>
          <p className="category-description">Choose a category for your post:</p>
          {['art', 'science', 'technology', 'cinema', 'design', 'food'].map(category => (
            <div className="cat" key={category}>
              <input
                type="radio"
                name="cat"
                checked={cat === category}
                value={category}
                id={category}
                onChange={e => setCat(e.target.value)}
              />
              <label htmlFor={category}>
                <span className={`category-icon category-${category}`}>
                  {category === 'art' ? '🎨' : 
                   category === 'science' ? '🔬' : 
                   category === 'technology' ? '💻' : 
                   category === 'cinema' ? '🎬' : 
                   category === 'design' ? '🎯' : 
                   '🍴'}
                </span>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </label>
            </div>
          ))}
        </div>

        <div className="item">
          <h1>🤖 AI Features</h1>
          <div className="ai-features">
            <button 
              type="button" 
              className="ai-feature-btn"
              onClick={generateTitle}
              disabled={aiLoading}
            >
              Generate Title
            </button>
            <button 
              type="button" 
              className="ai-feature-btn"
              onClick={improveWriting}
              disabled={aiLoading || !value}
            >
              Improve Writing
            </button>
            <button 
              type="button" 
              className="ai-feature-btn"
              onClick={getRecommendations}
              disabled={aiLoading || (!title && !value)}
            >
              Get Tips
            </button>
            <button 
              type="button" 
              className="ai-feature-btn test-btn"
              onClick={testAPI}
            >
              {workingModel ? 'Reconnect' : 'Find Working Model'}
            </button>
          </div>
          {workingModel && (
            <div className="model-info">
              <small>Using: {workingModel}</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Write;