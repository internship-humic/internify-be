import path from 'path';
import type { Application } from 'express';

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const port = process.env.PORT || '5000';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Internify LMS API - HUMIC Engineering',
            version: '1.0.0',
            description: 'Dokumentasi REST API Internify LMS untuk autentikasi, pengelolaan lowongan magang, lamaran, dan konten platform.',
            contact: {
                name: 'HUMIC Engineering',
                url: 'https://humic.telkomuniversity.ac.id/'
            }
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? 'https://your-production-domain.example.com'
                    : `http://localhost:${port}`,
                description: process.env.NODE_ENV === 'production'
                    ? 'Prod'
                    : 'Dev'
            }
        ],
        tags: [
            {
                name: 'Auth',
                description: 'Endpoint autentikasi untuk login admin/peserta dan profil pengguna.'
            },
            {
                name: 'Admin',
                description: 'Endpoint utilitas dan pengelolaan sistem yang terkait admin.'
            },
            {
                name: 'Batch',
                description: 'Endpoint pengelolaan batch/angkatan magang.'
            },
            {
                name: 'Lowongan Magang',
                description: 'Endpoint pengelolaan lowongan magang.'
            },
            {
                name: 'Lamaran Magang',
                description: 'Endpoint pengelolaan lamaran magang.'
            },
            {
                name: 'Mahasiswa',
                description: 'Endpoint pengelolaan data mahasiswa/peserta.'
            },
            {
                name: 'Partnership',
                description: 'Endpoint pengelolaan data mitra/partnership.'
            },
            {
                name: 'Hasil Research',
                description: 'Endpoint pengelolaan hasil research/proyek.'
            },
            {
                name: 'FAQ',
                description: 'Endpoint pengelolaan FAQ (pertanyaan yang sering diajukan).'
            },
            {
                name: 'Feedback',
                description: 'Endpoint pengelolaan feedback/testimoni peserta.'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Token JWT yang diperoleh dari endpoint /api/auth/login'
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Token akses tidak ada atau tidak valid',
                    content: {
                        'application/json': {
                            examples: {
                                tokenMissing: {
                                    value: {
                                        status: 'error',
                                        statusCode: 401,
                                        message: 'Not authorized to access this route, token is missing'
                                    }
                                },
                                tokenInvalid: {
                                    value: {
                                        status: 'error',
                                        statusCode: 401,
                                        message: 'Not authorized to access this route, token is invalid or expired'
                                    }
                                },
                                userNotExist: {
                                    value: {
                                        status: 'error',
                                        statusCode: 401,
                                        message: 'User belonging to this token no longer exists'
                                    }
                                }
                            }
                        }
                    }
                },
                ForbiddenError: {
                    description: 'Pengguna tidak memiliki izin untuk mengakses resource ini',
                    content: {
                        'application/json': {
                            example: {
                                status: 'error',
                                statusCode: 403,
                                message: 'You do not have permission to perform this action'
                            }
                        }
                    }
                },
                NotFoundError: {
                    description: 'Resource yang diminta tidak ditemukan',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: {
                                        type: 'string',
                                        example: 'error'
                                    },
                                    statusCode: {
                                        type: 'integer',
                                        example: 404
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'Not Found - /api/endpoint-yang-tidak-ada'
                                    }
                                }
                            }
                        }
                    }
                },
                ValidationError: {
                    description: 'Validasi request gagal',
                    content: {
                        'application/json': {
                            example: {
                                status: 'error',
                                statusCode: 400,
                                message: 'Mohon lengkapi semua field wajib yang diperlukan'
                            }
                        }
                    }
                },
                InternalServerError: {
                    description: 'Terjadi kesalahan pada server internal',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: {
                                        type: 'string',
                                        example: 'error'
                                    },
                                    statusCode: {
                                        type: 'integer',
                                        example: 500
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'Internal Server Error'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: [
        path.join(__dirname, '../app.ts').replace(/\\/g, '/'),
        path.join(__dirname, '../app.js').replace(/\\/g, '/'),
        path.join(__dirname, '../routes/*.ts').replace(/\\/g, '/'),
        path.join(__dirname, '../controllers/*.ts').replace(/\\/g, '/'),
        path.join(__dirname, '../routes/*.js').replace(/\\/g, '/'),
        path.join(__dirname, '../controllers/*.js').replace(/\\/g, '/')
    ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const setupSwaggerDocs = (app: Application) => {
    const swaggerEnabledValue = process.env.SWAGGER_ENABLE ?? process.env.SWAGGER_ENABLE ?? 'true';
    const isSwaggerEnabled = swaggerEnabledValue.toLowerCase() === 'true';
    if (!isSwaggerEnabled) {
        return;
    }

    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('Swagger UI available at /api/docs');
};

export default setupSwaggerDocs;
