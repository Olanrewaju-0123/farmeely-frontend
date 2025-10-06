const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Farmeely API",
      version: "1.0.0",
      description:
        "API documentation for Farmeely - A livestock investment platform",
      contact: {
        name: "Farmeely Team",
        email: "support@farmeely.com",
      },
    },
    servers: [
      {
        url: "http://localhost:2025",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "User unique identifier",
            },
            surname: {
              type: "string",
              description: "User surname",
            },
            othernames: {
              type: "string",
              description: "User other names",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            phoneNumber: {
              type: "string",
              description: "User phone number",
            },
            location: {
              type: "string",
              description: "User location",
            },
            address: {
              type: "string",
              description: "User address",
            },
            is_email_verified: {
              type: "boolean",
              description: "Email verification status",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Livestock: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Livestock unique identifier",
            },
            name: {
              type: "string",
              description: "Livestock name",
            },
            price: {
              type: "number",
              description: "Livestock price",
            },
            description: {
              type: "string",
              description: "Livestock description",
            },
            image: {
              type: "string",
              description: "Livestock image URL",
            },
            isActive: {
              type: "boolean",
              description: "Livestock availability status",
            },
          },
        },
        Group: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Group unique identifier",
            },
            name: {
              type: "string",
              description: "Group name",
            },
            description: {
              type: "string",
              description: "Group description",
            },
            livestockId: {
              type: "integer",
              description: "Associated livestock ID",
            },
            totalSlots: {
              type: "integer",
              description: "Total available slots",
            },
            filledSlots: {
              type: "integer",
              description: "Number of filled slots",
            },
            pricePerSlot: {
              type: "number",
              description: "Price per slot",
            },
            status: {
              type: "string",
              enum: ["active", "completed", "cancelled"],
              description: "Group status",
            },
            createdBy: {
              type: "string",
              format: "uuid",
              description: "User ID who created the group",
            },
          },
        },
        Wallet: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Wallet unique identifier",
            },
            userId: {
              type: "string",
              format: "uuid",
              description: "Owner user ID",
            },
            balance: {
              type: "number",
              description: "Wallet balance",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Transaction: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Transaction unique identifier",
            },
            userId: {
              type: "string",
              format: "uuid",
              description: "User ID",
            },
            type: {
              type: "string",
              enum: ["credit", "debit"],
              description: "Transaction type",
            },
            amount: {
              type: "number",
              description: "Transaction amount",
            },
            description: {
              type: "string",
              description: "Transaction description",
            },
            reference: {
              type: "string",
              description: "Payment reference",
            },
            status: {
              type: "string",
              enum: ["pending", "success", "failed"],
              description: "Transaction status",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "error",
            },
            message: {
              type: "string",
              description: "Error message",
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            message: {
              type: "string",
              description: "Success message",
            },
            data: {
              type: "object",
              description: "Response data",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js", "./index.js"], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = specs;
