import React from "react";

type LoginPageProps = {
  onLogin: () => void;
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2>Welcome to BROS</h2>
      <button onClick={onLogin}>Login with GitHub</button>
    </div>
  );
};

export default LoginPage;
