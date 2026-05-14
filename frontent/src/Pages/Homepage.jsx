import React from "react";
import { Link, NavLink, useNavigate } from "react-router";
import Problems from "./Problems";
import { Code, BarChart, Users, Briefcase, PlaySquare, Monitor, Check } from "lucide-react";
import { FaJava, FaPython, FaJs } from "react-icons/fa";
import { SiCplusplus, SiTypescript, SiGo, SiRust } from "react-icons/si";
import { useDispatch, useSelector } from 'react-redux';
import { userLogout } from "../../authSlicer";
import Navbar from "../Components/Navbar";

const Homepage = () => {
  const features = [
    {
      title: "Vast Problem Library",
      description:
        "Access thousands of problems ranging from beginner to expert, covering all major data structures and algorithms.",
      icon: <Code className="w-8 h-8 text-orange-500" />,
    },
    {
      title: "Live Contests",
      description:
        "Participate in weekly and monthly coding contests to test your skills against programmers worldwide.",
      icon: <PlaySquare className="w-8 h-8 text-orange-500" />,
    },
    {
      title: "Community Forum",
      description:
        "Engage with a vibrant community, discuss solutions, and learn from the best in our active forums.",
      icon: <Users className="w-8 h-8 text-orange-500" />,
    },
    {
      title: "Detailed Analytics",
      description:
        "Track your progress with insightful analytics, identify your weaknesses, and focus your practice effectively.",
      icon: <BarChart className="w-8 h-8 text-orange-500" />,
    },
    {
      title: "In-Browser IDE",
      description:
        "Solve problems directly in our powerful and fast in-browser IDE with support for over 15 languages.",
      icon: <Monitor className="w-8 h-8 text-orange-500" />,
    },
    {
      title: "Interview Prep",
      description:
        "Prepare for technical interviews with curated problem sets from top tech companies.",
      icon: <Briefcase className="w-8 h-8 text-orange-500" />,
    },
  ];

  const languages = [
    'C++',
    'Python',
    'Java',
    'JavaScript',
    'Go',
    'Rust',
    'Kotlin',
    'TypeScript'
  ];

  const language = [
    { name: "C++", icon: <SiCplusplus /> },
    { name: "Python", icon: <FaPython /> },
    { name: "Java", icon: <FaJava /> },
    { name: "JavaScript", icon: <FaJs /> },
    { name: "Go", icon: <SiGo /> },
    { name: "Rust", icon: <SiRust /> },   // ✅ fixed import
    { name: "TypeScript", icon: <SiTypescript /> },
  ];

  const dispatch = useDispatch();
  const { user,isAuthenticated } = useSelector((state) => state.auth);
  const navigate=useNavigate();


  return (
    <>
    <Navbar />
      {/* Hero section.......................... */}
      <div className="min-h-screen bg-[#0d1117] text-white">
      

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center py-20 md:py-32 px-6">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight">
            The Ultimate Platform for <br />
            <span className="text-orange-500">Competitive Programmers</span>
          </h1>
          <p className="text-gray-400 mt-6 text-base sm:text-lg md:text-xl max-w-2xl">
            Sharpen your skills, solve challenging problems, and compete with a
            global community of developers.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:space-x-6 w-full sm:w-auto px-4 sm:px-0">
            <Link
              to="/problems"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-md font-semibold shadow-md text-center"
            >
              Start Solving
            </Link>
            <Link
              to="/problems"
              className="border border-orange-500 text-orange-500 px-8 py-4 rounded-md font-semibold hover:bg-orange-500 hover:text-white transition text-center"
            >
              View Problems
            </Link>
          </div>
        </section>
      </div>

      {/* Header section.............. */}
      <div className="bg-[#161b22] text-white py-16 px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Everything You Need to Succeed
          </h2>
          <p className="text-gray-400 mt-3 text-lg">
            A comprehensive suite of tools to help you on your coding journey.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#0d1117] p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition transform duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* For third section image part */}
      <section className="bg-[#0f172a] text-white px-6 md:px-16 py-12">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-12">

          {/* Left Content */}
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">
              Prepare for Interviews, <br /> Climb the Ranks
            </h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              CodeZenith isn't just a platform; it's your personal coding gym.
              We provide the resources and environment to help you achieve your
              goals, whether it's acing your next technical interview or becoming
              a grandmaster.
            </p>

            {/* Features */}
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="text-orange-500 mt-1" size={20} />
                <span className="text-gray-300">
                  Curated problem lists from top companies like Google, Meta, and Amazon.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-orange-500 mt-1" size={20} />
                <span className="text-gray-300">
                  Real-time ranking system to benchmark yourself against the best.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-orange-500 mt-1" size={20} />
                <span className="text-gray-300">
                  Learn from official editorials and top-rated community solutions.
                </span>
              </li>
            </ul>
          </div>

          {/* Right Image */}
          <div className="flex-1">
            <img
              src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1470&auto=format&fit=crop"
              alt="Coding Platform"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* For use can right your code in your favrout languag */}
      <div className="bg-[#0f172a] text-white py-16 text-center">
        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
          Code in Your Favorite Language
        </h2>
        <p className="text-gray-400 mb-10 max-w-2xl mx-auto">
          We support a wide range of programming languages to fit your preferences.
        </p>

        {/* Language Icons */}
        <div className="flex justify-center gap-8 flex-wrap mb-16">
          {language.map((lang, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-gray-400 hover:text-orange-400 transition-colors duration-300 cursor-pointer"
            >
              {/* Circle with icon */}
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[#1e293b] hover:bg-[#334155] transition mb-3">
                <div className="text-3xl">{lang.icon}</div>
              </div>
              <span className="text-sm font-medium">{lang.name}</span>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <h3 className="text-xl md:text-2xl font-extrabold mb-3">
          Ready to Start Your Journey?
        </h3>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
          Join thousands of developers leveling up their skills on CodeZenith.
          Create your free account today.
        </p>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-md font-semibold transition shadow-md w-full sm:w-auto max-w-xs sm:max-w-none mx-auto">
          Sign Up for Free
        </button>
      </div>

      {/* Footer page here */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <h2 className="text-2xl font-bold text-white">Coding<span className="text-blue-500">Hub</span></h2>
            <p className="mt-3 text-sm text-gray-400">
              A platform to practice coding, solve challenges, and grow your skills.
              Learn. Build. Succeed.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400 transition">Home</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Problems</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Leaderboard</a></li>
              <li><Link to="/about" className="hover:text-blue-400 transition">About Us</Link></li>
            </ul>
          </div>

          {/* Socials Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-400 transition"><i className="ri-github-fill text-2xl"></i></a>
              <a href="#" className="hover:text-blue-400 transition"><i className="ri-linkedin-box-fill text-2xl"></i></a>
              <a href="#" className="hover:text-blue-400 transition"><i className="ri-twitter-x-fill text-2xl"></i></a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} CodingHub. All rights reserved.
        </div>
      </footer>
    </>

  );
};

export default Homepage;







