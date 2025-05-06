import React from "react";
import Link from "next/link"; 
import { FaRegEyeSlash } from "react-icons/fa";

const Login = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex justify-center items-center flex-1">
        <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Log in</h2>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Email address or user name"
              className="w-full p-3 border rounded"
            />
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border rounded"
              />
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="mr-2" />
              <label htmlFor="remember" className="text-sm">Remember me</label>
            </div>
            <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-full font-semibold">
              Login
            </button>
            <p className="text-xs text-center text-gray-500">
              By continuing, you agree to the <a href="#" className="underline">Terms of use</a> and <a href="#" className="underline">Privacy Policy</a>.
            </p>
            <a href="#" className="text-sm font-medium text-center block">Forget your password</a>
            <p className="text-sm text-center">
              Don’t have an account?{" "}
              <Link href="/signup" className="font-semibold underline">Sign up</Link> 
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;
