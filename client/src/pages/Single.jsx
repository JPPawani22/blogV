import React from 'react'
import Menu from '../components/Menu'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useContext} from 'react'
import { AuthContext } from '../context/authContext.jsx'
import axios from "axios"
import moment from "moment"
import Edit from "../img/edit.png"
import Delete from "../img/delete.png"

const Single = () => {

  const [post, setPost] = useState({})

  const location = useLocation()
  const postId = location.pathname.split("/")[2]

  const navigate = useNavigate();


  const {currentUser} = useContext(AuthContext);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/posts/${postId}`,{
        withCredentials: true
      });
      navigate("/")
    } catch (err) {
      console.log(err)
    }
  }

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/posts/${postId}`,{
        withCredentials: true
      });
      navigate("/")
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/posts/${postId}`);
        setPost(res.data)
      } catch (err) {
        console.log(err)
      }
    }
    fetchData()
  }, [postId]);

    // Fix: Compare user ID instead of username
  const canEditDelete = currentUser && post.uid === currentUser.id;

  return (
    <div className='single'>
      <div className="content">
           <img src={post?.img} alt="" />
        <div className="user">
           {post.userImg && <img src={post.userImg} alt="" />}
        <div className="info">
        <span>{post.username}</span>
        <p>Posted {moment(post.date).fromNow()}</p>
      </div>
      {canEditDelete && (<div className="edit">
        <Link to ={`/write?edit=${postId}`}>
          <img onClick={handleUpdate} src={Edit} alt="" />
        </Link>
        
        <img onClick={handleDelete} src={Delete} alt="" />
      </div>
    )}
      </div>

      <h1>{post.title}</h1>
      {post.desc}

   </div>

      {/* menu */}
      <Menu cat={post.cat}/>

  </div>
  )
  }


export default Single
