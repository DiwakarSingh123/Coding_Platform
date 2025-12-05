import React, { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate,NavLink } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../authSlicer";

const Singup = () => {
  //redux use hre..........
  const dispatch=useDispatch();
  const {isAuthenticated,loading,error}=useSelector((state)=>state.auth);
  const navigate=useNavigate()

  const [showPassword, setShowPassword] = useState(false);

    //Here we will write the zod schema for validation
    const zodeSchema = z.object({
        firstName: z.string().min(3, "Minimum character should be 3"),
        emailId: z.string().email("Invalid Email"),
        password: z.string().min(8, "Password is to weak")
    })

    //here handling the form
    const { register, handleSubmit, formState: { errors }, } = useForm({ resolver: zodResolver(zodeSchema) });

    
    const onSubmit = (data) => {
       dispatch(registerUser(data));
       console.log(data);

    }
    useEffect(()=>{
      if(isAuthenticated){
        navigate('/');
      }
    },[navigate])

    

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-900 p-8 rounded-2xl shadow-lg w-96">
        <div className="text-center mb-6">
          <div className="text-yellow-400 text-3xl mb-2">{`</>`}</div>
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-gray-400 text-sm">
            Join our community of developers.
          </p>
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Username</label>
          <input
            type="text"
            {...register('firstName')}
            placeholder="YourUsername"
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          {errors.firstName && (<span className='text-red-600 text-[13px]'>{errors.firstName.message}</span>)}
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

        {/* Create Account Button */}
        <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded mb-4">
          Create Account
        </button>

        {/* Divider */}
        <div className="flex items-center mb-4">
          <hr className="flex-grow border-gray-700" />
          <span className="px-2 text-gray-500 text-sm">OR</span>
          <hr className="flex-grow border-gray-700" />
        </div>

        {/* Google Button */}
        <button className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 py-2 rounded mb-3 border border-gray-600">
          <FcGoogle size={20} />
          Sign up with Google
        </button>

        {/* GitHub Button */}
        <button className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 py-2 rounded border border-gray-600">
          <FaGithub size={20} />
          Sign up with GitHub
        </button>

        {/* Sign in Link */}
        <p className="text-center text-sm mt-4 text-gray-400">
          Already have an account?{" "}
            <span className="font-medium text-yellow-400 hover:underline">
              <NavLink to="/login">Sing in</NavLink>
            </span>
        </p>
      </form>
    </div>
  );
};

export default Singup;


