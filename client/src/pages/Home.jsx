import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const cat = useLocation().search;

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/posts${cat}`);
        setPosts(res.data);
      } catch (err) {
        console.error('Error fetching posts:', err);
        showNotification('Error loading posts', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cat]);

  const getText = (html) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  // Fixed function to handle both external URLs and local files
  const getImageUrl = (imgPath) => {
    if (!imgPath) return null;
    
    console.log('Original image path:', imgPath);
    
    // Check if it's an external URL (starts with http:// or https://)
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      console.log('Detected external URL, using as-is');
      return imgPath;
    }
    
    // Check if it's already a proper path
    if (imgPath.startsWith('/api/upload/') || imgPath.startsWith('/upload/')) {
      console.log('Already has proper path, using as-is');
      return imgPath;
    }
    
    // It's a local filename, prepend the API upload path
    console.log('Detected local file, adding API upload path');
    return `/api/upload/${imgPath}`;
  };

  // Function to handle image loading errors
  const handleImageError = (e) => {
    console.error('Image failed to load:', e.target.src);
    const parent = e.target.parentElement;
    
    // Hide the broken image
    e.target.style.display = 'none';
    
    // Show fallback
    parent.classList.add('image-error');
    
    // Create fallback element if it doesn't exist
    if (!parent.querySelector('.image-fallback')) {
      const fallback = document.createElement('div');
      fallback.className = 'image-fallback';
      fallback.innerHTML = `
        <div class="fallback-content">
          <span class="fallback-icon">📷</span>
          <span class="fallback-text">Image not available</span>
          <small>URL: ${e.target.src}</small>
        </div>
      `;
      parent.appendChild(fallback);
    }
  };

  // Function to handle successful image load
  const handleImageLoad = (e, imageUrl) => {
    console.log('Image loaded successfully:', imageUrl);
    e.target.parentElement.classList.remove('image-error');
  };

  // Debug: Log posts data to see what's being received
  useEffect(() => {
    if (posts.length > 0) {
      console.log('=== POSTS DATA DEBUG ===');
      console.log('Total posts:', posts.length);
      posts.forEach((post, index) => {
        const imageUrl = getImageUrl(post.img);
        console.log(`Post ${index}:`, {
          id: post.id,
          title: post.title,
          originalImg: post.img,
          finalImageUrl: imageUrl,
          imageType: imageUrl?.startsWith('http') ? 'EXTERNAL' : 'LOCAL'
        });
      });
      console.log('=== END DEBUG ===');
    }
  }, [posts]);

  return (
    <div className='home'>
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
      
      <div className="posts">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            Loading posts...
          </div>
        ) : posts.length > 0 ? (
          posts.map((post, index) => {
            const imageUrl = getImageUrl(post.img);
            
            return (
              <div 
                className={`post ${index === 0 ? 'featured' : ''}`} 
                key={post.id || index}
              >
                <div className="img">
                  {imageUrl && post.img ? (
                    <img 
                      src={imageUrl} 
                      alt={post.title}
                      onError={handleImageError}
                      onLoad={(e) => handleImageLoad(e, imageUrl)}
                      loading="lazy"
                    />
                  ) : (
                    <div className="image-fallback">
                      <div className="fallback-content">
                        <span className="fallback-icon">📷</span>
                        <span className="fallback-text">No image available</span>
                        {post.img && (
                          <small className="fallback-url">Path: {post.img}</small>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="content">
                  <Link className="link" to={`/post/${post.id}`}>
                    <h1>{post.title || 'Untitled Post'}</h1>
                  </Link>
                  <p>{getText(post.desc) || 'No description available.'}</p>
                  <div className="post-meta">
                    <span className="post-date">
                      {post.date ? new Date(post.date).toLocaleDateString() : 'No date'}
                    </span>
                    {post.cat && (
                      <span className="post-category">
                        {post.cat}
                      </span>
                    )}
                  </div>
                  <Link to={`/post/${post.id}`}>
                    <button className="read-more-btn">Read More</button>
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-posts">
            <div className="no-posts-icon">📝</div>
            <h3>No posts found</h3>
            <p>Be the first to write one!</p>
            <Link to="/write">
              <button className="read-more-btn" style={{marginTop: '15px'}}>
                Start Writing
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;