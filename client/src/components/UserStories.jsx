import { useEffect, useState } from "react";

function UserStories() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  const [members, setMembers] = useState([]);
  const [stories, setStories] = useState([]);

  const [editingStoryId, setEditingStoryId] = useState(null);

  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "To Do",
    assigned_user_id: ""
  });

  useEffect(() => {
    loadProjects();
  }, []);

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

  async function loadProjectData(projectId) {
    if (!projectId) {
      setMembers([]);
      setStories([]);
      return;
    }

    try {
      const [membersResponse, storiesResponse] =
        await Promise.all([
          fetch(
            `http://localhost:5000/projects/${projectId}/members`
          ),

          fetch(
            `http://localhost:5000/projects/${projectId}/stories`
          )
        ]);

      const membersData = await membersResponse.json();
      const storiesData = await storiesResponse.json();

      if (membersResponse.ok) {
        setMembers(membersData);
      } else {
        setMessage(membersData.message);
      }

      if (storiesResponse.ok) {
        setStories(storiesData);
      } else {
        setMessage(storiesData.message);
      }

    } catch (error) {
      setMessage("Unable to load project backlog.");
    }
  }

  function resetForm() {
    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      status: "To Do",
      assigned_user_id: ""
    });

    setEditingStoryId(null);
  }

  function handleProjectChange(event) {
    const projectId = event.target.value;

    setSelectedProject(projectId);
    setMessage("");

    resetForm();

    loadProjectData(projectId);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedProject) {
      setMessage("Please select a project.");
      return;
    }

    const url = editingStoryId
      ? `http://localhost:5000/projects/${selectedProject}/stories/${editingStoryId}`
      : `http://localhost:5000/projects/${selectedProject}/stories`;

    const method = editingStoryId
      ? "PUT"
      : "POST";

    const requestData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      assigned_user_id:
        formData.assigned_user_id || null
    };

    //editable status for existing stories
    if (editingStoryId) {
      requestData.status = formData.status;
    }

    try {
      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      setMessage(data.message);

      if (response.ok) {
        resetForm();
        loadProjectData(selectedProject);
      }

    } catch (error) {
      setMessage("Unable to connect to server.");
    }
  }

  function editStory(story) {
    setEditingStoryId(story._id);

    setFormData({
      title: story.title,
      description: story.description,
      priority: story.priority,
      status: story.status,
      assigned_user_id:
        story.assigned_user_id?._id || ""
    });

    setMessage("");
  }

  async function deleteStory(storyId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user story?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/projects/${selectedProject}/stories/${storyId}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      setMessage(data.message);

      if (response.ok) {
        resetForm();
        loadProjectData(selectedProject);
      }

    } catch (error) {
      setMessage("Unable to delete story.");
    }
  }

  return (
    <div>
      <h2>User Stories & Project Backlog</h2>

      <label>Select Project</label>

      <select
        value={selectedProject}
        onChange={handleProjectChange}
      >
        <option value="">
          Select a project
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

      {selectedProject && (
        <>
          <h3>
            {editingStoryId
              ? "Edit User Story"
              : "Create User Story"}
          </h3>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="title"
              placeholder="Story Title"
              value={formData.title}
              onChange={handleChange}
            />

            <textarea
              name="description"
              placeholder="As a [type of user], I want [goal], so that [benefit]."
              value={formData.description}
              onChange={handleChange}
            />

            <label>Priority</label>

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {editingStoryId && (
              <>
                <label>Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">
                    In Progress
                  </option>
                  <option value="Done">Done</option>
                </select>
              </>
            )}

            <label>Assigned Member</label>

            <select
              name="assigned_user_id"
              value={formData.assigned_user_id}
              onChange={handleChange}
            >
              <option value="">
                Unassigned
              </option>

              {members.map((membership) => {
                const user = membership.user_id;

                return (
                  <option
                    key={user._id}
                    value={user._id}
                  >
                    {user.f_name} {user.l_name}
                    {" "}
                    ({user.username})
                  </option>
                );
              })}
            </select>

            <button type="submit">
              {editingStoryId
                ? "Save Changes"
                : "Create Story"}
            </button>

            {editingStoryId && (
              <button
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </form>

          <p>{message}</p>

          <h3>Project Backlog</h3>

          {stories.length === 0 ? (
            <p>
              This project currently has no user stories.
            </p>
          ) : (
            stories.map((story) => (
              <div
                key={story._id}
                className="project-card"
              >
                <h4>{story.title}</h4>

                <p>
                  <strong>Description:</strong>{" "}
                  {story.description}
                </p>

                <p>
                  <strong>Priority:</strong>{" "}
                  {story.priority}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {story.status}
                </p>

                <p>
                  <strong>Assigned Member:</strong>{" "}

                  {story.assigned_user_id
                    ? `${story.assigned_user_id.f_name}
                       ${story.assigned_user_id.l_name}
                       (${story.assigned_user_id.username})`
                    : "Unassigned"}
                </p>

                <button
                  onClick={() => editStory(story)}
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    deleteStory(story._id)
                  }
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

export default UserStories;