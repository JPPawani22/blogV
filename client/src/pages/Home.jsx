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
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent;
  };

  return (
    <div className='home'>
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="posts">
        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <div className="post" key={post.id}>
              <div className="img">
                <img src={`../upload/${post.img}`} alt={post.title} />
              </div>
              <div className="content">
                <Link className="link" to={`/post/${post.id}`}>
                  <h1>{post.title}</h1>
                </Link>
                <p>{getText(post.desc)}</p>
                <Link to={`/post/${post.id}`}>
                  <button className="read-more-btn">Read More</button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="no-posts">No posts found. Be the first to write one!</div>
        )}
      </div>
    </div>
  );
};

export default Home;