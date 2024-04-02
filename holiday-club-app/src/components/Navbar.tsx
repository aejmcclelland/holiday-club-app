"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/Navbar.module.css';

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="bg-orange-500 py-4 md:py-0 md:px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div>
          <Link href="/"className="text-blue-500 text-2xl font-bold">Holiday Bible Club
          </Link>
        </div>
        <div className="md:hidden">
          <button className="text-white focus:outline-none" onClick={toggleMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
        <ul className={`md:flex gap-x-6 text-white ${menuOpen ? 'block' : 'hidden'}`}>
          <li>
            <Link href="/about"onClick={toggleMenu}>About
            </Link>
          </li>
          <li>
            <Link href="/register"
              onClick={toggleMenu}>Register
            </Link>
          </li>
          <li>
            <Link href="/login"
              onClick={toggleMenu}>Login/Logout
            </Link>
          </li>
          <li>
            <Link href="/leaders"
               onClick={toggleMenu}>Leaders
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;