const projectController = require("./controllers/project.controller");
const projectRepository = require("./repositories/project.repository");
const projectService = require("./services/project.service");

module.exports = {
  projectController,
  projectService,
  projectRepository
}
