import { useEffect, useState } from "react";

function CreateProject() {
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Planning",
    project_lead_id: ""
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/users")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch(() => {
        setMessage("Unable to load users.");
      });
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/projects",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      setMessage(data.message);

      if (response.ok) {
        setFormData({
          name: "",
          description: "",
          status: "Planning",
          project_lead_id: ""
        });
      }

    } catch (error) {
      setMessage("Unable to connect to server.");
    }
  }

  return (
    <div className="form-container">

      <h2>Create Project</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="name"
          placeholder="Project Name"
          value={formData.name}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Project Description"
          value={formData.description}
          onChange={handleChange}
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Planning">
            Planning
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Completed">
            Completed
          </option>
        </select>

        <select
          name="project_lead_id"
          value={formData.project_lead_id}
          onChange={handleChange}
        >

          <option value="">
            Select Project Lead
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

        <button type="submit">
          Create Project
        </button>

      </form>

      <p>{message}</p>

    </div>
  );
}

export default CreateProject;