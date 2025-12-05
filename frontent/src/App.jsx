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
const App = () => {
  // code likhna isAuthentciated
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error, user } = useSelector((state) => state.auth);


  useEffect(() => {
    dispatch(checkAuth()); // refresh hone par bhi token verify karega
  }, [dispatch]);

  // ✅ Jab tak checkAuth loading me hai tab tak loading screen show karo
  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-yellow-400">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      <span className="ml-3 text-lg">Loading...</span>
    </div>
  }

  return (
    <>
      <nav>
        <Link to="/"></Link>
        <Link to="/login"></Link>
        <Link to="/signup"></Link>

      </nav>
      <Routes>
        <Route path='/' element={!isAuthenticated ? <Homepage /> : isAuthenticated && user.role==="user" ? <Homepage /> :isAuthenticated && user.role==="admin" ? <Navigate to="/admin" /> :<Homepage /> } />
        <Route path="/login" element={isAuthenticated && user.role==="user" ? <Navigate to="/" /> : isAuthenticated && user.role==="admin" ? <Navigate to="/admin"/>:<Login></Login>}></Route>
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Singup></Singup>}></Route>
        <Route path="/problems" element={isAuthenticated ? <Problems /> : <Navigate to="/signup" />}></Route>
        <Route path="/admin" element={ isAuthenticated && user.role==="admin" ? <AdminPanel /> : <Navigate to="/" />}>
          <Route index element={<Dashboard />} />   {/* Default Dashboard */}
          <Route path="problems" element={<AdminProblem />} />
          <Route path="create" element={<CreateProblem />} />
          <Route path="update" element={<UpdateProblem />} />
          <Route path="delete" element={<DeleteProblem />} />
        </Route>
        <Route path="problem/:id" element={<SolveProblem />}></Route>
      </Routes>
    </>
  )
}

export default App