import React from 'react';
import Navbar from '../Components/Navbar';

const AboutUs = () => {
    const team = [
        {
            name: "Diwakar Singh",
            role: "Software Engineer",
            image: "/diwakar.png",
            bio: "Visionary developer with a passion for building scalable educational platforms. Diwakar leads the overall product strategy and technical architecture of CodeZenith.",
            linkedin: "https://www.linkedin.com/in/diwakar-singh-886590293/"
        },
        {
            name: "Chetan Raj Tyagi",
            role: "Lead Backend Engineer",
            image: "/chetan.png",
            bio: "Expert in distributed systems and performance optimization. Chetan ensures that the execution engine handles thousands of submissions with zero latency.",
            linkedin: "https://www.linkedin.com/in/chetan-raj-tyagi-a9161828b/"
        },
        {
            name: "Archin Kadyan",
            role: "Frontend Architect",
            image: "/archin.png",
            bio: "A UI/UX specialist who crafts the seamless and responsive experiences our users love. Archin focuses on making complex coding tools intuitive and beautiful.",
            linkedin: "https://www.linkedin.com/in/archin-kadyan-919b81263/"
        }
    ];

    return (
        <div className="min-h-screen bg-[#0d1117] text-white">
            <Navbar />
            
            {/* Header Section */}
            <div className="py-20 px-6 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
                    About <span className="text-orange-500">CodeZenith</span>
                </h1>
                <p className="max-w-3xl mx-auto text-gray-400 text-lg leading-relaxed">
                    CodeZenith is the ultimate arena for developers to sharpen their coding skills. 
                    Born out of a desire to make competitive programming accessible and engaging, 
                    we provide a state-of-the-art IDE, curated problem sets, and a global platform 
                    to showcase your talent. Whether you're prepping for a FAANG interview or 
                    aiming for the top of the leaderboard, we're here to fuel your growth.
                </p>
            </div>

            {/* Team Section */}
            <div className="bg-[#161b22] py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
                        Meet the <span className="text-orange-500">Developers</span>
                    </h2>

                    <div className="flex flex-col items-center gap-12">
                        {/* Top Card - Centered */}
                        <div className="w-full max-w-md">
                            <TeamCard member={team[0]} />
                        </div>

                        {/* Bottom Two Cards - Responsive Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
                            <TeamCard member={team[1]} />
                            <TeamCard member={team[2]} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer space */}
            <div className="py-12 border-t border-gray-800 text-center text-gray-500">
                <p>© {new Date().getFullYear()} CodeZenith Team. Building the future of coding.</p>
            </div>
        </div>
    );
};

const TeamCard = ({ member }) => (
    <div className="bg-[#0d1117] p-8 rounded-2xl shadow-2xl border border-orange-500/50 transition-all duration-300 group hover:border-orange-500">
        <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-orange-500 transition-colors duration-300">
                <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover transition-all duration-500"
                />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
            <p className="text-orange-500 font-medium mb-4">{member.role}</p>
            
            <a 
                href={member.linkedin} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm mb-6 transition-colors flex items-center gap-1"
            >
                🔗 Connect on LinkedIn
            </a>
            
            <p className="text-gray-400 text-sm leading-relaxed italic">
                "{member.bio}"
            </p>
        </div>
    </div>
);

export default AboutUs;
