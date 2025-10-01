import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

function Main() {
    const { user } = useAuth()

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 bg-pattern">
            {/* Navigation */}
            <nav className="relative z-10 px-6 py-4 animate-fade-in">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <span className="text-purple-600 font-bold text-lg">T</span>
                        </div>
                        <h1 className="text-white text-xl font-bold">
                            Task<span className="text-purple-400">Manager</span>
                        </h1>
                    </Link>
                    
                    <div className="hidden md:flex items-center space-x-6">
                        <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                        <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
                        <a href="#faq" className="text-gray-300 hover:text-white transition-colors">FAQ</a>
                        {user ? (
                            <Link to="/projects" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Login</Link>
                                <Link to="/register" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                    
                    {/* Mobile menu button */}
                    <button className="md:hidden text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative px-6 py-20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block glass border border-purple-400/30 rounded-full px-4 py-2 mb-6 animate-fade-in-up">
                            <span className="text-purple-300 text-sm">🎉 1,000+ users! Join our growing community.</span>
                        </div>
                        
                        <h1 className="text-responsive-xl font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                            Everything you need,<br />
                            <span className="gradient-text">
                                right here.
                            </span>
                        </h1>
                        
                        <p className="text-responsive-md text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                            TaskManager is your go-to for modern, feature-rich project management and task organization. 
                            Everything you need — right here.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                            <Link 
                                to="/register" 
                                className="btn-primary px-8 py-4 text-lg"
                            >
                                Get Started Free
                            </Link>
                            <Link 
                                to="/login" 
                                className="btn-secondary px-8 py-4 text-lg"
                            >
                                View Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="relative animate-fade-in-up" style={{animationDelay: '0.8s'}}>
                        <div className="glass-dark rounded-2xl p-8 shadow-purple card-hover">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold text-white">Modern Dashboard</h3>
                                    <p className="text-gray-300">Clean, intuitive interface designed for productivity</p>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-slow"></div>
                                        <span className="text-green-400 text-sm">Live Status</span>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
                                    <div className="space-y-3">
                                        <div className="h-4 bg-purple-600 rounded w-3/4 loading-skeleton"></div>
                                        <div className="h-3 bg-gray-600 rounded w-1/2 loading-skeleton"></div>
                                        <div className="h-3 bg-gray-600 rounded w-2/3 loading-skeleton"></div>
                                        <div className="flex space-x-2 mt-4">
                                            <div className="w-16 h-8 bg-blue-600 rounded"></div>
                                            <div className="w-16 h-8 bg-green-600 rounded"></div>
                                            <div className="w-16 h-8 bg-yellow-600 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="section-padding">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 animate-fade-in-up">
                        <h2 className="text-responsive-lg font-bold text-white mb-4">
                            Over <span className="gradient-text">1,000+</span> people use TaskManager
                        </h2>
                        <p className="text-responsive-md text-gray-300">
                            Join our growing community of productive users
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                            <div className="text-3xl font-bold text-white mb-2">50,000+</div>
                            <div className="text-gray-400">Tasks Completed</div>
                        </div>
                        <div className="text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                            <div className="text-3xl font-bold text-white mb-2">1,000+</div>
                            <div className="text-gray-400">Active Users</div>
                        </div>
                        <div className="text-center animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                            <div className="text-3xl font-bold text-white mb-2">10,000+</div>
                            <div className="text-gray-400">Projects Created</div>
                        </div>
                        <div className="text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                            <div className="text-3xl font-bold text-white mb-2">99%</div>
                            <div className="text-gray-400">Satisfaction Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="section-padding">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-responsive-lg font-bold text-white mb-4 animate-fade-in-up">
                        Ready to get started?
                    </h2>
                    <p className="text-responsive-md text-gray-300 mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                        Create your account and start managing tasks in minutes!
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                        <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                taskmanager.com/
                            </span>
                            <input 
                                type="text" 
                                placeholder="username" 
                                className="form-input pl-32 pr-4 py-3"
                            />
                        </div>
                        <Link 
                            to="/register" 
                            className="btn-primary px-6 py-3 whitespace-nowrap"
                        >
                            Claim Now
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/10 px-6 py-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                    <span className="text-purple-600 font-bold text-lg">T</span>
                                </div>
                                <h3 className="text-white text-xl font-bold">
                                    Task<span className="text-purple-400">Manager</span>
                                </h3>
                            </div>
                            <p className="text-gray-400 mb-4">
                                Create feature-rich, customizable and modern task management with TaskManager.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="text-white font-semibold mb-4">General</h4>
                            <div className="space-y-2">
                                <Link to="/login" className="block text-gray-400 hover:text-white transition-colors">Login</Link>
                                <Link to="/register" className="block text-gray-400 hover:text-white transition-colors">Sign Up</Link>
                                <a href="#pricing" className="block text-gray-400 hover:text-white transition-colors">Pricing</a>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="text-white font-semibold mb-4">Support</h4>
                            <div className="space-y-2">
                                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Help Center</a>
                                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Contact</a>
                                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Status</a>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t border-white/10 mt-8 pt-8 text-center">
                        <p className="text-gray-400">
                            Copyright © 2025 TaskManager - All Rights Reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Main
