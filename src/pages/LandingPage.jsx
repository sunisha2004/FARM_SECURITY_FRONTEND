import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Star, ArrowRight, Shield, Activity, Users, Facebook, Twitter, Instagram, Linkedin, Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import heroBg from '../assets/Gemini_Generated_Image_u630dgu630dgu630.png';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const themeClasses = {
    bg: isDarkMode ? 'bg-gray-950' : 'bg-gray-50',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-800',
    card: isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-gray-100 text-gray-800',
    nav: isDarkMode ? 'bg-black/20 border-white/10' : 'bg-white/10 border-white/20',
    footer: 'bg-gray-950 text-white',
    muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    heading: isDarkMode ? 'text-white' : 'text-gray-900',
  };

  return (
    <div className={`font-sans ${themeClasses.bg} ${themeClasses.text} flex flex-col min-h-screen overflow-x-hidden transition-colors duration-500`}>
      {/* 1. Navbar: Sticky glassmorphism */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b shadow-sm transition-all duration-300 ${themeClasses.nav}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center gap-2">
              <Shield className="h-8 w-8 text-emerald-400 drop-shadow-md" />
              <span className="font-bold text-xl text-white tracking-tight drop-shadow-md">AgriGuard</span>
            </div>
            
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#" className="text-gray-100 hover:text-emerald-400 transition-colors font-medium drop-shadow-sm">Home</a>
              <a href="#ratings" className="text-gray-100 hover:text-emerald-400 transition-colors font-medium drop-shadow-sm">Rating</a>
              
              {/* Theme Toggle Button */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {user ? (
                <div className="flex items-center gap-6">
                  <Link to={user.role === 'admin' ? "/admin/dashboard" : "/farmer/dashboard"} className="text-gray-100 hover:text-emerald-400 transition-colors font-medium drop-shadow-sm">Dashboard</Link>
                  
                  <Link 
                    to="/profile"
                    className="relative group transition-transform hover:scale-105"
                    title="View Profile"
                  >
                      {user?.image ? (
                          <img 
                              src={`http://localhost:5000${user.image}`}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white/20 hover:border-emerald-500 transition cursor-pointer"
                          />
                      ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border-2 bg-white/10 text-white border-white/20 hover:border-emerald-500 hover:text-emerald-400">
                              <UserIcon size={20} />
                          </div>
                      )}
                  </Link>

                  <button 
                    onClick={() => { logout(); navigate('/login'); }}
                    className="flex items-center gap-1 text-gray-100 hover:text-red-400 transition-colors font-medium drop-shadow-sm"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-gray-100 hover:text-emerald-400 transition-colors font-medium drop-shadow-sm">Login</Link>
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: "#059669" }}
                      whileTap={{ scale: 0.95 }}
                      animate={{ boxShadow: ["0px 0px 0px rgba(16, 185, 129, 0)", "0px 0px 15px rgba(16, 185, 129, 0.5)", "0px 0px 0px rgba(16, 185, 129, 0)"] }}
                      transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
                      className="bg-emerald-600 text-white px-5 py-2 rounded-full font-semibold shadow-lg transition-colors border border-emerald-500/30"
                    >
                      Register
                    </motion.button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu items */}
            <div className="md:hidden flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-white/10 text-white"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-emerald-400 focus:outline-none drop-shadow-md"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-emerald-400 hover:bg-gray-800">Home</a>
                <a href="#ratings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-emerald-400 hover:bg-gray-800">Rating</a>
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-3 py-2">
                       {user?.image ? (
                           <img 
                               src={`http://localhost:5000${user.image}`}
                               alt={user.name}
                               className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                           />
                       ) : (
                           <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-gray-700 bg-gray-800 text-gray-400">
                               <UserIcon size={24} />
                           </div>
                       )}
                       <div>
                          <p className="text-white font-bold">{user.name}</p>
                          <p className="text-emerald-400 text-xs uppercase font-semibold">{user.role}</p>
                       </div>
                    </div>
                    <Link to={user.role === 'admin' ? "/admin/dashboard" : "/farmer/dashboard"} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-emerald-400 hover:bg-gray-800">Dashboard</Link>
                    <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-emerald-400 hover:bg-gray-800">Profile</Link>
                    <button 
                      onClick={() => { logout(); navigate('/login'); }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-red-400 hover:bg-gray-800"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-emerald-400 hover:bg-gray-800">Login</Link>
                    <Link to="/register" className="block w-full text-left">
                      <button className="w-full mt-2 bg-emerald-600 text-white px-5 py-3 rounded-md font-semibold shadow-sm hover:bg-emerald-700 transition-colors">
                        Register
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax & Overlay */}
        <motion.div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})`, y: y1, scale: 1.1 }}
        >
          <div className={`absolute inset-0 transition-colors duration-500 ${isDarkMode ? 'bg-black/50' : 'bg-black/30'}`}></div>
        </motion.div>

        {/* Floating Particles */}
        <div className="absolute inset-0 z-0 pointer-events-none">
           {[...Array(6)].map((_, i) => (
             <motion.div
               key={i}
               className={`absolute rounded-full blur-xl transition-colors duration-500 ${isDarkMode ? 'bg-emerald-400/10' : 'bg-emerald-400/20'}`}
               style={{
                 width: Math.random() * 200 + 100,
                 height: Math.random() * 200 + 100,
                 top: `${Math.random() * 100}%`,
                 left: `${Math.random() * 100}%`,
               }}
               animate={{
                 y: [0, -100, 0],
                 opacity: [0.3, 0.6, 0.3],
                 scale: [1, 1.2, 1],
               }}
               transition={{
                 duration: Math.random() * 10 + 10,
                 repeat: Infinity,
                 ease: "easeInOut",
               }}
             />
           ))}
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <motion.div style={{ y: y2, opacity }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-4 flex justify-center"
            >
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-semibold tracking-wider uppercase backdrop-blur-sm">
                Next Gen Farming
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight mb-8 drop-shadow-2xl leading-tight"
            >
              Secure Your Harvest. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
                Protect Your Herd.
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              className="text-xl sm:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md font-light"
            >
              Real-time monitoring, AI-powered threat detection, and seamless livestock tracking for the modern farm.
            </motion.p>
            
            <motion.div
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
               className="flex flex-col sm:flex-row gap-5 justify-center"
            >
              <Link to={user ? (user.role === 'admin' ? "/admin/dashboard" : "/farmer/dashboard") : "/login"}>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-lg font-bold rounded-full shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-3"
                >
                  Get Started 
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <a href="#ratings">
                <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.25)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-10 py-5 bg-white/10 backdrop-blur-md border border-white/30 text-white text-lg font-bold rounded-full shadow-lg hover:bg-white/20 transition-all font-semibold"
                >
                  See Reviews
                </motion.button>
              </a>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2 backdrop-blur-sm">
            <div className="w-1 h-2 bg-white rounded-full"></div>
          </div>
        </motion.div>
      </div>

      {/* 3. Rating Component */}
      <section id="ratings" className={`py-20 transition-colors duration-500 ${themeClasses.bg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-bold sm:text-4xl ${themeClasses.heading}`}>Trusted by Farmers Worldwide</h2>
            <p className={`mt-4 text-xl ${themeClasses.muted}`}>See what our community has to say about AgriGuard.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Left Side: Summary Card */}
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
               className={`p-8 rounded-2xl shadow-xl text-center border sticky top-24 transition-all duration-500 ${themeClasses.card}`}
            >
              <div className="flex justify-center items-center mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-8 w-8 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <div className={`text-6xl font-extrabold mb-2 ${themeClasses.heading}`}>4.7</div>
              <div className={`text-lg mb-6 ${themeClasses.muted}`}>out of 5.0</div>
              <div className="w-full bg-gray-700/30 rounded-full h-2.5 mb-6 overflow-hidden">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '94%' }}></div>
              </div>
              <div className="flex items-center justify-center gap-2 text-emerald-500 font-semibold bg-emerald-500/10 py-3 rounded-lg border border-emerald-500/20">
                 <Activity className="h-5 w-5" /> 99% Recommendation Rate
              </div>
              <p className={`mt-6 text-sm ${themeClasses.muted}`}>Based on 1,200+ verified reviews</p>
            </motion.div>

            {/* Right Side: Scrollable Testimonials */}
            <div className="lg:col-span-2 space-y-6">
               {[
                 {
                   name: "Sarah Jenkins", role: "Dairy Farmer", rating: 5,
                   text: "AgriGuard has completely transformed how I manage my herd. The real-time alerts saved me from a potential theft last month.",
                   avatar: "SJ"
                 },
                 {
                   name: "Michael Chen", role: "Crop Specialist", rating: 4,
                   text: "The zone monitoring is fantastic. I can keep an eye on my remote fields without driving out there every few hours.",
                   avatar: "MC"
                 },
                 {
                   name: "David O'Connor", role: "Livestock Manager", rating: 5,
                   text: "Installation was a breeze and the support team is top-notch. The dashboard gives me exactly the data I need.",
                   avatar: "DO"
                 },
                 {
                   name: "Elena Rodriguez", role: "Organic Farmer", rating: 5,
                   text: "I love the mobile app. Getting notifications on my phone while I'm at the market gives me such peace of mind.",
                   avatar: "ER"
                 }
               ].map((testimonial, index) => (
                 <motion.div 
                   key={index}
                   initial={{ opacity: 0, y: 50 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.5, delay: index * 0.1 }}
                   whileHover={{ scale: 1.02, y: -5 }}
                   className={`p-6 rounded-xl shadow-md border flex flex-col sm:flex-row gap-6 transition-all duration-500 ${themeClasses.card}`}
                 >
                    <div className="flex-shrink-0">
                      <div className="h-14 w-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xl border border-emerald-500/30">
                        {testimonial.avatar}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                         <h4 className={`text-lg font-bold ${themeClasses.heading}`}>{testimonial.name}</h4>
                         <span className={`text-sm ${themeClasses.muted}`}>{testimonial.role}</span>
                      </div>
                      <div className="flex items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                        ))}
                      </div>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>"{testimonial.text}"</p>
                    </div>
                 </motion.div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className={`${themeClasses.footer} py-12 border-t border-white/5`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
             {/* Brand */}
             <div className="col-span-1 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-8 w-8 text-emerald-500" />
                  <span className="font-bold text-2xl text-white tracking-tight">AgriGuard</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Empowering farmers with advanced security and monitoring solutions for a safer, more productive future.
                </p>
             </div>

             {/* Quick Links */}
             <div>
               <h3 className="font-semibold text-lg mb-4 text-emerald-400">Quick Links</h3>
               <ul className="space-y-2">
                 <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                 <li><a href="#ratings" className="text-gray-400 hover:text-white transition-colors">Reviews</a></li>
                 <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
                 <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors">Register</Link></li>
               </ul>
             </div>

             {/* Support */}
             <div>
               <h3 className="font-semibold text-lg mb-4 text-emerald-400">Support</h3>
               <ul className="space-y-2">
                 <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                 <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                 <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
               </ul>
             </div>

             {/* Newsletter */}
             <div>
               <h3 className="font-semibold text-lg mb-4 text-emerald-400">Stay Updated</h3>
               <p className="text-gray-400 text-sm mb-4">Subscribe for the latest farm security updates.</p>
               <div className="flex gap-2">
                 <input 
                   type="email" 
                   placeholder="Enter your email" 
                   className="bg-gray-900 border border-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-emerald-500 w-full"
                 />
                 <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
                   Go
                 </button>
               </div>
               <div className="flex gap-4 mt-6">
                 <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors"><Facebook size={20} /></a>
                 <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors"><Twitter size={20} /></a>
                 <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors"><Instagram size={20} /></a>
                 <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors"><Linkedin size={20} /></a>
               </div>
             </div>
          </div>
          <div className="border-t border-white/5 mt-12 pt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} AgriGuard. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
