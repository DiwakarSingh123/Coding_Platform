import React from "react";
import { Link, Outlet, NavLink } from "react-router";
import { userLogout } from '../../authSlicer';
import {
  FiHome,
  FiCode,
  FiFilePlus,
  FiEdit,
  FiTrash2,
  FiClipboard,
  FiCheckCircle,
  FiUsers,

} from "react-icons/fi";
import { FaPlus } from "react-icons/fa6";
import { CiCircleChevRight } from "react-icons/ci";
import { MdErrorOutline } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import { useDispatch,useSelector } from 'react-redux';
import { useNavigate } from "react-router";

export default function AdminPanel() {
  const linkClasses = "flex items-center gap-2 p-2 rounded-md hover:bg-gray-700";

  const activeClasses = "bg-blue-600 text-white";

   const dispatch=useDispatch();
   const {user}=useSelector((state)=>state.auth);
  //  console.log(user);
   
   const navigate=useNavigate();

  const handleLogout=()=>{
    dispatch(userLogout());
    navigate('/');
  }

  return (
    <>
      <div className="flex min-h-screen bg-[#0F172A] text-white ">
        {/* Sidebar */}
        <aside className="w-64 bg-[#1E293B] flex flex-col p-4 h-[100vh]">
          <h1 className="text-xl font-bold flex items-center space-x-2 mb-8">
            <span className="text-blue-500">{"</>"}</span>
            <span>CodeAdmin</span>
          </h1>

          <nav className="flex-1">
            <ul className="space-y-2">
              <li>
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-2 rounded-md ${isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"
                    }`
                  }
                >
                  <FiHome /> Dashboard
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/admin/problems"
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-2 rounded-md ${isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"
                    }`
                  }
                >
                  <FiCode /> Problems
                </NavLink>
              </li>
            </ul>

            <div className="mt-6 text-sm text-gray-400">ACTIONS</div>
            <ul className="space-y-2 mt-2">
              <li>
                <NavLink
                  to="/admin/create"
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-2 rounded-md ${isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"
                    }`
                  }
                >
                  <FiFilePlus /> Create Problem
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/update"
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-2 rounded-md ${isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"
                    }`
                  }
                >
                  <FiEdit /> Update Problem
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/delete"
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-2 rounded-md ${isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"
                    }`
                  }
                >
                  <FiTrash2 /> Delete Problem
                </NavLink>
              </li>
            </ul>
          </nav>

          <button onClick={()=> handleLogout()} className="flex items-center gap-2 w-full p-2 rounded-md bg-white text-red-600 font-medium hover:bg-red-100 transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 
                2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 
                0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            Logout
          </button>
          <div className="mt-3">
            <hr className="border-gray-700 " />
          <footer className="text-gray-500 text-[12px] text-center">
            © 2025 CodeZenith
          </footer>
          </div>

        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          <Outlet /> {/* Nested Route Content Loads Here */}
        </main>
      </div>
    </>
  );
}
