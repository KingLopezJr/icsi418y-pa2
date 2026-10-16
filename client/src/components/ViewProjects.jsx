import { useEffect, useState } from "react";

function ViewProjects() {
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState("");

  async function loadProjects() {
    try {
      const response = await fetch(
        "http://localhost:5000/projects"
      );

      const data = await response.json();

      if (response.ok) {
        setProjects(data);
      } else {
        setMessage(data.message);
      }

    } catch (error) {
      setMessage("Unable to load projects.");
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div>

      <h2>Projects</h2>

      <button onClick={loadProjects}>
        Refresh Projects
      </button>

      <p>{message}</p>

      {projects.map((project) => (

        <div
          key={project._id}
          className="project-card"
        >

          <h3>{project.name}</h3>

          <p>
            <strong>Description:</strong>{" "}
            {project.description}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {project.status}
          </p>

          <p>
            <strong>Project Lead:</strong>{" "}

            {project.project_lead_id
              ? `${project.project_lead_id.f_name}
                 ${project.project_lead_id.l_name}
                 (${project.project_lead_id.username})`
              : "Unknown"}
          </p>

        </div>

      ))}

    </div>
  );
}

export default ViewProjects;