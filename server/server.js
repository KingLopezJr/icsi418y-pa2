require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./models/User");
const Project = require("./models/Project");
const ProjectMembership = require("./models/ProjectMembership");

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

app.delete(
  "/projects/:projectId/members/:userId",
  async (req, res) => {

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



// CONNECT TO MONGODB
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