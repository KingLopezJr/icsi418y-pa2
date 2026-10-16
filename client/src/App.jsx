import { useState } from "react";

import Signup from "./components/Signup";
import Login from "./components/Login";
import CreateProject from "./components/CreateProject";
import ViewProjects from "./components/ViewProjects";
import ManageMemberships from "./components/ManageMemberships";

import "./App.css";

function App() {
  const [page, setPage] = useState("signup");

  return (
    <div className="app">

      <h1>Project Management Application</h1>

      <div className="navigation">

        <button
          onClick={() => setPage("signup")}
        >
          Signup
        </button>

        <button
          onClick={() => setPage("login")}
        >
          Login
        </button>

        <button
          onClick={() => setPage("createProject")}
        >
          Create Project
        </button>

        <button
          onClick={() => setPage("projects")}
        >
          View Projects
        </button>

        <button
          onClick={() => setPage("memberships")}
        >
          Manage Memberships
        </button>

      </div>

      {page === "signup" && <Signup />}

      {page === "login" && <Login />}

      {page === "createProject" &&
        <CreateProject />}

      {page === "projects" &&
        <ViewProjects />}

      {page === "memberships" &&
        <ManageMemberships />}

    </div>
  );
}

export default App;