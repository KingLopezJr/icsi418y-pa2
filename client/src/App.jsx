import { useState } from "react";
import Signup from "./components/Signup";
import Login from "./components/Login";
import "./App.css";

function App() {
  const [page, setPage] = useState("signup");

  return (
    <div className="app">

      <h1>Login & Signup Application</h1>

      <div className="navigation">

        <button onClick={() => setPage("signup")}>
          Signup
        </button>

        <button onClick={() => setPage("login")}>
          Login
        </button>

      </div>

      {page === "signup" ? <Signup /> : <Login />}

    </div>
  );
}

export default App;