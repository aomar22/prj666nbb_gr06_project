// App.jsx
import AppRouter from "./router/AppRouter";
import AppRouterDev from "./router/AppRouterDev";

function App() {
  // Check the environment variable
  const isDevMode = import.meta.env.VITE_DISABLE_AUTH === 'true';

  console.log("Auth Disabled:", isDevMode); // Debugging line

  return (
    <div className="app-container">
      {isDevMode ? <AppRouterDev /> : <AppRouter />}
    </div>
  );
}

export default App;