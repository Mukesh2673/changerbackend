/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of all users.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: A list of users
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retrieve a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the user to retrieve
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A user object
 *         schema:
 *           $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/uid/{uid}:
 *   get:
 *     summary: Retrieve a user by UID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: uid
 *         description: UID of the user to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A user object
 *         schema:
 *           $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/following/{cuid}/{fuid}:
 *   get:
 *     summary: Check if a user is following another user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: cuid
 *         description: ID of the user for who we are checking
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fuid
 *         description: ID of the user for who we wanna see if following
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         schema:
 *           type: boolean
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     parameters:
 *       - name: user
 *         in: body
 *         description: User object
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /users/follow/{cuid}/{fuid}:
 *   post:
 *     summary: Follow a user
 *     tags:
 *       - Users
 *     parameters:
 *       - name: cuid
 *         in: path
 *         description: ID of the current user
 *         required: true
 *         type: string
 *       - name: fuid
 *         in: path
 *         description: ID of the user to follow
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User followed successfully
 *       401:
 *         description: Invalid login user or following user
 *       400:
 *         description: User already followed
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/unfollow/{cuid}/{fuid}:
 *   post:
 *     summary: Unfollow a user
 *     tags:
 *       - Users
 *     parameters:
 *       - name: cuid
 *         in: path
 *         description: ID of the current user
 *         required: true
 *         type: string
 *       - name: fuid
 *         in: path
 *         description: ID of the user to unfollow
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User unfollowed successfully
 *       401:
 *         description: Invalid login user or following user
 *       400:
 *         description: User not followed
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/update/{id}:
 *   post:
 *     summary: Update user profile
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the user to update
 *         required: true
 *         type: string
 *       - name: body
 *         in: body
 *         description: Fields to update
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         schema:
 *           $ref: '#/components/schemas/User'
 *       404:
 *         description: Invalid User
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/cause:
 *   patch:
 *     summary: Add cause to user profile
 *     tags:
 *       - Users
 *     parameters:
 *       - name: body
 *         in: body
 *         description: Cause and UID of the user
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - cause
 *             - uid
 *           properties:
 *             cause:
 *               type: array
 *               items:
 *                 type: string
 *             uid:
 *               type: string
 *     responses:
 *       200:
 *         description: Cause added
 *       403:
 *         description: Mistake occured!
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/cognito/{cuid}:
 *   get:
 *     summary: Retrieve a user by Cognito username
 *     tags:
 *       - Users
 *     parameters:
 *       - name: cuid
 *         in: path
 *         description: Cognito username of the user to retrieve
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Username exists
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             user:
 *               $ref: '#/components/schemas/User'
 *             status:
 *               type: integer
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/{uid}:
 *   delete:
 *     summary: Delete a user by UID
 *     tags:
 *       - Users
 *     parameters:
 *       - name: uid
 *         in: path
 *         description: UID of the user to delete
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User Deleted
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/privacy:
 *   post:
 *     summary: Update user privacy settings
 *     tags:
 *       - Users
 *     parameters:
 *       - name: body
 *         in: body
 *         description: User ID and new privacy settings
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - id
 *             - privacy
 *           properties:
 *             id:
 *               type: string
 *             privacy:
 *               type: string
 *     responses:
 *       200:
 *         description: Updated user privacy settings
 *         schema:
 *           $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /user/language:
 *   post:
 *     summary: Update user language settings
 *     tags:
 *       - Users
 *     parameters:
 *       - name: body
 *         in: body
 *         description: User ID and new language settings
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - id
 *             - language
 *           properties:
 *             id:
 *               type: string
 *             language:
 *               type: string
 *     responses:
 *       200:
 *         description: Updated user language settings
 *         schema:
 *           $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /user/report:
 *   post:
 *     summary: Submit a report
 *     tags:
 *       - Users
 *     parameters:
 *       - name: body
 *         in: body
 *         description: Report details
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/Report'
 *     responses:
 *       200:
 *         description: Report added successfully
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: integer
 *             message:
 *               type: string
 *             success:
 *               type: boolean
 *             data:
 *               $ref: '#/components/schemas/Report'
 *       500:
 *         description: Something went wrong
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: integer
 *             message:
 *               type: string
 *             success:
 *               type: boolean
 */

/**
 * @swagger
 * /user/profile/remove/{id}:
 *   post:
 *     summary: Remove user profile image
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         description: User ID whose profile image to remove
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Profile image removed successfully
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: integer
 *             message:
 *               type: string
 *             user:
 *               $ref: '#/components/schemas/User'
 *             success:
 *               type: boolean
 *       404:
 *         description: User not found
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 */

/**
 * @swagger
 * /user/notification/{id}:
 *   get:
 *     summary: Get user notifications
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         description: User ID to fetch notifications
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items: {}
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /upload/profile:
 *   post:
 *     summary: Upload user profile image
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 image:
 *                   type: string
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/message:
  *   post:
 *     summary: Submit a report
 *     tags:
 *       - Users
 *     parameters:
 *       - name: body
 *         in: body
 *         description: Message details
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/Message'
 *     responses:
 *       200:
 *         description: Message sent successfully!
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: integer
 *             message:
 *               type: string
 *             success:
 *               type: boolean
 *             data:
 *               $ref: '#/components/schemas/Message'
 *       500:
 *         description: Something went wrong!
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: integer
 *             message:
 *               type: string
 *             success:
 *               type: boolean
 */

/**
 * @swagger
 * /user/message/{pid}/{uid}:
 *   get:
 *     summary: Get messages between two users
 *     tags:
 *       - Users
 *     parameters:
 *       - name: pid
 *         in: path
 *         description: ID of the first user
 *         required: true
 *         type: string
 *       - name: uid
 *         in: path
 *         description: ID of the second user
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: integer
 *             message:
 *               type: string
 *             success:
 *               type: boolean
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       500:
 *         description: Internal server error
 */

module.exports = {}; 
