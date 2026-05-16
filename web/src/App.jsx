import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import { useAuth } from "@clerk/clerk-react";
import PageLoader from "./components/PageLoader";
import useUserSync from "./hooks/useUserSync";
import OnboardingPage from "./pages/OnboardingPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  const { isLoaded, isSignedIn, user } = useAuth();
  useUserSync();

  if (!isLoaded) return <PageLoader />;

  return (
    <Routes>
      <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to={"/chat"} />} />
      <Route 
        path="/chat" 
        element={isSignedIn ? <ChatPage /> : <Navigate to={"/"} />} 
      />
      <Route 
        path="/onboarding" 
        element={isSignedIn ? <OnboardingPage /> : <Navigate to={"/"} />} 
      />
      <Route 
        path="/profile" 
        element={isSignedIn ? <ProfilePage /> : <Navigate to={"/"} />} 
      />
    </Routes>
  );
}

export default App;
