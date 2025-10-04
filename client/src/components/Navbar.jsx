import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import Logo from '../img/logo.png'

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="container">
        <div className="logo">
          <img src={Logo} alt="" />
        </div>
        <div className="links">
          <NavLink className="link" to="/?cat=art">
            <h6>ART</h6>
          </NavLink>
        </div>
      </div>
    </div>
  )
}

export default Navbar
