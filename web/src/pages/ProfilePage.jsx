import React from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useModeStore } from "../lib/modeStore";
import { 
  ArrowLeft, Camera, LogOut, Lock, 
  MessageSquare, BookOpen, Briefcase, Moon
} from "lucide-react";

export default function ProfilePage() {
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const { data: dbUser, isLoading } = useCurrentUser();
  const { mode, setMode } = useModeStore();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#0D0D0F] flex items-center justify-center">
        <span className="loading loading-spinner loading-md text-[#F4A261]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white flex justify-center pb-12 overflow-y-auto">
      <div className="w-full max-w-2xl px-6">
        
        {/* Header */}
        <div className="flex items-center pt-8 pb-4">
          <Link to="/chat" className="p-2 bg-[#1A1A1D] hover:bg-[#2A2A2D] rounded-full transition-colors mr-4">
            <ArrowLeft size={20} className="text-[#F4A261]" />
          </Link>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {/* ── Avatar & Name ── */}
        <div className="flex flex-col items-center pt-6 pb-8">
          <div className="relative mb-4">
            <div className="rounded-full border-4 border-[#F4A261] p-1">
              <img 
                src={clerkUser?.imageUrl || dbUser?.avatar} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>
            <button className="absolute bottom-1 right-1 w-8 h-8 bg-[#F4A261] border-2 border-[#0D0D0F] rounded-full flex items-center justify-center text-[#0D0D0F] hover:bg-[#E08F50] transition-colors">
              <Camera size={16} />
            </button>
          </div>

          <h2 className="text-2xl font-extrabold text-white">
            {dbUser?.displayName || clerkUser?.fullName || "User"}
          </h2>
          <p className="text-[#F4A261] font-mono text-sm mt-1 bg-[#F4A261]/10 px-3 py-1 rounded-lg">
            {dbUser?.username || "@username"}
          </p>
        </div>

        {/* ── Life Mode Switcher ── */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-[#6B6B70] uppercase tracking-wider mb-3 ml-2">
            Life Mode
          </h3>
          <div className="flex gap-2 bg-[#1A1A1D] rounded-2xl p-2 border border-[#2A2A2D]">
            {[
              { id: "personal", label: "Personal", icon: <MessageSquare size={16} /> },
              { id: "education", label: "Education", icon: <BookOpen size={16} /> },
              { id: "professional", label: "Professional", icon: <Briefcase size={16} /> }
            ].map((m) => {
              const isActive = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all ${
                    isActive ? "bg-[#F4A261] text-[#0D0D0F]" : "text-[#6B6B70] hover:bg-white/5"
                  }`}
                >
                  {m.icon}
                  <span className={`text-xs font-bold mt-1 ${isActive ? "text-[#0D0D0F]" : "text-[#6B6B70]"}`}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Appearance (Theme Engine) ── */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-[#6B6B70] uppercase tracking-wider mb-3 ml-2">
            Appearance
          </h3>
          <div className="bg-[#1A1A1D] rounded-2xl overflow-hidden border border-[#2A2A2D]">
            
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#2A2A2D]">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mr-4">
                  <Moon size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">Dark Mode</p>
                  <p className="text-xs text-[#6B6B70]">Transforms UI to Neon mode</p>
                </div>
              </div>
              <input type="checkbox" className="toggle toggle-primary" defaultChecked />
            </div>

            {/* Color Family */}
            <div className="px-4 py-4">
              <p className="text-sm text-[#6B6B70] mb-3 font-semibold">Theme Color</p>
              <div className="flex gap-3">
                {[
                  { id: "green", color: "bg-emerald-500" },
                  { id: "yellow", color: "bg-yellow-400" },
                  { id: "red", color: "bg-rose-500" },
                  { id: "blue", color: "bg-blue-500" },
                  { id: "pink", color: "bg-pink-500" },
                ].map((c) => (
                  <button 
                    key={c.id}
                    className={`w-10 h-10 rounded-full ${c.color} border-2 ${c.id === "green" ? "border-white" : "border-transparent"}`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Top Secret Section ── */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-[#6B6B70] uppercase tracking-wider mb-3 ml-2">
            Top Secret (Only you can see this)
          </h3>
          <div className="bg-[#1A1A1D] rounded-2xl overflow-hidden border border-[#2A2A2D]">
            
            {/* Email */}
            <div className="flex items-center px-4 py-4 border-b border-[#2A2A2D]">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mr-4">
                <span className="font-bold text-lg">@</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#6B6B70]">Registered Email</p>
                <p className="font-semibold">{dbUser?.email || clerkUser?.primaryEmailAddress?.emailAddress}</p>
              </div>
              <Lock size={16} className="text-[#6B6B70]" />
            </div>

            {/* Phone Number */}
            <div className="flex items-center px-4 py-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 mr-4">
                <PhoneIcon />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#6B6B70]">Verified Phone Number</p>
                <p className="font-semibold">{dbUser?.phoneNumber || "Not Set"}</p>
              </div>
              <Lock size={16} className="text-[#6B6B70]" />
            </div>

          </div>
        </div>

        {/* ── Sign Out ── */}
        <button 
          onClick={handleSignOut}
          className="w-full mt-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut size={20} />
          Log Out
        </button>

        <p className="text-center text-[#3A3A45] text-xs mt-8">
          GrouPMeet Web v1.0.0
        </p>
      </div>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
  );
}
