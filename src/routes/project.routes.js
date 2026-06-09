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
 *     ProjectAdminSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         full_name:
 *           type: string
 *           example: Admin One
 *         email:
 *           type: string
 *           example: admin1@internify.com
 *         profile_picture:
 *           type: string
 *           nullable: true
 *           example: /uploads/admin-profile.png
 *         professional_bio:
 *            type: string
 *            nullable: true
 *            example: Senior Program Manager at Internify.
 *     ProjectListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         project_icon:
 *           type: string
 *           example: code
 *         project_name:
 *           type: string
 *           example: Internify Platform Dev
 *         description:
 *           type: string
 *           example: Upgrading the core Internify platform backend and web client.
 *         start_date:
 *           type: string
 *           format: date-time
 *           example: 2026-07-15T00:00:00.000Z
 *         end_date:
 *           type: string
 *           format: date-time
 *           example: 2026-10-15T00:00:00.000Z
 *         max_members:
 *           type: integer
 *           example: 8
 *         status:
 *           type: string
 *           example: active
 *         admin:
 *           $ref: '#/components/schemas/ProjectAdminSummary'
 *         total_members:
 *           type: integer
 *           example: 5
 *         total_tasks:
 *           type: integer
 *           example: 3
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2026-06-10T10:00:00.000Z
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: 2026-06-10T10:00:00.000Z
 *     ProjectMemberUser:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         full_name:
 *           type: string
 *           example: Rafi Athallah
 *         email:
 *           type: string
 *           example: rafi@student.com
 *         professional_bio:
 *           type: string
 *           nullable: true
 *           example: Backend developer intern
 *         position:
 *           type: string
 *           nullable: true
 *           example: Web Developer
 *         kelompok_peminatan:
 *           type: string
 *           nullable: true
 *           example: Software Engineering
 *     ProjectMemberItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         id_user:
 *           type: integer
 *           example: 1
 *         status:
 *           type: string
 *           example: active
 *         user:
 *           $ref: '#/components/schemas/ProjectMemberUser'
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2026-06-10T10:00:00.000Z
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: 2026-06-10T10:00:00.000Z
 *     ProjectTaskItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Database Setup
 *         description:
 *           type: string
 *           example: Setup database schema and write initial seed script.
 *         deadline_at:
 *           type: string
 *           format: date-time
 *           example: 2026-08-01T00:00:00.000Z
 *         submission_type:
 *           type: string
 *           enum: [file_upload, url_link]
 *           example: url_link
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2026-06-10T10:00:00.000Z
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: 2026-06-10T10:00:00.000Z
 *     ProjectDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/ProjectListItem'
 *         - type: object
 *           properties:
 *             members:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProjectMemberItem'
 *             tasks:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProjectTaskItem'
 *     ProjectListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProjectListItem'
 *         message:
 *           type: string
 *           example: Projects retrieved successfully
 *         code:
 *           type: integer
 *           example: 200
 *     ProjectDetailResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/ProjectDetail'
 *         message:
 *           type: string
 *           example: Project detail retrieved successfully
 *         code:
 *           type: integer
 *           example: 200
 *     InternListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Rafi Athallah
 *         email:
 *           type: string
 *           example: rafi@student.com
 *         projectName:
 *           type: string
 *           example: Internify Platform Dev
 *         projectId:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         role:
 *           type: string
 *           example: Web Developer
 *         isAssignedByMentor:
 *           type: boolean
 *           example: true
 *         avatar:
 *           type: string
 *           nullable: true
 *           example: null
 *     InternListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InternListItem'
 *         message:
 *           type: string
 *           example: Interns retrieved successfully
 *         code:
 *           type: integer
 *           example: 200
 *     MyTaskItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         id_project:
 *           type: integer
 *           example: 1
 *         project_name:
 *           type: string
 *           example: Internify Platform Dev
 *         project_icon:
 *           type: string
 *           example: code
 *         title:
 *           type: string
 *           example: Database Setup
 *         description:
 *           type: string
 *           example: Setup database schema and write initial seed script.
 *         deadline_at:
 *           type: string
 *           format: date-time
 *           example: 2026-08-01T00:00:00.000Z
 *         submission_type:
 *           type: string
 *           enum: [file_upload, url_link]
 *           example: url_link
 *         submission_status:
 *           type: string
 *           enum: [submitted, not_submitted]
 *           example: submitted
 *         submission_details:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             file_path:
 *               type: string
 *               nullable: true
 *               example: null
 *             url_link:
 *               type: string
 *               nullable: true
 *               example: https://github.com/rafiathallah3
 *             submitted_at:
 *               type: string
 *               format: date-time
 *               example: 2026-07-20T10:00:00.000Z
 *             updated_at:
 *               type: string
 *               format: date-time
 *               example: 2026-07-20T10:00:00.000Z
 *     MyTaskListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MyTaskItem'
 *         message:
 *           type: string
 *           example: Intern tasks retrieved successfully
 *         code:
 *           type: integer
 *           example: 200
 *     AssignMemberResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             id_project:
 *               type: integer
 *               example: 1
 *             id_user:
 *               type: integer
 *               example: 2
 *             status:
 *               type: string
 *               example: active
 *             created_at:
 *               type: string
 *               format: date-time
 *               example: 2026-06-10T10:00:00.000Z
 *             updated_at:
 *               type: string
 *               format: date-time
 *               example: 2026-06-10T10:00:00.000Z
 *         message:
 *           type: string
 *           example: Member assigned successfully
 *         code:
 *           type: integer
 *           example: 200
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: false
 *         data:
 *           nullable: true
 *           example: null
 *         message:
 *           type: string
 *           example: Validation error
 *         code:
 *           type: integer
 *           example: 417
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectDetailResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectListResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectDetailResponse'
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
 *           example:
 *             project_icon: cloud
 *             project_name: Internify LMS Updated
 *             description: Updated project description
 *             start_date: 2026-06-15
 *             end_date: 2026-08-20
 *             status: completed
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectDetailResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectDetailResponse'
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

