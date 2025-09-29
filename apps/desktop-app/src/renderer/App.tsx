import React from "react";
import LoginPage from "./LoginPage";

function App() {
  const handleLogin = async () => {
    try {
      const result = await window.electron.login();
      console.log("Login result:", result);

      if (result.success) {
        alert("✅ Logged in successfully!");
      } else {
        alert("❌ Login failed: " + result.error);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Unexpected error during login");
    }
  };

  return <LoginPage onLogin={handleLogin} />;
}

export default App;
