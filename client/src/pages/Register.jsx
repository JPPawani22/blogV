import React from 'react'

const Register = () => {
  return (
    <div className='auth'>
      <h1>Register</h1>
      <form>
        <input required type="text" placeholder='username' />
        <input required type="text" placeholder='email' />
        <input required type="password" placeholder='password' />
        <button>Register</button>
        <p> This is an Error!</p>
        <span>Don't have an account? <a href="/login">Login</a></span>
      </form>
      
    </div>
  )
}

export default Register
