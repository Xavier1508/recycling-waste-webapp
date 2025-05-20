import React from "react";
import Link from "next/link";

const SignUp = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex justify-center items-center flex-1">
        <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Sign up</h2>
          <form className="space-y-4">
            <input type="text" placeholder="Nama" className="w-full p-3 border rounded" />
            <input type="text" placeholder="No. Handphone" className="w-full p-3 border rounded" />
            <input type="email" placeholder="Email" className="w-full p-3 border rounded" />
            <input type="password" placeholder="Kata Sandi" className="w-full p-3 border rounded" />
            <input type="password" placeholder="Konfirmasi Kata Sandi" className="w-full p-3 border rounded" />
            <p className="text-xs text-center text-gray-500">
              By continuing, you agree to the <a href="#" className="underline">Terms of use</a> and <a href="#" className="underline">Privacy Policy</a>.
            </p>
            <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-full font-semibold">
              Daftar
            </button>
          </form>
          <div className="mt-6 border-t pt-4 text-center text-sm text-gray-600">
            Or continue with{" "}
            <Link href="/login" className="font-semibold underline">Login</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
