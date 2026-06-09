const express = require('express');
const { certificateController } = require('../modules/certificate');
const { verifyJWT } = require('../middleware/verifyJWT');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Certificate:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         id_project:
 *           type: integer
 *           example: 2
 *         id_user:
 *           type: integer
 *           example: 5
 *         certificate_no:
 *           type: string
 *           example: "CERT/20260609/PRJ2/USR5"
 *         issued_at:
 *           type: string
 *           format: date-time
 *           example: "2026-06-09T14:00:00.000Z"
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 5
 *             full_name:
 *               type: string
 *               example: "Rafi Athallah"
 *             email:
 *               type: string
 *               example: "rafi@student.com"
 *         project:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 2
 *             project_name:
 *               type: string
 *               example: "Internify Platform Dev"
 *             description:
 *               type: string
 *               example: "Project to develop features of the Internify web app"
 *     CertificateClaimRequest:
 *       type: object
 *       required:
 *         - id_project
 *       properties:
 *         id_project:
 *           type: integer
 *           example: 2
 */

/**
 * @swagger
 * /certificate-api/claim:
 *   post:
 *     summary: Claim certificate for a completed project
 *     description: Interns can claim a certificate for a project once they have submitted all assigned tasks.
 *     tags: [Certificate]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CertificateClaimRequest'
 *     responses:
 *       201:
 *         description: Certificate claimed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Certificate'
 *                 message:
 *                   type: string
 *                   example: "Certificate claimed successfully"
 *                 code:
 *                   type: integer
 *                   example: 201
 *       400:
 *         description: Bad request (no tasks assigned or not all tasks submitted)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (only interns can claim, or not a member of project)
 *       404:
 *         description: Project not found
 *       409:
 *         description: Conflict (certificate already claimed)
 *       500:
 *         description: Internal server error
 */
router.post('/claim', verifyJWT, certificateController.claimCertificate);

/**
 * @swagger
 * /certificate-api/my-certificates:
 *   get:
 *     summary: Get logged-in intern's certificates
 *     description: Retrieve all certificates earned by the currently logged-in intern.
 *     tags: [Certificate]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Certificates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Certificate'
 *                 message:
 *                   type: string
 *                   example: "Certificates retrieved successfully"
 *                 code:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (only interns can access this)
 *       500:
 *         description: Internal server error
 */
router.get('/my-certificates', verifyJWT, certificateController.getMyCertificates);

/**
 * @swagger
 * /certificate-api/all:
 *   get:
 *     summary: Get all issued certificates (Admin only)
 *     description: Admin/Mentor can retrieve all certificates issued across the system.
 *     tags: [Certificate]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All certificates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Certificate'
 *                 message:
 *                   type: string
 *                   example: "All certificates retrieved successfully"
 *                 code:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       500:
 *         description: Internal server error
 */
router.get('/all', verifyJWT, isAdmin, certificateController.getAllCertificates);

/**
 * @swagger
 * /certificate-api/detail/{id}:
 *   get:
 *     summary: Get certificate detail
 *     description: Fetch detailed information for a certificate by its ID. Interns can only access their own. Admins can access any.
 *     tags: [Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Certificate ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Certificate details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Certificate'
 *                 message:
 *                   type: string
 *                   example: "Certificate details retrieved successfully"
 *                 code:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Accessing another user's certificate)
 *       404:
 *         description: Certificate not found
 *       500:
 *         description: Internal server error
 */
router.get('/detail/:id', verifyJWT, certificateController.getCertificateDetail);

/**
 * @swagger
 * /certificate-api/project/{id_project}:
 *   get:
 *     summary: Get certificates issued for a specific project (Admin only)
 *     description: Admin/Mentor can retrieve all certificates issued to interns for a specific project.
 *     tags: [Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_project
 *         schema:
 *           type: integer
 *         required: true
 *         description: Project ID
 *         example: 2
 *     responses:
 *       200:
 *         description: Project certificates retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       500:
 *         description: Internal server error
 */
router.get('/project/:id_project', verifyJWT, isAdmin, certificateController.getProjectCertificates);

/**
 * @swagger
 * /certificate-api/verify:
 *   get:
 *     summary: Verify a certificate (Public)
 *     description: Verify the validity of a certificate number publicly without authentication.
 *     tags: [Certificate]
 *     parameters:
 *       - in: query
 *         name: certificate_no
 *         schema:
 *           type: string
 *         required: true
 *         description: The certificate number to verify
 *         example: "CERT/20260609/PRJ2/USR5"
 *     responses:
 *       200:
 *         description: Certificate is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Certificate'
 *                 message:
 *                   type: string
 *                   example: "Certificate validated successfully"
 *                 code:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Bad request (missing certificate number)
 *       404:
 *         description: Certificate not found or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/verify', certificateController.verifyCertificate);

/**
 * @swagger
 * /certificate-api/verify-uuid/{uuid}:
 *   get:
 *     summary: Verify a certificate by UUID (Public)
 *     description: Verify the validity of a certificate by its unique UUID for the frontend. Returns intern's name, creation date, and UUID.
 *     tags: [Certificate]
 *     parameters:
 *       - in: path
 *         name: uuid
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The certificate UUID to verify
 *         example: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6"
 *     responses:
 *       200:
 *         description: Certificate is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     uuid:
 *                       type: string
 *                       example: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6"
 *                     intern_name:
 *                       type: string
 *                       example: "Rafi Athallah"
 *                     project_name:
 *                       type: string
 *                       example: "Internify Platform Dev"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-06-09T14:00:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "Certificate validated successfully"
 *                 code:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Bad request (missing UUID)
 *       404:
 *         description: Certificate not found or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/verify-uuid/:uuid', certificateController.verifyCertificateByUuid);

module.exports = router;
