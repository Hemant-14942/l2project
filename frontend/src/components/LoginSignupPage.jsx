import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginSignupPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-800 to-black px-4">
      <div className="bg-[#1f1b2e] text-white rounded-2xl shadow-lg w-full max-w-md p-8 ">

        <h2 className="text-2xl font-semibold text-center">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p className="text-sm text-center text-gray-400 mb-6">
          {isLogin ? 'Sign in to continue to EduVoice.ai' : 'Sign up to get started with EduVoice.ai'}
        </p>

        <form className="space-y-4">
          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute top-3.5 left-3 text-gray-400 h-5 w-5" />
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-[#322d44] text-white pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute top-3.5 left-3 text-gray-400 h-5 w-5" />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-[#322d44] text-white pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {isLogin && (
            <div className="flex items-center justify-between text-sm text-gray-400">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="form-checkbox text-purple-500" />
                <span>Remember me</span>
              </label>
              <a href="#" className="hover:underline">
                Forgot password?
              </a>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-white text-black font-semibold py-2 rounded-md hover:bg-gray-200 transition"
          >
            {isLogin ? 'Sign In →' : 'Sign Up →'}
          </button>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-600" />
            <span className="mx-2 text-gray-400 text-sm">or</span>
            <hr className="flex-grow border-gray-600" />
          </div>

          <button
            type="button"
            onClick={() => (window.location.href = 'http://localhost:8000/auth/google')}
            className="w-full flex items-center justify-center gap-3 bg-[#322d44] border border-gray-600 text-white py-2 rounded-md hover:bg-[#3b3355] transition"
          >
            <Globe className="h-5 w-5" />
            {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
          </button>

          <p className="text-sm text-center text-gray-400 mt-4">
            {isLogin ? (
              <>
                Don’t have an account?{' '}
                <Link
                  to="/signup"
                  onClick={() => setIsLogin(false)}
                  className="text-white font-medium hover:underline"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link
                  to="/login"
                  onClick={() => setIsLogin(true)}
                  className="text-white font-medium hover:underline"
                >
                  Sign in
                </Link>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginSignupPage;
