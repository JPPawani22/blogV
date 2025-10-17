import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Menu = ({ cat }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/posts/?cat=${cat}`);
        setPosts(res.data);
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cat]);

  return (
    <div className="menu">
      <h1>Other posts you may like</h1>
      {loading ? (
        <div className="loading">Loading recommendations...</div>
      ) : posts.length > 0 ? (
        posts.map(post => (
          <div className="post" key={post.id}>
            <img src={`../upload/${post.img}`} alt={post.title} />
            <h2>{post.title}</h2>
            <Link to={`/post/${post.id}`}>
              <button className="read-more-btn">Read More</button>
            </Link>
          </div>
        ))
      ) : (
        <div className="no-posts">No related posts found</div>
      )}
    </div>
  );
};

export default Menu;