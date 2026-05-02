import './App.css'
import { SignInButton, UserButton, useAuth } from '@clerk/react'

function App() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h1>Hello World</h1>
      {/* token with the req */}

      {!userId ? (
        <SignInButton mode="modal" />
      ) : (
        <UserButton />
      )}
    </>
  );
}

export default App;
