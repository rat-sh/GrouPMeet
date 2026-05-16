import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router";
import { Phone } from "lucide-react";
import api from "../lib/axios";

export default function OnboardingPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phoneNumber.length < 5) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const token = await getToken();
      await api.post(
        "/users/verify-phone",
        { phoneNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Verification successful, go to chat
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#F4A261]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#1A1A1D] rounded-3xl border border-[#2A2A2D] p-8 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#F4A261]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#F4A261]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Verify your number
          </h1>
          <p className="text-[#6B6B70] text-sm leading-relaxed">
            To secure your account and prevent spam, please enter your primary phone number.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#6B6B70] uppercase tracking-wider">Phone Number</label>
            <div className="flex items-center bg-[#0D0D0F] border border-[#2A2A2D] rounded-xl px-4 py-3 focus-within:border-[#F4A261] transition-colors">
              <Phone className="w-5 h-5 text-[#6B6B70] mr-3" />
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="bg-transparent border-none outline-none text-white w-full text-lg tracking-wide placeholder:text-[#3A3A45]"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F4A261] hover:bg-[#E08F50] text-[#0D0D0F] font-bold py-4 rounded-xl transition-all disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-[#0D0D0F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              "Complete Profile"
            )}
          </button>
        </form>

        {/* Phase 2 Placeholder */}
        <div className="mt-8 pt-6 border-t border-[#2A2A2D]">
          <button className="w-full bg-[#2A2A2D] hover:bg-[#3A3A45] text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Log in with QR Code
          </button>
        </div>
      </div>
    </div>
  );
}
