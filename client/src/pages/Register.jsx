import React from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Register = () => {

  const [inputs, setInputs] = useState({
    username:"",
    email:"",
    password:"",
  });

  const [err, setErr] = useState(null)

  const navigate = useNavigate()

  const handleChange = e =>{
      setInputs(prev=>({...prev, [e.target.name]: e.target.value}))
  }

  const handleSubmit = async e =>{

      e.preventDefault()
      try{
         const res = await axios.post("/api/auth/register", inputs)
         navigate("/login");
      }
       catch(err){
          setErr(err.response.data)
       }
  }


  return (
    <div className='auth'>
      <h1>Register</h1>
      <form>
        <input required type="text" placeholder='username'name="username" onChange={handleChange}/>
        <input required type="text" placeholder='email' name="email" onChange={handleChange}/>
        <input required type="password" placeholder='password' name="password" onChange={handleChange} />
        <button onClick={handleSubmit}>Register</button>
        {err && <p> {err}</p>}
        <span>Already have an account? <a href="/login">Login</a></span>
      </form>
      
    </div>
  )
}

export default Register
