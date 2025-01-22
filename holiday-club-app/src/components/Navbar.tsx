"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if user is logged in
  const [user, setUser] = useState({ name: 'User', avatar: '' }); // Replace with real user data
  const [dropdownOpen, setDropdownOpen] = useState(false); // Track dropdown visibility

  useEffect(() => {
    const storedMenuState = localStorage.getItem('menuOpen');
    if (storedMenuState !== null) {
      setMenuOpen(storedMenuState === 'true');
    }
    // Check if user is logged in from localStorage or cookies
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Set the logged-in user data
      setIsLoggedIn(true); // Set logged-in state
    }
  }, []);

  const toggleMenu = () => {
    const newMenuState = !menuOpen;
    setMenuOpen(newMenuState);
    localStorage.setItem('menuOpen', String(newMenuState));
  };

  const toggleDropdown = () => {
    setDropdownOpen((prevState) => !prevState); // Toggle the dropdown visibility
  };

  const handleLogout = () => {
    // Implement your logout logic here
    setIsLoggedIn(false);
    localStorage.removeItem('user'); // Remove user data from localStorage
    // Redirect to login page or homepage
  };

  return (
    <div className="navbar bg-accent">
      <div className="navbar-start">
        <div className="flex-1">
          {!isLoggedIn && (
            <div className="dropdown">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle" onClick={toggleDropdown}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              {/* Dropdown menu will be shown/hidden based on dropdownOpen */}
              {dropdownOpen && (
                <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-4 shadow">
                  <li><Link href="/" onClick={toggleMenu}>About</Link></li>
                  <li><Link href="/register" onClick={toggleMenu}>Register</Link></li>
                  <li><Link href="/login" onClick={toggleMenu}>Login</Link></li>
                  <li><Link href="/leaders" onClick={toggleMenu}>Leaders</Link></li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-none ml-auto">
        <Link href="/" className="btn btn-ghost text-xl">Holiday Bible Club</Link>
      </div>

      <div className="flex-none">
        {isLoggedIn && (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar" onClick={toggleDropdown}>
              <div className="w-10 rounded-full">
                <img alt="User avatar" src={user.avatar || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} />
              </div>
            </div>
            {/* Dropdown menu will be shown/hidden based on dropdownOpen */}
            {dropdownOpen && (
              <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-4 shadow">
                <li><a className="justify-between">Profile</a></li>
                <li><a>Settings</a></li>
                <li><a onClick={handleLogout}>Logout</a></li>
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;