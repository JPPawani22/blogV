import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/authContext.jsx'

const Login = () => {

   const [inputs, setInputs] = useState({
    username:"",
    password:"",
  });

  const [err, setErr] = useState(null)

  const navigate = useNavigate()

  const {login} = useContext(AuthContext)
  // console.log(currentUser)

  const handleChange = e =>{
      setInputs(prev=>({...prev, [e.target.name]: e.target.value}))
  }

  const handleSubmit = async e =>{

      e.preventDefault()
      try{
         await login(inputs)
         navigate("/");
      }
       catch(err){
          setErr(err.response.data)
       }
  }

  return (
    <div className='auth'>
      <h1>Login</h1>
      <form>
        <input type="text" placeholder='username' name="username" onChange={handleChange} />
        <input type="password" placeholder='password' name="password" onChange={handleChange} />
        <button onClick={handleSubmit}>Login</button>
        {err && <p> {err}</p>}
        <span>Don't have an account? <a href="/register">Register</a></span>
      </form>
      
    </div>
  )
}

export default Login
