const express = require("express");
const router = express.Router();
router.use((req, res, next) => {
  console.log("User Router: Request received for path:", req.path);
  next();
});
const {
  createUser,
  verifyEmail,
  resendOtp,
  login,
  updateUser,
  getUser,
  getAvailableLivestocks,
  startWalletFunding,
  completeWalletFunding,
  getWalletBalance,
  createLivestock,
  startForgotPassword,
  completeForgotPassword,
  startCreateGroup,
  completeCreateGroup,
  startJoinGroup,
  completeJoinGroup,
  getActiveGroups,
  getMyGroups,
  getWalletTransactions,
  getGroupDetails,
  getMyCreatedGroups,
  getMyJoinedGroups,
  deleteGroup,
} = require("../controllers/userCtrl");
const { authorization } = require("../middleware/authorisation");
const {
  enhancedAuthorization,
  refreshTokenMiddleware,
} = require("../middleware/refreshToken");
const { cacheConfigs } = require("../middleware/cache");

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Create a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - surname
 *               - othernames
 *               - email
 *               - password
 *               - phoneNumber
 *               - location
 *               - address
 *             properties:
 *               surname:
 *                 type: string
 *                 example: "Doe"
 *               othernames:
 *                 type: string
 *                 example: "John Smith"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348012345678"
 *               location:
 *                 type: string
 *                 example: "Lagos, Nigeria"
 *               address:
 *                 type: string
 *                 example: "123 Main Street, Lagos"
 *     responses:
 *       200:
 *         description: User created successfully, OTP sent to email
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
 *                   example: "An OTP has been sent to your email"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/users/signup", createUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     access_token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/users/login", login);

