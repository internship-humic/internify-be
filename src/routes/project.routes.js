const express = require('express');
const { projectController } = require('../modules/project');
const { verifyJWT } = require('../middleware/verifyJWT');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         project_icon:
 *           type: string
 *           enum: [code, chart, cloud, mobile, gear, users, clipboard, speedometer, lightbulb, shield]
 *           example: code
 *         project_name:
 *           type: string
 *           example: Internify LMS
 *         description:
 *           type: string
 *           example: Project for developing Internify LMS features
 *         start_date:
 *           type: string
 *           format: date
 *           example: 2026-06-10
 *         end_date:
 *           type: string
 *           format: date
 *           example: 2026-08-10
 *         max_members:
 *           type: integer
 *           example: 8
 *         status:
 *           type: string
 *           enum: [active, completed, archived]
 *           example: active
 *         total_members:
 *           type: integer
 *           example: 5
 *         total_tasks:
 *           type: integer
 *           example: 3
 *     ProjectCreateRequest:
 *       type: object
 *       required:
 *         - project_icon
 *         - project_name
 *         - start_date
 *         - end_date
 *       properties:
 *         project_icon:
 *           type: string
 *           enum: [code, chart, cloud, mobile, gear, users, clipboard, speedometer, lightbulb, shield]
 *           example: code
 *         project_name:
 *           type: string
 *           example: Internify LMS
 *         description:
 *           type: string
 *           example: Project for developing Internify LMS features
 *         start_date:
 *           type: string
 *           format: date
 *           example: 2026-06-10
 *         end_date:
 *           type: string
 *           format: date
 *           example: 2026-08-10
 *         member_emails:
 *           type: array
 *           items:
 *             type: string
 *             format: email
 *           example: ["intern1@example.com", "intern2@example.com"]
 *     ProjectUpdateRequest:
 *       type: object
 *       properties:
 *         project_icon:
 *           type: string
 *           enum: [code, chart, cloud, mobile, gear, users, clipboard, speedometer, lightbulb, shield]
 *           example: cloud
 *         project_name:
 *           type: string
 *           example: Internify LMS Updated
 *         description:
 *           type: string
 *           example: Updated project description
 *         start_date:
 *           type: string
 *           format: date
 *           example: 2026-06-15
 *         end_date:
 *           type: string
 *           format: date
 *           example: 2026-08-20
 *         status:
 *           type: string
 *           enum: [active, completed, archived]
 *           example: completed
 */

/**
 * @swagger
 * /project-api/add:
 *   post:
 *     summary: Create a new project
 *     description: Create a new Internify LMS project. Admin can optionally invite interns by email.
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectCreateRequest'
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Admin or invited user not found
 *       417:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/add', verifyJWT, isAdmin, projectController.createProject);

/**
 * @swagger
 * /project-api/get:
 *   get:
 *     summary: Get all projects
 *     description: Admin can see all projects. Intern can only see projects where they are active members.
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, archived]
 *         required: false
 *         description: Filter projects by status
 *         example: active
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *       401:
 *         description: Unauthorized
 *       417:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.get('/get', verifyJWT, projectController.getAllProjects);

/**
 * @swagger
 * /project-api/get/{id}:
 *   get:
 *     summary: Get project detail
 *     description: Admin can access any project. Intern can only access project where they are active members.
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Project ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Project detail retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.get('/get/:id', verifyJWT, projectController.getProjectById);

/**
 * @swagger
 * /project-api/update/{id}:
 *   patch:
 *     summary: Update project
 *     description: Update project information. Only admin can access this endpoint.
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Project ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectUpdateRequest'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Project not found
 *       417:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.patch('/update/:id', verifyJWT, isAdmin, projectController.updateProject);

/**
 * @swagger
 * /project-api/delete/{id}:
 *   delete:
 *     summary: Archive project
 *     description: Archive project by changing its status to archived. This endpoint does not hard delete the project.
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Project ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Project archived successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete/:id', verifyJWT, isAdmin, projectController.archiveProject);

module.exports = router;
