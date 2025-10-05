//raf - short cut to create functions in react
import React from 'react'
import { Link } from 'react-router-dom'
import "../style.scss"

const Home = () => {
  const posts = [
    {
      id: 1,
      title:"Lorem gshdjdj",
      desc: "Lorem dgshsj",
      img: "https://img.freepik.com/free-photo/closeup-scarlet-macaw-from-side-view-scarlet-macaw-closeup-head_488145-3540.jpg?semt=ais_hybrid&w=740&q=80",
    },
        {
      id: 2,
      title:"Lorem gshdjdj",
      desc: "Lorem dgshsj",
      img: "https://img.freepik.com/free-photo/closeup-scarlet-macaw-from-side-view-scarlet-macaw-closeup-head_488145-3540.jpg?semt=ais_hybrid&w=740&q=80",
    },
        {
      id: 3,
      title:"Lorem gshdjdj",
      desc: "Lorem dgshsj",
      img: "https://img.freepik.com/free-photo/closeup-scarlet-macaw-from-side-view-scarlet-macaw-closeup-head_488145-3540.jpg?semt=ais_hybrid&w=740&q=80",
    },
        {
      id: 4,
      title:"Lorem gshdjdj",
      desc: "Lorem dgshsj",
      img: "https://img.freepik.com/free-photo/closeup-scarlet-macaw-from-side-view-scarlet-macaw-closeup-head_488145-3540.jpg?semt=ais_hybrid&w=740&q=80",

    },
        {
      id: 5,
      title:"Lorem gshdjdj",
      desc: "Lorem dgshsj",
      img: "https://img.freepik.com/free-photo/closeup-scarlet-macaw-from-side-view-scarlet-macaw-closeup-head_488145-3540.jpg?semt=ais_hybrid&w=740&q=80",
    },
  ];

  return (
    <div className='home'>
      <div className="posts">
        {posts.map(post=>(
          <div className="post" key={post.id}>
            <div className="img">
              <img src={post.img} alt="" />
            </div>
            <div className="content">
              <Link className="link" to ={`/post/${post.id}`}>
                <h1>{post.title}</h1>
              </Link>
                <p>{post.desc}</p>
                <button>Read More</button>
            </div>
          </div>
          ))}
      </div>
    </div>
  )
}

export default Home
