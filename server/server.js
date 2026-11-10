require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./models/User");
const Project = require("./models/Project");
const ProjectMembership = require("./models/ProjectMembership");
const UserStory = require("./models/UserStory");

const app = express();

app.use(cors());
app.use(express.json());


//test route
app.get("/", (req, res) => {
  res.send("Server is running");
});


//signup
app.post("/signup", async (req, res) => {
  try {
    const { f_name, l_name, username, password } = req.body;

    //check for empty fields
    if (!f_name || !l_name || !username || !password) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    //check for existing username
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({
        message: "Username already exists.",
      });
    }

    //creates user
    const newUser = new User({
      f_name,
      l_name,
      username,
      password,
    });

    await newUser.save();

    res.status(201).json({
      message: "User successfully created!",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error.",
    });
  }
});


//login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    //check for empty fields
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    //search for the username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: "Username does not exist.",
      });
    }

    //checks password
    if (user.password !== password) {
      return res.status(401).json({
        message: "Incorrect password.",
      });
    }

    res.status(200).json({
      message: "Login successful!",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error.",
    });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select(
      "_id f_name l_name username"
    );

    res.status(200).json(users);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error while retrieving users."
    });
  }
});

//
app.post("/projects", async (req, res) => {
  try {
    const {
      name,
      description,
      status,
      project_lead_id
    } = req.body;

    //check the required fields
    if (
      !name ||
      !description ||
      !status ||
      !project_lead_id
    ) {
      return res.status(400).json({
        message: "All project fields are required."
      });
    }

    //is the status valid?
    if (
      !["Planning", "Active", "Completed"].includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid project status."
      });
    }

    //does project lead exist?
    const lead = await User.findById(project_lead_id);

    if (!lead) {
      return res.status(404).json({
        message: "Selected Project Lead does not exist."
      });
    }

    //create the project
    const newProject = new Project({
      name,
      description,
      status,
      project_lead_id
    });

    await newProject.save();
    const leadMembership = new ProjectMembership({
      project_id: newProject._id,
      user_id: project_lead_id
    });

    await leadMembership.save();

    res.status(201).json({
      message: "Project successfully created!",
      project: newProject
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error while creating project."
    });
  }
});

//
app.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find()
      .populate(
        "project_lead_id",
        "f_name l_name username"
      );

    res.status(200).json(projects);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error while retrieving projects."
    });
  }
});

//
app.get("/projects/:projectId/members", async (req, res) => {
  try {
    const { projectId } = req.params;

    //check the project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project does not exist."
      });
    }

    const memberships = await ProjectMembership.find({
      project_id: projectId
    }).populate(
      "user_id",
      "f_name l_name username"
    );

    res.status(200).json(memberships);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error while retrieving members."
    });
  }
});

//
app.post("/projects/:projectId/members", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        message: "A user must be selected."
      });
    }

    //does the project exist?
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project does not exist."
      });
    }

    //does the user exist?
    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({
        message: "User does not exist."
      });
    }

    //cant have duplicite membership
    const existingMembership =
      await ProjectMembership.findOne({
        project_id: projectId,
        user_id: user_id
      });

    if (existingMembership) {
      return res.status(409).json({
        message: "User is already a member of this project."
      });
    }

    //add new member
    const membership = new ProjectMembership({
      project_id: projectId,
      user_id: user_id
    });

    await membership.save();

    res.status(201).json({
      message: "User added to project."
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error while adding member."
    });
  }
});

//
app.delete("/projects/:projectId/members/:userId", async (req, res) => {

    try {
      const { projectId, userId } = req.params;

      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({
          message: "Project does not exist."
        });
      }

      //leader cannot be removed
      if (
        project.project_lead_id.toString() === userId
      ) {
        return res.status(400).json({
          message: "The Project Lead cannot be removed."
        });
      }

      const assignedStory = await UserStory.findOne({
        project_id: projectId,
        assigned_user_id: userId
      });

      if (assignedStory) {
        return res.status(409).json({
        message:
          "This member cant be removed cause they still have assigned stories. Reassign, unassign, or delete those stories first."
      });
      }

      const membership =
        await ProjectMembership.findOne({
          project_id: projectId,
          user_id: userId
        });

      if (!membership) {
        return res.status(404).json({
          message: "Membership does not exist."
        });
      }

      await membership.deleteOne();

      res.status(200).json({
        message: "Member removed from project."
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Server error while removing member."
      });
    }
  }
);

