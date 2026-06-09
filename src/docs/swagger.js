const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const path = require('path');

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Internify by HUMIC Engineering APIs",
      version: "1.2.0",
      description: "Comprehensive REST API for managing internship applications, job postings, partnerships, and feedback for the Internify web application. This API provides endpoints for admin management, authentication, internship vacancy management, application processing, student data, partnerships, research results, FAQs, feedback, and batch management. Created by Ramadhana & Yohanes",
      contact: {
        name: "HUMIC Engineering",
        url: "https://humic.dev"
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://internify-ruddy.vercel.app/'
          : `http://localhost:${process.env.EXPRESS_PORT || 9000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    tags: [
      {
        name: "Auth",
        description: "Authentication endpoints for admin login and profile retrieval"
      },
      {
        name: "Admin",
        description: "Admin account management endpoints"
      },
      {
        name: "Batch",
        description: "Batch management for organizing internship cohorts"
      },
      {
        name: "Lowongan Magang",
        description: "Internship vacancy/job posting management endpoints"
      },
      {
        name: "Lamaran Magang",
        description: "Internship application management and statistics endpoints"
      },
      {
        name: "Mahasiswa",
        description: "Student data management endpoints"
      },
      {
        name: "Partnership",
        description: "Partner organization management endpoints"
      },
      {
        name: "Hasil Research",
        description: "Internship research results and project showcase endpoints"
      },
      {
        name: "FAQ",
        description: "Frequently Asked Questions management endpoints"
      },
      {
        name: "Feedback",
        description: "Internship feedback and testimonial management endpoints"
      },
      {
        name: "Project",
        description: "Internify LMS project management endpoints"
      },
      {
        name: "Task",
        description: "Managing project tasks and intern submissions"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtained from the /auth-api/login endpoint"
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Unauthorized access"
                  }
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: "User does not have permission to access this resource",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Access denied: Admin only"
                  }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: "The requested resource was not found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Resource not found"
                  }
                }
              }
            }
          }
        },
        ValidationError: {
          description: "Request validation failed",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Validation error"
                  },
                  errors: {
                    type: "array",
                    items: {
                      type: "string"
                    }
                  }
                }
              }
            }
          }
        },
        InternalServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Internal server error"
                  }
                }
              }
            }
          }
        }
      }
    },
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.js'),
  ],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

const setupSwaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger UI available at /api-docs");
};

module.exports = setupSwaggerDocs;
