import React from 'react';
import { FaSignOutAlt, FaUser, FaEdit, FaHome, FaInfoCircle, FaSignInAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Logo from '../img/logo.png';
import { useContext } from 'react';
import { AuthContext } from '../context/authContext.jsx';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);

  return (
    <div className="navbar">
      <div className="container">
        <div className="logo">
          <Link to="/">
            <img src={Logo} alt="BlogV Logo" />
          </Link>
        </div>
        <div className="links">
          <Link className="link" to="/?cat=art">
            <h6>ART</h6>
          </Link>
          <Link className="link" to="/?cat=science">
            <h6>SCIENCE</h6>
          </Link>
          <Link className="link" to="/?cat=technology">
            <h6>TECHNOLOGY</h6>
          </Link>
          <Link className="link" to="/?cat=cinema">
            <h6>CINEMA</h6>
          </Link>
          <Link className="link" to="/?cat=design">
            <h6>DESIGN</h6>
          </Link>
          <Link className="link" to="/?cat=food">
            <h6>FOOD</h6>
          </Link>

          <span className="username">  <FaUser /> Welcome, {currentUser?.username}!</span>
          {currentUser ? (
            <span className="logout" onClick={logout}>
              <FaSignOutAlt/> Logout
            </span>
          ) : (
            <Link className="link" to="/login">
              <h6><i className="fa fa-sign-in"></i> <FaSignInAlt/> Login</h6>
            </Link>
          )}
          <span className="write"> 
            <Link className="link" to="/write">Write</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;