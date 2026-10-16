import { useEffect, useState } from "react";

function ManageMemberships() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedProject, setSelectedProject] =
    useState("");

  const [selectedUser, setSelectedUser] =
    useState("");

  const [members, setMembers] = useState([]);

  const [message, setMessage] = useState("");

  useEffect(() => {

    fetch("http://localhost:5000/projects")
      .then((response) => response.json())
      .then((data) => setProjects(data));

    fetch("http://localhost:5000/users")
      .then((response) => response.json())
      .then((data) => setUsers(data));

  }, []);

  async function loadMembers(projectId) {

    if (!projectId) {
      setMembers([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/projects/${projectId}/members`
      );

      const data = await response.json();

      if (response.ok) {
        setMembers(data);
      } else {
        setMessage(data.message);
      }

    } catch (error) {
      setMessage("Unable to load project members.");
    }
  }

  function handleProjectChange(event) {
    const projectId = event.target.value;

    setSelectedProject(projectId);
    setMessage("");

    loadMembers(projectId);
  }

  async function addMember() {

    if (!selectedProject || !selectedUser) {
      setMessage(
        "Select both a project and a user."
      );
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/projects/${selectedProject}/members`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            user_id: selectedUser
          })
        }
      );

      const data = await response.json();

      setMessage(data.message);

      if (response.ok) {
        loadMembers(selectedProject);
      }

    } catch (error) {
      setMessage("Unable to add member.");
    }
  }

  async function removeMember(userId) {

    try {
      const response = await fetch(
        `http://localhost:5000/projects/${selectedProject}/members/${userId}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      setMessage(data.message);

      if (response.ok) {
        loadMembers(selectedProject);
      }

    } catch (error) {
      setMessage("Unable to remove member.");
    }
  }

  const currentProject = projects.find(
    (project) => project._id === selectedProject
  );

  return (
    <div>

      <h2>Manage Project Memberships</h2>

      <select
        value={selectedProject}
        onChange={handleProjectChange}
      >

        <option value="">
          Select Project
        </option>

        {projects.map((project) => (

          <option
            key={project._id}
            value={project._id}
          >
            {project.name}
          </option>

        ))}

      </select>

      <br /><br />

      <select
        value={selectedUser}
        onChange={(event) =>
          setSelectedUser(event.target.value)
        }
      >

        <option value="">
          Select User
        </option>

        {users.map((user) => (

          <option
            key={user._id}
            value={user._id}
          >

            {user.f_name} {user.l_name}
            {" "}
            ({user.username})

          </option>

        ))}

      </select>

      <button onClick={addMember}>
        Add Member
      </button>

      <p>{message}</p>

      <h3>Current Members</h3>

      {members.map((membership) => {

        const user = membership.user_id;

        const isLead =
          currentProject &&
          currentProject.project_lead_id &&
          currentProject.project_lead_id._id === user._id;

        return (
          <div key={membership._id}>

            {user.f_name} {user.l_name}
            {" "}
            ({user.username})

            {isLead && " - Project Lead"}

            {!isLead && (

              <button
                onClick={() =>
                  removeMember(user._id)
                }
              >
                Remove
              </button>

            )}

          </div>
        );
      })}

    </div>
  );
}

export default ManageMemberships;