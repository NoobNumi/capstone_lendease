import React, { useEffect, useState } from 'react';
import RoutesSideBar from '../routes/sidebar';
import { NavLink, Routes, Link, useLocation } from 'react-router-dom';
import SidebarSubmenu from './SidebarSubmenu';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import checkAuth from '../app/auth';
function LeftSidebar() {
  const location = useLocation();

  const dispatch = useDispatch();

  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const [selectedUser, setSelectedUser] = useState({});

  const [isLoaded, setIsLoaded] = useState(false);

  // console.log({ loggedInUser })

  const getUser = async () => {

    const token = checkAuth();
    const decoded = jwtDecode(token);
    let user_id = decoded.user_id;

    //console.log({ decoded })

    let res = await axios({
      method: 'GET',
      url: `user/${user_id}`
    });
    let user = res.data.data;

    console.log({ user })

    setSelectedUser({ ...user });
    setIsLoaded(true);
  };




  useEffect(() => {
    getUser();
    //console.log({ selectedUser: selectedUser });
  }, []);

  const close = e => {
    document.getElementById('left-sidebar-drawer').click();
  };

  // console.log({ selectedUser })

  return isLoaded && (

    <div className="drawer-side  z-30   ">
      <label htmlFor="left-sidebar-drawer" className="drawer-overlay"></label>
      {/* <div className=" mx-auto flex items-center justify-center mb-8 mt-4">
        <img src="/A.V. Logo.png" alt="Logo" className="w-30 h-24" />
      </div> */}
      {/* <hr class="border-t-2 border-white mx-auto w-1/2 my-2"></hr> */}
      {/* <div className=" mx-auto flex items-center justify-center mb-3 mt-6">
      
      </div> */}
      <label htmlFor="left-sidebar-drawer" className="drawer-overlay"></label>


      <ul className="menu  pt-2 w-80 bg-base-100 min-h-full   text-base-content text-white bg-blue-950">
        <button className="btn btn-ghost bg-base-300  btn-circle z-50 top-0 right-0 mt-4 mr-2 absolute lg:hidden" onClick={() => close()}>
          <XMarkIcon className="h-5 inline-block w-5 text-blue-950" />
        </button>
        <div className="mx-auto flex items-center justify-center mb-3 mt-6 px-4 w-full">
          {/* Left side text (LEND) */}


          <div className="text-white font-bold text-xl mr-2">
            LEND
          </div>

          {/* Centered logo */}
          <div className="bg-white p-2 rounded-full shadow-lg">
            <img
              src="/LOGO.png"
              alt="Logo"
              className="w-20 h-20 rounded-full border-2 border-blue-950 p-2"
            />
          </div>

          {/* Right side text (EASE) */}
          <div className="text-white font-bold text-xl ml-2">
            EASE
          </div>
        </div>




        {selectedUser && (
          <li className="flex items-center justify-between mb-3">
            <label className="text-white">
              Hello, <span className="font-bold">{selectedUser.first_name} {selectedUser.first_name}</span>
            </label>
            <label className="bg-customBrown text-white rounded-lg text-xs p-1">
              <span className="border-lg text-xs">{selectedUser.role}</span>
            </label>

          </li>
        )}


        {/* <span className={`font-bold text-white bg-blue-900 shadow-2xl px-2 py-2 rounded-lg
          text-center w-50 mb-5`}>
          {selectedUser.role}
        </span> */}


        <RoutesSideBar />
      </ul>
    </div>
  );
}

export default LeftSidebar;
