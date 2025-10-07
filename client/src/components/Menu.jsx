import React from 'react'
import { Link } from 'react-router-dom'
import { useState, useEffect} from 'react'
import axios from "axios"

const Menu = ({cat}) => {

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/posts/?cat=${cat}`);
        setPosts(res.data)
      } catch (err) {
        console.log(err)
      }
    }
    fetchData()
  }, [cat]);


  //   const posts = [
  //   {
  //     id: 1,
  //     title:"Lorem gshdjdj",
  //     desc: "Lorem dgshsj",
  //     img: "https://img.freepik.com/free-photo/closeup-scarlet-macaw-from-side-view-scarlet-macaw-closeup-head_488145-3540.jpg?semt=ais_hybrid&w=740&q=80",
  //   },
  //       {
  //     id: 2,
  //     title:"Lorem gshdjdj",
  //     desc: "Lorem dgshsj",
  //     img: "https://img.freepik.com/free-photo/closeup-scarlet-macaw-from-side-view-scarlet-macaw-closeup-head_488145-3540.jpg?semt=ais_hybrid&w=740&q=80",
  //   },
  //       {
  //     id: 3,
  //     title:"Lorem gshdjdj",
  //     desc: "Lorem dgshsj",
  //     img: "https://img.freepik.com/free-photo/closeup-scarlet-macaw-from-side-view-scarlet-macaw-closeup-head_488145-3540.jpg?semt=ais_hybrid&w=740&q=80",
  //   },
  //       {
  //     id: 4,
  //     title:"Lorem gshdjdj",
  //     desc: "Lorem dgshsj",
  //     img: "https://img.freepik.com/free-photo/closeup-scarlet-macaw-from-side-view-scarlet-macaw-closeup-head_488145-3540.jpg?semt=ais_hybrid&w=740&q=80",

  //   },
  //       {
  //     id: 5,
  //     title:"Lorem gshdjdj",
  //     desc: "Lorem dgshsj",
  //     img: "https://img.freepik.com/free-photo/closeup-scarlet-macaw-from-side-view-scarlet-macaw-closeup-head_488145-3540.jpg?semt=ais_hybrid&w=740&q=80",
  //   },
  // ];

  return (
    <div className="menu">
        <h1>Other posts you may like</h1>
        {posts.map(post=>(
            <div className="post" key={post.id}>
                <img src={post.img} alt="" />
                <h2>{post.title}</h2>
                <button>Read More</button>
            </div>))}
    </div>
  )
}

export default Menu
