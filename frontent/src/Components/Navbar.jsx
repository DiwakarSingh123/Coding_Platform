import React from 'react'
import { Link } from 'react-router'
import { useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { userLogout } from '../../authSlicer';
import { FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const handleLogout = () => {
       

        dispatch(userLogout());
        console.log("user handle nahi hai kya");
        navigate('/');
    }
    return (
        <div>

            {/* Navbar */}
            <nav className="relative flex flex-wrap items-center justify-between px-6 md:px-12 py-4 bg-[#0d1117] shadow-md z-50">
                {/* Logo */}
                <div className="text-2xl font-bold">
                    <span className="text-white">Code</span>
                    <span className="text-orange-500">Zenith</span>
                </div>

                {/* Hamburger Menu (Mobile) */}
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden text-gray-300 hover:text-white"
                >
                    {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
                </button>

                {/* Nav Links & Auth - Desktop */}
                <ul className="hidden md:flex space-x-8 text-gray-300 font-medium">
                    <li><Link to="/" className="hover:text-orange-400" >Home</Link></li>
                    <li><Link to="/problems" className="hover:text-orange-400" >Problems</Link></li>
                    <li><Link to="/contests" className="hover:text-orange-400">Contests</Link></li>
                    <li><Link to="/leaderboard" className="hover:text-orange-400">Leaderboard</Link></li>
                    <li><Link to="/about" className="hover:text-orange-400">About Us</Link></li>
                </ul>

                {/* Auth Buttons - Desktop */}
                <div className="hidden md:block">
                    {!isAuthenticated ?
                        <div className="flex space-x-3 items-center">
                            <Link to="/login" className="text-gray-300 hover:text-orange-400">
                                Log In
                            </Link>
                            <Link
                                to="/signup"
                                className="bg-orange-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600"
                            >
                                Sign Up
                            </Link>
                        </div>
                        :
                        <button
                            onClick={() => handleLogout()}
                            className="bg-orange-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600"
                        >
                            Logout
                        </button>
                    }
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-[#161b22] border-t border-gray-800 shadow-xl py-6 px-6 flex flex-col space-y-6 z-50 animate-in fade-in slide-in-from-top-4">
                        <ul className="flex flex-col space-y-4 text-gray-300 font-medium">
                            <li><Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-orange-400 block py-2">Home</Link></li>
                            <li><Link to="/problems" onClick={() => setIsMenuOpen(false)} className="hover:text-orange-400 block py-2">Problems</Link></li>
                            <li><Link to="/contests" onClick={() => setIsMenuOpen(false)} className="hover:text-orange-400 block py-2">Contests</Link></li>
                            <li><Link to="/leaderboard" onClick={() => setIsMenuOpen(false)} className="hover:text-orange-400 block py-2">Leaderboard</Link></li>
                            <li><Link to="/about" onClick={() => setIsMenuOpen(false)} className="hover:text-orange-400 block py-2">About Us</Link></li>
                        </ul>
                        <div className="pt-4 border-t border-gray-800">
                            {!isAuthenticated ?
                                <div className="flex flex-col space-y-4">
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-orange-400 text-center py-2">
                                        Log In
                                    </Link>
                                    <Link
                                        to="/signup"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="bg-orange-500 text-white px-4 py-3 rounded-md font-semibold hover:bg-orange-600 text-center"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                                :
                                <button
                                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                    className="bg-orange-500 text-white px-4 py-3 rounded-md font-semibold hover:bg-orange-600 w-full"
                                >
                                    Logout
                                </button>
                            }
                        </div>
                    </div>
                )}
            </nav>
        </div>
    )
}

export default Navbar