/**
 * @swagger
 * /users/verify-email/{email}/{otp}:
 *   post:
 *     summary: Verify user email with OTP
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         example: "john.doe@example.com"
 *       - in: path
 *         name: otp
 *         required: true
 *         schema:
 *           type: string
 *         example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/users/verify-email/:email/:otp", verifyEmail);

/**
 * @swagger
 * /users/resend-otp/{email}:
 *   post:
 *     summary: Resend OTP to user email
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         example: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: User not found or already verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/users/resend-otp/:email", resendOtp);

/**
 * @swagger
 * /users/forgot-password/{email}:
 *   post:
 *     summary: Start forgot password process
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         example: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: Reset OTP sent to email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/users/forgot-password/:email", startForgotPassword);

/**
 * @swagger
 * /users/complete:
 *   post:
 *     summary: Complete forgot password process
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/users/complete", completeForgotPassword);

/**
 * @swagger
 * /users/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
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
 *                   example: "Tokens refreshed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     expiresIn:
 *                       type: string
 *                       example: "15m"
 *       401:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/users/refresh-token", refreshTokenMiddleware);

/**
 * @swagger
 * /users/profile:
 *   post:
 *     summary: Update user profile
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               surname:
 *                 type: string
 *                 example: "Doe"
 *               othernames:
 *                 type: string
 *                 example: "John Smith"
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348012345678"
 *               location:
 *                 type: string
 *                 example: "Lagos, Nigeria"
 *               address:
 *                 type: string
 *                 example: "123 Main Street, Lagos"
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: "Profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/users/profile", authorization, updateUser);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/users/profile",
  authorization,
  cacheConfigs.userProfile(),
  getUser
);

/**
 * @swagger
 * /livestocks:
 *   get:
 *     summary: Get all available livestock
 *     tags: [Livestock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Livestock list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Livestock'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/livestocks",
  authorization,
  cacheConfigs.livestockList(),
  getAvailableLivestocks
);

/**
 * @swagger
 * /livestocks:
 *   post:
 *     summary: Create a new livestock entry (Admin only)
 *     tags: [Livestock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premium Cattle"
 *               price:
 *                 type: number
 *                 example: 50000
 *               description:
 *                 type: string
 *                 example: "High-quality cattle for investment"
 *               image:
 *                 type: string
 *                 example: "https://example.com/cattle.jpg"
 *     responses:
 *       201:
 *         description: Livestock created successfully
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
 *                   example: "Livestock created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Livestock'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/livestocks", authorization, createLivestock);

/**
 * @swagger
 * /wallet/funding/start:
 *   post:
 *     summary: Start wallet funding process
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 10000
 *                 description: "Amount to fund in Naira"
 *     responses:
 *       200:
 *         description: Payment initialization successful
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
 *                   example: "Payment initialized successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     authorization_url:
 *                       type: string
 *                       example: "https://checkout.paystack.com/..."
 *                     access_code:
 *                       type: string
 *                       example: "access_code_123"
 *                     reference:
 *                       type: string
 *                       example: "ref_123456"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/wallet/funding/start", authorization, startWalletFunding);

/**
 * @swagger
 * /wallet/fund/complete/{reference}:
 *   post:
 *     summary: Complete wallet funding
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         example: "ref_123456"
 *     responses:
 *       200:
 *         description: Wallet funding completed successfully
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
 *                   example: "Wallet funded successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Wallet'
 *       400:
 *         description: Payment verification failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/wallet/fund/complete/:reference",
  authorization,
  completeWalletFunding
);

/**
 * @swagger
 * /wallet/balance:
 *   get:
 *     summary: Get wallet balance
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                       example: 50000
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/wallet/balance",
  authorization,
  cacheConfigs.userWallet(),
  getWalletBalance
);

/**
 * @swagger
 * /wallet/transactions:
 *   get:
 *     summary: Get wallet transactions
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/wallet/transactions", authorization, getWalletTransactions);

/**
 * @swagger
 * /groups/active:
 *   get:
 *     summary: Get all active groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active groups retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Group'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/groups/active",
  authorization,
  cacheConfigs.activeGroups(),
  getActiveGroups
);

/**
 * @swagger
 * /groups/my-groups:
 *   get:
 *     summary: Get user's groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User groups retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Group'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/groups/my-groups", authorization, getMyGroups);

/**
 * @swagger
 * /groups/create/start:
 *   post:
 *     summary: Start creating a new group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - livestockId
 *               - totalSlots
 *               - pricePerSlot
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premium Cattle Investment Group"
 *               description:
 *                 type: string
 *                 example: "Invest in high-quality cattle"
 *               livestockId:
 *                 type: integer
 *                 example: 1
 *               totalSlots:
 *                 type: integer
 *                 example: 10
 *               pricePerSlot:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Group creation started successfully
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
 *                   example: "Group creation started"
 *                 data:
 *                   type: object
 *                   properties:
 *                     groupId:
 *                       type: string
 *                       example: "group_123"
 *                     paymentRequired:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/groups/create/start", authorization, startCreateGroup);

/**
 * @swagger
 * /groups/create/complete:
 *   post:
 *     summary: Complete group creation
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - paymentReference
 *             properties:
 *               groupId:
 *                 type: string
 *                 example: "group_123"
 *               paymentReference:
 *                 type: string
 *                 example: "ref_123456"
 *     responses:
 *       200:
 *         description: Group created successfully
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
 *                   example: "Group created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Group'
 *       400:
 *         description: Payment verification failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/groups/create/complete", authorization, completeCreateGroup);

/**
 * @swagger
 * /groups/{groupId}/join/start:
 *   post:
 *     summary: Start joining a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         example: "group_123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numberOfSlots
 *             properties:
 *               numberOfSlots:
 *                 type: integer
 *                 example: 2
 *                 description: "Number of slots to join"
 *     responses:
 *       200:
 *         description: Group join process started
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
 *                   example: "Join process started"
 *                 data:
 *                   type: object
 *                   properties:
 *                     authorization_url:
 *                       type: string
 *                       example: "https://checkout.paystack.com/..."
 *                     reference:
 *                       type: string
 *                       example: "ref_123456"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/groups/:groupId/join/start", authorization, startJoinGroup);

/**
 * @swagger
 * /groups/join/complete/{paymentReference}:
 *   post:
 *     summary: Complete joining a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentReference
 *         required: true
 *         schema:
 *           type: string
 *         example: "ref_123456"
 *     responses:
 *       200:
 *         description: Successfully joined group
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
 *                   example: "Successfully joined group"
 *                 data:
 *                   $ref: '#/components/schemas/Group'
 *       400:
 *         description: Payment verification failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/groups/join/complete/:paymentReference",
  authorization,
  completeJoinGroup
);

/**
 * @swagger
 * /groups/{groupId}:
 *   get:
 *     summary: Get group details
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         example: "group_123"
 *     responses:
 *       200:
 *         description: Group details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Group'
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/groups/:groupId",
  authorization,
  cacheConfigs.groupDetails(),
  getGroupDetails
);

/**
 * @swagger
 * /groups/my-created:
 *   get:
 *     summary: Get groups created by the current user
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Created groups retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Group'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/groups/my-created", authorization, getMyCreatedGroups);

/**
 * @swagger
 * /groups/my-joined:
 *   get:
 *     summary: Get groups the user has joined
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Joined groups retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Group'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/groups/my-joined", authorization, getMyJoinedGroups);

/**
 * @swagger
 * /groups/{groupId}:
 *   delete:
 *     summary: Delete a group (only by creator)
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         example: "group_123"
 *     responses:
 *       200:
 *         description: Group deleted successfully
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
 *                   example: "Group deleted successfully"
 *       403:
 *         description: Forbidden - Not the group creator
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/groups/:groupId", authorization, deleteGroup);

module.exports = router;