/**
 * @swagger
 * /project-api/my-projects:
 *   get:
 *     summary: Get intern's active projects
 *     description: Retrieve all active projects where the logged-in intern is a member.
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Intern projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Only for interns)
 *       500:
 *         description: Internal server error
 */
router.get('/my-projects', verifyJWT, projectController.getMyProjects);

/**
 * @swagger
 * /project-api/my-tasks:
 *   get:
 *     summary: Get intern's tasks and submission statuses
 *     description: Retrieve all tasks from all projects where the logged-in intern is an active member, including their specific submission detail/status.
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Intern tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MyTaskListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Only for interns)
 *       500:
 *         description: Internal server error
 */
router.get('/my-tasks', verifyJWT, projectController.getMyTasks);

/**
 * @swagger
 * /project-api/mentor-projects:
 *   get:
 *     summary: Get projects created by mentor
 *     description: Retrieve all projects created by the logged-in admin/mentor.
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mentor projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Only for mentors)
 *       500:
 *         description: Internal server error
 */
router.get('/mentor-projects', verifyJWT, isAdmin, projectController.getMentorProjects);

/**
 * @swagger
 * /project-api/interns:
 *   get:
 *     summary: Get all interns details
 *     description: Retrieve details for all active interns, including their current assigned project and project role. Accessible only by admin/mentor.
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Interns details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Interns retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Rafi Athallah"
 *                       email:
 *                         type: string
 *                         example: "rafi@student.com"
 *                       projectName:
 *                         type: string
 *                         example: "Internify Platform Dev"
 *                       role:
 *                         type: string
 *                         example: "Web Developer"
 *                       isAssignedByMentor:
 *                         type: boolean
 *                         example: true
 *                       avatar:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Only for admin/mentors)
 *       500:
 *         description: Internal server error
 */
router.get('/interns', verifyJWT, isAdmin, projectController.getInterns);

/**
 * @swagger
 * /project-api/assign-member:
 *   post:
 *     summary: Assign an intern to a project
 *     description: Assigns an intern to a project by project ID and user ID. Only accessible by mentor/admin.
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_project
 *               - id_user
 *             properties:
 *               id_project:
 *                 type: integer
 *                 example: 1
 *               id_user:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Member assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssignMemberResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Only for admin/mentors)
 *       404:
 *         description: Project or User not found
 *       409:
 *         description: Conflict (User is already an active member of this project)
 *       500:
 *         description: Internal server error
 */
router.post('/assign-member', verifyJWT, isAdmin, projectController.assignMember);

module.exports = router;
