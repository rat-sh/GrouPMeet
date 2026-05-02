import './App.css'
import { SignInButton, UserButton, useAuth } from '@clerk/react'

/**
 * Main application component that displays a loading indicator and authentication controls.
 *
 * Renders "Loading..." until authentication state is ready; once loaded, shows a greeting
 * and either a `SignInButton` (when no user is authenticated) or a `UserButton` (when a user is authenticated).
 * @returns {JSX.Element} The app's UI element.
 */
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
