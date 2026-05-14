import React from "react";
import { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, googleLogin } from "../../authSlicer";
import { auth, provider } from "../utils/Firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { toast } from "react-toastify";

const Login = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const zodeSchema = z.object({
    emailId: z.string().email("Invalid Email"),
    password: z.string().min(8, "Password is too weak")
  });

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(zodeSchema) });

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  // Redirect after successful auth
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        navigate('/admin');
      } else {
        navigate('/problems');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      // Open Firebase Google popup
      const result = await signInWithPopup(auth, provider);
      // Get the real Google OAuth ID token (NOT the Firebase token)
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const idToken = credential.idToken;
      // Send to backend to create/find user and issue JWT cookie
      await dispatch(googleLogin(idToken)).unwrap();
      // Navigation handled by the useEffect above
    } catch (err) {
      console.error("Google login error:", err);
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-900 p-8 rounded-2xl shadow-lg w-96">
        <div className="text-center mb-6">
          <div className="text-yellow-400 text-3xl mb-2">{`</>`}</div>
          <h1 className="text-2xl font-bold">Welcome Back! to <span className="text-yellow-400 text-3xl mb-2">CodeZenith</span></h1>
          <p className="text-gray-400 text-sm">
            Sign in to continue your journey.
          </p>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Email Address</label>
          <input
            type="email"
            {...register('emailId')}
            placeholder="name@company.com"
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          {errors.emailId && (<span className='text-red-600 text-[13px]'>{errors.emailId.message}</span>)}
        </div>

        {/* Password */}
        <div className="mb-4 relative">
          <button
            type="button"
            className="absolute right-0 top-2.5 -translate-y-1/2 text-yellow-400 hover:underline text-sm cursor-pointer"
          >
            Forgot Password?
          </button>
          <label className="block text-sm mb-1">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...register('password')}
            className="w-full p-2 pr-10 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          {errors.password && (<span className='text-red-600 text-[13px]'>{errors.password.message}</span>)}
          <span
            className="absolute right-3 top-9 cursor-pointer text-gray-400"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded mb-4 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Divider */}
        <div className="flex items-center mb-4">
          <hr className="flex-grow border-gray-700" />
          <span className="px-2 text-gray-500 text-sm">OR</span>
          <hr className="flex-grow border-gray-700" />
        </div>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 py-2 rounded border border-gray-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400"></span>
          ) : (
            <FcGoogle size={20} />
          )}
          {googleLoading ? "Signing in..." : "Sign in with Google"}
        </button>

        {/* Sign up Link */}
        <p className="text-center text-sm mt-4 text-gray-400">
          Don't have an account yet?{' '}
          <span className="font-medium text-yellow-400 hover:underline">
            <Link to="/signup"> Sign up</Link>
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
