import React from 'react';
import Logo from '../img/logo.png';

const Footer = () => {
  return (
    <footer className='footer'>
      <img src={Logo} alt="BlogV Logo" />
      <span>Made with <span className="heart">🌻</span> and <b>BlogV</b>. All rights reserved.</span>
    </footer>
  );
};

export default Footer;