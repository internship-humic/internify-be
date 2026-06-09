const express = require('express');
const { taskController } = require('../modules/task');
const { verifyJWT } = require('../middleware/verifyJWT');
const isAdmin = require('../middleware/isAdmin');
const {
  taskUpload,
  taskUploadErrorHandler,
} = require('../modules/task/helpers/taskUpload.helper');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         id_project:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Laporan Tugas 2
 *         description:
 *           type: string
 *           example: Berisi design UI/UX dan user flow dari aplikasi Internify.
 *         deadline_at:
 *           type: string
 *           format: date-time
 *           example: 2026-05-28T23:59:00.000Z
 *         submission_type:
 *           type: string
 *           enum: [file_upload, url_link]
 *           example: file_upload
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2026-06-09T10:00:00.000Z
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: 2026-06-09T10:00:00.000Z
 *
 *     TaskCreateRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - deadline_date
 *         - specific_time
 *         - submission_type
 *       properties:
 *         title:
 *           type: string
 *           example: Laporan Tugas 2
 *         description:
 *           type: string
 *           example: Berisi design UI/UX dan user flow dari aplikasi Internify.
 *         deadline_date:
 *           type: string
 *           format: date
 *           example: 2026-05-28
 *         specific_time:
 *           type: string
 *           example: "23:59"
 *         submission_type:
 *           type: string
 *           enum: [file_upload, url_link]
 *           example: file_upload
 *
 *     TaskUpdateRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: Laporan Tugas 2 Updated
 *         description:
 *           type: string
 *           example: Updated task description.
 *         deadline_date:
 *           type: string
 *           format: date
 *           example: 2026-05-30
 *         specific_time:
 *           type: string
 *           example: "23:59"
 *         submission_type:
 *           type: string
 *           enum: [file_upload, url_link]
 *           example: url_link
 *
 *     TaskSubmission:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         id_task:
 *           type: integer
 *           example: 1
 *         id_user:
 *           type: integer
 *           example: 2
 *         file_path:
 *           type: string
 *           nullable: true
 *           example: /uploads/task-submissions/report.pdf
 *         url_link:
 *           type: string
 *           nullable: true
 *           example: https://drive.google.com/file/example
 *         submitted_at:
 *           type: string
 *           format: date-time
 *           example: 2026-06-09T10:00:00.000Z
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: 2026-06-09T10:00:00.000Z
 *
 *     InternTaskItem:
 *       allOf:
 *         - $ref: '#/components/schemas/Task'
 *         - type: object
 *           properties:
 *             display_status:
 *               type: string
 *               enum: [pending, done, overdue]
 *               example: pending
 *             my_submission:
 *               nullable: true
 *               $ref: '#/components/schemas/TaskSubmission'
 *
 *     AdminTaskItem:
 *       allOf:
 *         - $ref: '#/components/schemas/Task'
 *         - type: object
 *           properties:
 *             total_members:
 *               type: integer
 *               example: 8
 *             total_submissions:
 *               type: integer
 *               example: 5
 *
 *     AdminTaskSubmissionItem:
 *       type: object
 *       properties:
 *         id_user:
 *           type: integer
 *           example: 1
 *         full_name:
 *           type: string
 *           example: Alex Rivera
 *         email:
 *           type: string
 *           example: alex.rivera@example.com
 *         profile_picture:
 *           type: string
 *           nullable: true
 *           example: null
 *         professional_bio:
 *           type: string
 *           nullable: true
 *           example: Backend developer intern
 *         submitted_at:
 *           type: string
 *           nullable: true
 *           format: date-time
 *           example: 2026-05-25T10:00:00.000Z
 *         display_status:
 *           type: string
 *           enum: [pending, done, overdue]
 *           example: done
 *         submission:
 *           nullable: true
 *           $ref: '#/components/schemas/TaskSubmission'
 *
 *     AdminTaskDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Task'
 *         - type: object
 *           properties:
 *             project:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 project_name:
 *                   type: string
 *                   example: Internify Project
 *                 project_icon:
 *                   type: string
 *                   example: code
 *             submission_summary:
 *               type: object
 *               properties:
 *                 total_members:
 *                   type: integer
 *                   example: 8
 *                 total_submitted:
 *                   type: integer
 *                   example: 5
 *                 total_done:
 *                   type: integer
 *                   example: 4
 *                 total_pending:
 *                   type: integer
 *                   example: 3
 *                 total_overdue:
 *                   type: integer
 *                   example: 1
 *             submissions:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminTaskSubmissionItem'
 *
 *     InternTaskDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Task'
 *         - type: object
 *           properties:
 *             project:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 project_name:
 *                   type: string
 *                   example: Internify Project
 *                 project_icon:
 *                   type: string
 *                   example: code
 *             display_status:
 *               type: string
 *               enum: [pending, done, overdue]
 *               example: pending
 *             my_submission:
 *               nullable: true
 *               $ref: '#/components/schemas/TaskSubmission'
 *
 *     TaskResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Task'
 *         message:
 *           type: string
 *           example: Task created successfully
 *         code:
 *           type: integer
 *           example: 201
 *
 *     TaskListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Task'
 *         message:
 *           type: string
 *           example: Tasks retrieved successfully
 *         code:
 *           type: integer
 *           example: 200
 *
 *     AdminTaskDetailResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/AdminTaskDetail'
 *         message:
 *           type: string
 *           example: Task detail retrieved successfully
 *         code:
 *           type: integer
 *           example: 200
 *
 *     InternTaskDetailResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/InternTaskDetail'
 *         message:
 *           type: string
 *           example: Task detail retrieved successfully
 *         code:
 *           type: integer
 *           example: 200
 *
 *     TaskSubmissionResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/TaskSubmission'
 *         message:
 *           type: string
 *           example: Task submitted successfully
 *         code:
 *           type: integer
 *           example: 200
 *
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
 * /task-api/projects/{id_project}/tasks:
 *   post:
 *     summary: Create task in project
 *     description: Create a new task inside a project. Only admin can access this endpoint.
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_project
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskCreateRequest'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
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
router.post('/projects/:id_project/tasks', verifyJWT, isAdmin, taskController.createTask);

