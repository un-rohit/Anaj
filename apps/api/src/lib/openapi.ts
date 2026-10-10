export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'ANAJ — Agricultural Procurement Platform API',
    version: '1.0.0',
    description:
      'Backend REST API for ANAJ agricultural procurement platform connecting farmers with NK.PATEL / ANAJ company.',
    contact: {
      name: 'ANAJ Support',
      email: 'anajsellkishan01@gamil.com',
      phone: '7061654008',
    },
  },
  servers: [
    {
      url: 'http://localhost:4000/api/v1',
      description: 'Local Development Server',
    },
  ],
  paths: {
    '/auth/farmer/send-otp': {
      post: {
        summary: 'Request OTP for farmer mobile number',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone'],
                properties: {
                  phone: { type: 'string', example: '9876543210' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'OTP dispatched successfully' },
          '429': { description: 'Rate limit exceeded' },
        },
      },
    },
    '/auth/farmer/verify-otp': {
      post: {
        summary: 'Verify OTP and issue session tokens',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone', 'otp'],
                properties: {
                  phone: { type: 'string', example: '9876543210' },
                  otp: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Authenticated successfully' },
          '400': { description: 'Invalid or expired OTP' },
        },
      },
    },
    '/auth/staff/login': {
      post: {
        summary: 'Authenticate staff user with email/phone and password',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['identifier', 'password'],
                properties: {
                  identifier: { type: 'string', example: '9000000001' },
                  password: { type: 'string', example: 'Dev@anaj2024!' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Staff authenticated' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/products': {
      get: {
        summary: 'List products open for procurement with active rates and translations',
        tags: ['Products'],
        parameters: [
          { name: 'lang', in: 'query', schema: { type: 'string', enum: ['HI', 'EN'] } },
        ],
        responses: {
          '200': { description: 'List of agricultural products' },
        },
      },
    },
    '/purchase-rates/active': {
      get: {
        summary: 'Get current active procurement rates per quintal',
        tags: ['Purchase Rates'],
        responses: {
          '200': { description: 'List of active purchase rates' },
        },
      },
    },
    '/sell-requests': {
      post: {
        summary: 'Farmer creates a sell request',
        tags: ['Sell Requests'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId', 'quantity', 'unit', 'collectionAddress'],
                properties: {
                  productId: { type: 'string', format: 'uuid' },
                  quantity: { type: 'string', example: '25.5' },
                  unit: { type: 'string', enum: ['KG', 'QUINTAL'] },
                  collectionAddress: { type: 'string', example: 'Village Rampur, Siwan' },
                  preferredCollectionDate: { type: 'string', format: 'date-time' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Sell request created' },
        },
      },
      get: {
        summary: 'Staff list all sell requests with filters',
        tags: ['Sell Requests'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          '200': { description: 'Paginated sell requests' },
        },
      },
    },
    '/dashboard/stats': {
      get: {
        summary: 'Fetch live procurement dashboard metrics',
        tags: ['Dashboard'],
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Live dashboard statistics' },
        },
      },
    },
    '/company/public': {
      get: {
        summary: 'Get public company contacts and address',
        tags: ['Company'],
        responses: {
          '200': { description: 'Company public information' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};
