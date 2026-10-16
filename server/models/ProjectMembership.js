const mongoose = require("mongoose");

const projectMembershipSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

//prevents duplicate memberships
projectMembershipSchema.index(
  { project_id: 1, user_id: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "ProjectMembership",
  projectMembershipSchema
);