app.post("/projects/:projectId/stories", async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      title,
      description,
      priority,
      assigned_user_id
    } = req.body;

    //is the projectID valid
    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID."
      });
    }

    //required fields
    if (
      !title?.trim() ||
      !description?.trim() ||
      !priority
    ) {
      return res.status(400).json({
        message: "Title, description, and priority are required."
      });
    }

    //priority for validity
    if (!["High", "Medium", "Low"].includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority."
      });
    }

    //does the project exist?
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project does not exist."
      });
    }

    let assignedUser = null;

    //optional assignment
    if (assigned_user_id) {

      if (!mongoose.isValidObjectId(assigned_user_id)) {
        return res.status(400).json({
          message: "Invalid assigned user ID."
        });
      }

      const user = await User.findById(assigned_user_id);

      if (!user) {
        return res.status(404).json({
          message: "Assigned user does not exist."
        });
      }

      //the user must be apart of this project
      const membership = await ProjectMembership.findOne({
        project_id: projectId,
        user_id: assigned_user_id
      });

      if (!membership) {
        return res.status(400).json({
          message: "Assigned user is not a member of this project."
        });
      }

      assignedUser = assigned_user_id;
    }

    const story = new UserStory({
      project_id: projectId,
      title: title.trim(),
      description: description.trim(),
      priority,
      status: "To Do",
      assigned_user_id: assignedUser
    });

    await story.save();

    res.status(201).json({
      message: "User story created successfully.",
      story
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error while creating user story."
    });
  }
});

app.get("/projects/:projectId/stories", async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID."
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project does not exist."
      });
    }

    const stories = await UserStory.find({
      project_id: projectId
    }).populate(
      "assigned_user_id",
      "f_name l_name username"
    );

    res.status(200).json(stories);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error while retrieving stories."
    });
  }
});

app.put("/projects/:projectId/stories/:storyId",async (req, res) => {
    try {
      const { projectId, storyId } = req.params;

      const {
        title,
        description,
        priority,
        status,
        assigned_user_id
      } = req.body;

      if (
        !mongoose.isValidObjectId(projectId) ||
        !mongoose.isValidObjectId(storyId)
      ) {
        return res.status(400).json({
          message: "Invalid project or story ID."
        });
      }

      if (
        !title?.trim() ||
        !description?.trim() ||
        !priority ||
        !status
      ) {
        return res.status(400).json({
          message: "Title, description, priority, and status are required."
        });
      }

      if (!["High", "Medium", "Low"].includes(priority)) {
        return res.status(400).json({
          message: "Invalid priority."
        });
      }

      if (
        !["To Do", "In Progress", "Done"].includes(status)
      ) {
        return res.status(400).json({
          message: "Invalid status."
        });
      }

      const story = await UserStory.findOne({
        _id: storyId,
        project_id: projectId
      });

      if (!story) {
        return res.status(404).json({
          message: "Story does not exist in this project."
        });
      }

      let assignedUser = null;

      if (assigned_user_id) {

        if (!mongoose.isValidObjectId(assigned_user_id)) {
          return res.status(400).json({
            message: "Invalid assigned user ID."
          });
        }

        const user = await User.findById(assigned_user_id);

        if (!user) {
          return res.status(404).json({
            message: "Assigned user does not exist."
          });
        }

        const membership = await ProjectMembership.findOne({
          project_id: projectId,
          user_id: assigned_user_id
        });

        if (!membership) {
          return res.status(400).json({
            message: "Assigned user is not a member of this project."
          });
        }

        assignedUser = assigned_user_id;
      }

      story.title = title.trim();
      story.description = description.trim();
      story.priority = priority;
      story.status = status;
      story.assigned_user_id = assignedUser;

      await story.save();

      res.status(200).json({
        message: "User story updated successfully."
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Server error while updating story."
      });
    }
  }
);

app.delete("/projects/:projectId/stories/:storyId", async (req, res) => {
    try {
      const { projectId, storyId } = req.params;

      if (
        !mongoose.isValidObjectId(projectId) ||
        !mongoose.isValidObjectId(storyId)
      ) {
        return res.status(400).json({
          message: "Invalid project or story ID."
        });
      }

      const story = await UserStory.findOne({
        _id: storyId,
        project_id: projectId
      });

      if (!story) {
        return res.status(404).json({
          message: "Story does not exist in this project."
        });
      }

      await story.deleteOne();

      res.status(200).json({
        message: "User story deleted successfully."
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Server error while deleting story."
      });
    }
  }
);

//CONNECT TO MONGODB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });