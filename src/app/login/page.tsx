"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, trigger OTP here.
    // Simulating successful login and redirecting to home
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center border-b border-gray-100 sticky top-0 bg-white z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-900" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-900 mr-5">Log in or sign up</h1>
      </header>

      <div className="flex-1 px-6 py-6 max-w-md mx-auto w-full flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to NoidaStay</h2>
        </div>

        <form onSubmit={handleContinue} className="flex flex-col gap-4 flex-1">
          <div className="border border-gray-400 rounded-xl overflow-hidden focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all">
            <div className="flex border-b border-gray-400 relative">
              <div className="w-1/3 p-3 flex items-center justify-between border-r border-gray-400 cursor-pointer hover:bg-gray-50 bg-white z-10">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Country/Region</span>
                  <span className="text-gray-900">India (+91)</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
              <div className="w-2/3 p-3 bg-white z-10">
                 <div className="flex flex-col h-full justify-center">
                    <span className="text-xs text-gray-500 absolute top-2 left-[calc(33.333%+16px)]">Phone number</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="00000 00000"
                      className="w-full mt-3 outline-none text-gray-900 bg-transparent text-lg"
                      maxLength={10}
                      autoFocus
                    />
                 </div>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mb-2">
            We'll call or text you to confirm your number. Standard message and data rates apply. <span className="underline font-medium text-gray-900 cursor-pointer">Privacy Policy</span>
          </p>

          <button 
            type="submit"
            disabled={phoneNumber.length < 10}
            className={`w-full py-3.5 rounded-xl font-semibold text-white transition-colors ${phoneNumber.length >= 10 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            Continue
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-500 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div className="flex flex-col gap-4">
            <button type="button" className="w-full flex items-center justify-center gap-3 py-3 border border-gray-900 rounded-xl hover:bg-gray-50 transition-colors font-medium">
              <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
            <button type="button" className="w-full flex items-center justify-center gap-3 py-3 border border-gray-900 rounded-xl hover:bg-gray-50 transition-colors font-medium">
              <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/></svg>
              Continue with Facebook
            </button>
            <button type="button" className="w-full flex items-center justify-center gap-3 py-3 border border-gray-900 rounded-xl hover:bg-gray-50 transition-colors font-medium">
              <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg"><path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z" fill="#000"/><path d="M15.266 11.2c-.035-1.94 1.583-2.88 1.655-2.924-1.12-1.636-2.862-1.855-3.486-1.877-1.5-.152-2.936.883-3.7.883-.765 0-1.943-.86-3.155-.837-1.562.023-3.006.907-3.816 2.317-1.64 2.846-.42 7.054 1.18 9.358.784 1.127 1.706 2.385 2.923 2.34 1.18-.046 1.623-.762 3.05-.762 1.428 0 1.83.762 3.067.739 1.258-.023 2.05-.115 2.812-1.22 1.054-1.535 1.488-3.02 1.507-3.097-.034-.015-2.895-1.11-2.924-4.815zM12.91 5.093c.662-.803 1.107-1.916.985-3.023-1.01.04-2.186.671-2.864 1.488-.604.722-1.143 1.86-1.002 2.946 1.134.088 2.217-.615 2.88-1.41z" fill="#fff"/></svg>
              Continue with Apple
            </button>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-900 mb-8">
            Don't have an account? <Link href="/signup" className="font-semibold underline">Sign up</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
