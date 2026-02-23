import config from './config.js';

const swaggerDefinition = {
    openapi: '3.0.3',
    info: {
        title: 'OakNGlass Backend API',
        version: '1.0.0',
        description: 'OpenAPI documentation for the OakNGlass backend (manually written).',
    },
    servers: [
        {
            url: config.backend.domain(),
            description: 'Current server',
        },
    ],
    tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Products', description: 'Product management' },
        { name: 'Favourites', description: 'User favourites' },
        { name: 'Order', description: 'Ordering endpoints' },
        { name: 'Promote', description: 'Promotion endpoints (invite based)' },
        { name: 'Blogs', description: 'Blogs and reviews' },
        { name: 'Health', description: 'Health check' }
    ],
    components: {
        securitySchemes: {
            cookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'auth',
                description: 'Session cookie used for protected routes'
            }
        },
        schemas: {
            // Auth
            RegisterRequest: {
                type: 'object',
                required: ['email', 'password', 'birthdate', 'address'],
                anyOf: [
                    { required: ['fullname'] },
                    { required: ['fullName'] },
                    { required: ['name'] }
                ],
                properties: {
                    email: { type: 'string', format: 'email', example: 'user@example.com' },
                    password: { type: 'string', example: 'strongPassword123' },
                    fullname: { type: 'string', example: 'John Doe', description: 'Accepted as full name. The API also accepts `fullName` or `name` as aliases.' },
                    fullName: { type: 'string', example: 'John Doe', description: 'Alias for fullname' },
                    name: { type: 'string', example: 'John Doe', description: 'Alias for fullname' },
                    mobile: { type: 'string', example: '+3612345678' },
                    birthdate: { type: 'string', format: 'date', example: '1990-01-01', description: 'Required. ISO date string YYYY-MM-DD' },
                    address: { type: 'string', description: 'Required. Full postal address' },
                    emailSubscribe: { type: 'boolean', default: true, description: 'Optional, defaults to true when omitted' }
                }
            },
            LoginRequest: {
                type: 'object',
                required: ['identifier', 'password'],
                properties: {
                    identifier: { type: 'string', description: 'email or username', example: 'user@example.com' },
                    password: { type: 'string', example: 'strongPassword123' }
                }
            },
            MessageResponse: { type: 'object', properties: { message: { type: 'string' } } },
            ErrorResponse: { type: 'object', properties: { error: { type: 'string' } } },

            // Products
            CreateProductMultipart: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    alcoholPerc: { type: 'number', example: 5.0 },
                    contentML: { type: 'integer', example: 500 },
                    priceHUF: { type: 'integer', example: 1299 },
                    Stock: { type: 'integer', example: 10 },
                    images: { type: 'array', items: { type: 'string', format: 'binary' } }
                }
            },
            ProductListResponse: {
                type: 'object',
                properties: {
                    products: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                ProdID: { type: 'integer' },
                                name: { type: 'string' },
                                alcoholPercent: { type: 'number' },
                                contentML: { type: 'integer' },
                                priceHUF: { type: 'integer' },
                                stock: { type: 'integer' },
                                createdAt: { type: 'string', format: 'date-time' },
                                images: { type: 'array', items: { type: 'string' } }
                            }
                        }
                    },
                    pagination: {
                        type: 'object',
                        properties: {
                            totalItems: { type: 'integer' },
                            totalPages: { type: 'integer' },
                            currentPage: { type: 'integer' },
                            itemsPerPage: { type: 'integer' }
                        }
                    }
                }
            },

            // Order
            PlaceOrderRequest: {
                type: 'object',
                required: ['shipmentAddress', 'products'],
                properties: {
                    shipmentAddress: { type: 'string', example: 'Main St 1, 1000 City' },
                    products: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['productId', 'quantity'],
                            properties: {
                                productId: { type: 'integer', example: 123 },
                                quantity: { type: 'integer', example: 2 }
                            }
                        }
                    }
                }
            },

            // Blogs
            CreateBlogRequest: {
                type: 'object',
                required: ['title', 'content'],
                properties: {
                    title: { type: 'string', minLength: 5, maxLength: 100 },
                    content: { type: 'string', minLength: 20, maxLength: 600 }
                }
            }
        }
    },
    paths: {
        '/api/health': {
            get: {
                tags: ['Health'],
                summary: 'Health check',
                responses: {
                    200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' } } } } } }
                }
            }
        },

        // Auth
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register a new user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RegisterRequest' },
                            example: {
                                email: 'user@example.com',
                                password: 'StrongPassword123!',
                                fullname: 'John Doe',
                                birthdate: '1990-01-01',
                                address: 'Main Street 1, 1000 City',
                                mobile: '+36123456789',
                                emailSubscribe: true
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'User created', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
                    400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login with credentials',
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
                responses: {
                    200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/auth/logout': {
            post: {
                tags: ['Auth'],
                summary: 'Logout (clears cookie)',
                security: [{ cookieAuth: [] }],
                responses: { 200: { description: 'Logged out', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } } }
            }
        },
        '/api/auth/verify': {
            post: {
                tags: ['Auth'],
                summary: 'Verify account (e.g., email verify)',
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { code: { type: 'string' } } } } } },
                responses: { 200: { description: 'Verified', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } } }
            }
        },

        '/api/auth/reset-password': {
            post: {
                tags: ['Auth'],
                summary: 'Request password reset (sends email)',
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string', format: 'email' } }, required: ['email'] } } } },
                responses: { 200: { description: 'Email sent', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } } }
            }
        },

        // Promote (query params)
        '/api/promote/journalist': {
            post: {
                tags: ['Promote'],
                summary: 'Promote invited user to journalist (requires code and email query params)',
                parameters: [
                    { in: 'query', name: 'code', required: true, schema: { type: 'string' }, description: 'Invitation code' },
                    { in: 'query', name: 'email', required: true, schema: { type: 'string', format: 'email' }, description: 'URL encoded email used for the invite' }
                ],
                responses: { 200: { description: 'Promoted', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } }, 400: { description: 'Invalid invite', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } } }
            }
        },
        '/api/promote/admin': {
            post: {
                tags: ['Promote'],
                summary: 'Promote invited user to admin (requires code and email query params)',
                parameters: [
                    { in: 'query', name: 'code', required: true, schema: { type: 'string' } },
                    { in: 'query', name: 'email', required: true, schema: { type: 'string', format: 'email' } }
                ],
                responses: { 200: { description: 'Promoted', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } } }
            }
        },

        // Products
        '/api/products': {
            get: {
                tags: ['Products'],
                summary: 'List products (supports paging, filtering and sorting)',
                parameters: [
                    { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
                    { in: 'query', name: 'limit', schema: { type: 'integer', default: 12 } },
                    { in: 'query', name: 'sortby', schema: { type: 'string' }, description: 'alphabetical|price|newest|alcoholperc|contentml|stock' },
                    { in: 'query', name: 'sortorder', schema: { type: 'string' }, description: 'asc|desc' },
                    { in: 'query', name: 'minprice', schema: { type: 'number' } },
                    { in: 'query', name: 'maxprice', schema: { type: 'number' } },
                    { in: 'query', name: 'minstock', schema: { type: 'integer' } },
                    { in: 'query', name: 'maxstock', schema: { type: 'integer' } },
                    { in: 'query', name: 'minalcohol', schema: { type: 'number' } },
                    { in: 'query', name: 'maxalcohol', schema: { type: 'number' } },
                    { in: 'query', name: 'mincontent', schema: { type: 'integer' } },
                    { in: 'query', name: 'maxcontent', schema: { type: 'integer' } },
                    { in: 'query', name: 'search', schema: { type: 'string' } }
                ],
                responses: { 200: { description: 'Product list', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductListResponse' } } } } }
            },
            post: {
                tags: ['Products'],
                summary: 'Create a product (admin only). Multipart/form-data with images',
                security: [{ cookieAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: { $ref: '#/components/schemas/CreateProductMultipart' }
                        }
                    }
                },
                responses: { 201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } }, 400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } } }
            }
        },
        '/api/products/{id}': {
            patch: {
                tags: ['Products'],
                summary: 'Patch a product by id (admin only)',
                security: [{ cookieAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Product UUID (string)' }],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
                responses: { 200: { description: 'Patched', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } } }
            },
            delete: {
                tags: ['Products'],
                summary: 'Delete a product by id (admin only)',
                security: [{ cookieAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } } }
            }
        },

        // Favourites
        '/api/favourites': {
            get: {
                tags: ['Favourites'],
                summary: 'Get user favourites (authenticated)',
                security: [{ cookieAuth: [] }],
                responses: { 200: { description: 'List', content: { 'application/json': { schema: { type: 'array', items: { type: 'object' } } } } } }
            }
        },
        '/api/favourites/{productID}': {
            post: {
                tags: ['Favourites'],
                summary: 'Add product to favourites',
                security: [{ cookieAuth: [] }],
                parameters: [{ in: 'path', name: 'productID', required: true, schema: { type: 'integer' } }],
                responses: { 200: { description: 'Added', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } } }
            },
            delete: {
                tags: ['Favourites'],
                summary: 'Remove product from favourites',
                security: [{ cookieAuth: [] }],
                parameters: [{ in: 'path', name: 'productID', required: true, schema: { type: 'integer' } }],
                responses: { 200: { description: 'Removed', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } } }
            }
        },

        // Order
        '/api/order': {
            post: {
                tags: ['Order'],
                summary: 'Place an order (authenticated)',
                security: [{ cookieAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PlaceOrderRequest' } } } },
                responses: { 201: { description: 'Order placed', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } }, 400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } } }
            },
            get: {
                tags: ['Order'],
                summary: 'Not used (root) - use /my-orders or /:id'
            }
        },
        '/api/order/my-orders': {
            get: { tags: ['Order'], summary: 'Get my orders (authenticated)', security: [{ cookieAuth: [] }], responses: { 200: { description: 'List orders' } } }
        },
        '/api/order/{id}': {
            get: {
                tags: ['Order'],
                summary: 'Get order details (authenticated)',
                security: [{ cookieAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Order details' }, 400: { description: 'Invalid id' } }
            }
        },

        // Blogs
        '/api/blogs': {
            get: { tags: ['Blogs'], summary: 'List blogs' },
            post: {
                tags: ['Blogs'],
                summary: 'Create a blog (journalist)',
                security: [{ cookieAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateBlogRequest' } } } },
                responses: { 201: { description: 'Created' }, 400: { description: 'Validation error' } }
            }
        },
        '/api/blogs/{id}': {
            put: {
                tags: ['Blogs'],
                summary: 'Update blog (journalist)',
                security: [{ cookieAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateBlogRequest' } } } },
                responses: { 200: { description: 'Updated' }, 400: { description: 'Validation error' } }
            },
            delete: { tags: ['Blogs'], summary: 'Delete blog (journalist)', security: [{ cookieAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Deleted' } } }
        }

    }
};

const swaggerSpec = swaggerDefinition;

export default swaggerSpec;
