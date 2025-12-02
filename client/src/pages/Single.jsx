import React from 'react';
import Menu from '../components/Menu';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authContext.jsx';
import axios from 'axios';
import moment from 'moment';
import Edit from '../img/edit.png';
import Delete from '../img/delete.png';
import { FaUserCircle } from 'react-icons/fa'; // Import user icon

const Single = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [imageError, setImageError] = useState(false);
  const [userImageError, setUserImageError] = useState(false);

  const location = useLocation();
  const postId = location.pathname.split('/')[2];
  const navigate = useNavigate();
  const { currentUser, logout } = useContext(AuthContext);

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
  };

  // Enhanced error handler for authentication issues
  const handleAuthError = (error) => {
    if (error.response?.status === 401) {
      showNotification('Your session has expired. Please log in again.', 'error');
      logout();
      setTimeout(() => navigate('/login'), 2000);
    } else {
      showNotification(error.response?.data?.message || 'An error occurred', 'error');
    }
  };

  
  const handleDelete = async () => {
    if (!currentUser) {
      showNotification('Please log in to delete posts', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/posts/${postId}`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        showNotification('Post deleted successfully', 'success');
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      handleAuthError(err);
    }
  };

  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    setImageError(false);
    setUserImageError(false);
    try {
      const res = await axios.get(`/api/posts/${postId}`, {
        withCredentials: true
      });
      
      // Check if post data is valid and has required fields
      if (res.data && res.data.title) {
        setPost(res.data);
      } else {
        setError('Post not found');
        setPost(null);
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      if (err.response?.status === 404) {
        setError('Post not found');
        showNotification('Post not found', 'error');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this post');
        showNotification('You do not have permission to view this post', 'error');
      } else {
        setError('Failed to load post');
        handleAuthError(err);
      }
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // Check if current user can edit/delete this post
  const canEditDelete = currentUser && post && post.uid === currentUser.id;

  const getText = (html) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  // Handle post image error
  const handlePostImageError = () => {
    setImageError(true);
  };

  // Handle user image error
  const handleUserImageError = () => {
    setUserImageError(true);
  };

  if (loading) {
    return (
      <div className="single">
        <div className="loading">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="single">
        <div className="error-container">
          <div className="error-message">
            {error || 'Post not found or you don\'t have permission to view it.'}
          </div>
          <button 
            onClick={() => navigate('/')}
            className="back-home-btn"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='single'>
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
        {post.img && !imageError && (
          <img 
            src={`/upload/${post.img}`} 
            alt={post.title} 
            onError={handlePostImageError}
          />
        )}
        
        <div className="user">
          <div className="user-avatar">
            {post.userImg && !userImageError ? (
              <img 
                src={post.userImg} 
                alt={post.username} 
                onError={handleUserImageError}
              />
            ) : (
              <div className="user-avatar-fallback">
                <FaUserCircle className="user-icon" />
              </div>
            )}
          </div>
          <div className="info">
            <span>{post.username || 'Unknown Author'}</span>
            <p>Posted {post.date ? moment(post.date).fromNow() : 'recently'}</p>
            {post.cat && (
              <span className="category-tag">#{post.cat}</span>
            )}
          </div>
          
          {canEditDelete && (
            <div className="edit">
              <Link to={`/write?edit=${postId}`} state={post}>
                <img 
                  src={Edit} 
                  alt="Edit post" 
                  title="Edit post"
                />
              </Link>
              <img 
                onClick={handleDelete} 
                src={Delete} 
                alt="Delete post" 
                title="Delete post"
                className="delete-btn"
              />
            </div>
          )}
        </div>

        <h1>{post.title || 'Untitled Post'}</h1>
        
        <div className="post-content">
          {post.desc ? (
            <div dangerouslySetInnerHTML={{ __html: post.desc }} />
          ) : (
            <p>No content available for this post.</p>
          )}
        </div>

        {/* Post metadata */}
        <div className="post-meta">
          {post.date && (
            <span className="post-date">
              Published on {moment(post.date).format('MMMM D, YYYY')}
            </span>
          )}
          {post.cat && (
            <span className="post-category">
              Category: {post.cat.charAt(0).toUpperCase() + post.cat.slice(1)}
            </span>
          )}
        </div>
      </div>

      <Menu cat={post.cat} />
    </div>
  );
};

export default Single;