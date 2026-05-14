import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router'
import Homepage from './Pages/Homepage'
import Login from './Pages/Login'
import Singup from './Pages/Singup'
import Problems from './Pages/Problems'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { checkAuth } from '../authSlicer'
import AdminPanel from './AdminPage/AdminPanel'
import Dashboard from './AdminPage/Dashboard'
import AdminProblem from './AdminPage/AdminProblem'
import CreateProblem from './AdminPage/CreateProblem'
import UpdateProblem from './AdminPage/UpdateProblem'
import DeleteProblem from './AdminPage/DeleteProblem'
import SolveProblem from './Pages/SolveProblem'
import Leaderboard from './Pages/Leaderboard'
import Contest from './Pages/Contest'
import AboutUs from './Pages/AboutUs'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
const App = () => {
  // code likhna isAuthentciated
  const dispatch = useDispatch();
  const { isAuthenticated, authChecked, loading, error, user } = useSelector((state) => state.auth);


  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Only block render until the initial auth check is done
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-yellow-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        <span className="ml-3 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <>
    
      <nav>
        <Link to="/"></Link>
        <Link to="/login"></Link>
        <Link to="/signup"></Link>

      </nav>
      <Routes>
        <Route path='/' element={!isAuthenticated ? <Homepage /> : isAuthenticated && user.role==="admin" ? <Navigate to="/admin" /> : <Navigate to="/problems" /> } />
        <Route path="/login" element={isAuthenticated && user.role==="user" ? <Navigate to="/" /> : isAuthenticated && user.role==="admin" ? <Navigate to="/admin"/>:<Login></Login>}></Route>
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Singup></Singup>}></Route>
        <Route path="/problems" element={isAuthenticated ? <Problems /> : <Navigate to="/signup" />}></Route>
        <Route path="/leaderboard" element={isAuthenticated ? <Leaderboard /> : <Navigate to="/signup" />}></Route>
        <Route path="/contests" element={isAuthenticated ? <Contest /> : <Navigate to="/signup" />}></Route>
        <Route path="/admin" element={ isAuthenticated && user.role==="admin" ? <AdminPanel /> : <Navigate to="/" />}>
          <Route index element={<Dashboard />} />   {/* Default Dashboard */}
          <Route path="problems" element={<AdminProblem />} />
          <Route path="create" element={<CreateProblem />} />
          <Route path="update" element={<AdminProblem />} /> {/* Unified list */}
          <Route path="update/:id" element={<UpdateProblem />} />
          <Route path="delete" element={<DeleteProblem />} />
        </Route>
        <Route path="/about" element={<AboutUs />}></Route>
        <Route path="problem/:id" element={<SolveProblem />}></Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </>
  )
}

export default App