/**
 * @swagger
 * /task-api/projects/{id_project}/tasks:
 *   get:
 *     summary: Get project tasks
 *     description: Get all tasks from a project. Admin can access any project task list. Intern can only access tasks from their active project.
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_project
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.get('/projects/:id_project/tasks', verifyJWT, taskController.getTasksByProject);

/**
 * @swagger
 * /task-api/tasks/{id}:
 *   get:
 *     summary: Get task detail
 *     description: Get task detail. Admin receives all intern submissions. Intern receives only their own submission.
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Task detail retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.get('/tasks/:id', verifyJWT, taskController.getTaskById);

/**
 * @swagger
 * /task-api/tasks/{id}:
 *   patch:
 *     summary: Update task
 *     description: Update task information. Submission type cannot be changed if the task already has submissions. Only admin can access this endpoint.
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdateRequest'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       409:
 *         description: Submission type cannot be changed because this task already has submissions
 *       417:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.patch('/tasks/:id', verifyJWT, isAdmin, taskController.updateTask);

/**
 * @swagger
 * /task-api/tasks/{id}:
 *   delete:
 *     summary: Delete task
 *     description: Delete task only if it does not have submissions. Only admin can access this endpoint.
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       409:
 *         description: Task already has submissions and cannot be deleted
 *       500:
 *         description: Internal server error
 */
router.delete('/tasks/:id', verifyJWT, isAdmin, taskController.deleteTask);

/**
 * @swagger
 * /task-api/tasks/{id}/submissions:
 *   post:
 *     summary: Submit task
 *     description: Submit a task as an intern. For file_upload tasks, send submission_file. For url_link tasks, send url_link.
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *         example: 1
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               submission_file:
 *                 type: string
 *                 format: binary
 *                 description: Required when task submission_type is file_upload. Allowed file types are PDF. Max size is 10MB.
 *               url_link:
 *                 type: string
 *                 format: uri
 *                 description: Required when task submission_type is url_link.
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url_link:
 *                 type: string
 *                 format: uri
 *                 example: https://drive.google.com/file/example
 *     responses:
 *       200:
 *         description: Task submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskSubmissionResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       417:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post(
  '/tasks/:id/submissions',
  verifyJWT,
  taskUpload.single('submission_file'),
  taskUploadErrorHandler,
  taskController.submitTask
);

module.exports = router;
