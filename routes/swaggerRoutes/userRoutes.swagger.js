/**
 * @swagger
 * /signin:
 *   post:
 *     summary: Sign in to the user Account
 *     tags:
 *       - Cognito
 *     parameters:
 *       - name: body
 *         in: body
 *         description: Sign in User Account By Email Address and Password
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - password
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: Loging Access Token
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: 
 *       - Cognito
 *     parameters:
 *       - name: body
 *         in: body
 *         description: Sign up a new user account with email and password
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - password
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: Signup successful. Confirmation code sent to the provided email.
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: Confirmation Code has been sent to user@example.com
 *             user:
 *               type: object
 *               description: Cognito user information
 *       400:
 *         description: Signup failed due to an error.
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: false
 *             message:
 *               type: string
 *               example: Error message
 *             error:
 *               type: object
 *               description: Detailed error information
 */

/**
 * @swagger
 * /signupConfirm:
 *   post:
 *     summary: Confirm user signup
 *     tags:
 *       - Cognito
 *     parameters:
 *       - name: body
 *         in: body
 *         description: Confirm user signup with email and confirmation code
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - code
 *           properties:
 *             email:
 *               type: string
 *             code:
 *               type: string
 *     responses:
 *       200:
 *         description: User email confirmed successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: User email confirmed successfully
 *             user:
 *               type: object
 *               properties:
 *                 user_confirmed:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Confirmation failed due to an error.
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: false
 *             message:
 *               type: string
 *               example: Error message
 *             error:
 *               type: object
 *               description: Detailed error information
 */

/**
 * @swagger
 * /user/notification/{id}:
 *   get:
 *     summary: Get notifications for a user
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the user to get notifications for
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved notifications
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: integer
 *               example: 200
 *             data:
 *               type: object
 *               properties:
 *                 Today:
 *                   type: array
 *                   items:
 *                     type: object
 *                 Yesterday:
 *                   type: array
 *                   items:
 *                     type: object
 *                 ThisWeek:
 *                   type: array
 *                   items:
 *                     type: object
 *                 Older:
 *                   type: array
 *                   items:
 *                     type: object
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: Notifications
 *       400:
 *         description: Failed to retrieve notifications
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: integer
 *               example: 400
 *             data:
 *               type: array
 *               items:
 *                 type: object
 *             success:
 *               type: boolean
 *               example: false
 *             message:
 *               type: string
 *               example: Error message
 */

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
 * /user/onboarding:
 *   post:
 *     summary: Register User Details
 *     tags:
 *       - Users
 *     parameters:
 *       - name: body
 *         in: body
 *         description: Save User details  Records
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *              - cognitoUsername
 *              - dob
 *              - first_name
 *              - last_name
 *           properties:
 *              cognitoUsername:
 *                  type: string
 *                  example: 31ebd500-40b1-708b-62e9-047779e666b7
 *              dob:
 *                  type: string
 *                  example: 07/04/2023
 *              first_name:
 *                  type: string
 *                  example: changer   
 *              last_name:
 *                  type: string
 *                  example: application 
 *              
 *     responses:
 *       200:
 *         description: User records details saved successfully
 *       500:
 *         description: Internal Server Error
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
 * /user/{cid}:
 *   delete:
 *     summary: Delete a user Account
 *     tags:
 *       - Settings
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token     
 *       - name: cid
 *         in: path
 *         description: Add cognito Id to delete the User Account
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User Account Deleted Successfully.
 *       400:
 *         description: Invalid Congnito Id.
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/privacy:
 *   patch:
 *     summary: Update user privacy settings
 *     tags:
 *       - Settings
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token        
 *       - name: status
 *         in: query
 *         type: boolean
 *         description: Add privacy status in the Boolean formate
 *         required: true
 *     responses:
 *       200:
 *         description: Privacy updated to the profile successfully.
 *       403:
 *         description: Correct Authorization Token Required!
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/language:
 *   patch:
 *     summary: Update user language settings
 *     tags:
 *       - Settings
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token 
 *       - name: language
 *         in: query
 *         type: string
 *         description: Add Language Name to update in Profile
 *         required: true
 *     responses:
 *       200:
 *         description: Language updated to the profile successfully.
 *       403:
 *         description: Correct Authorization Token Required!
 *       500:
 *         description: Internal server error
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
 *     summary: Send a message
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

/**
 * @swagger
 * /user/admin:
 *   get:
 *     summary: Create Admin User
 *     tags:
 *       - Users
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Bearer token for authorization
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Your profile role has been successfully changed to admin.
 *       500:
 *         description: Internal server error
 */






/**
 * @swagger
 * /user/messages:
 *   get:
 *     summary: Get user messages
 *     tags:
 *       - Users
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Bearer token for authorization
 *         required: true
 *         type: string
 *       - name: userId
 *         in: query
 *         description: ID of the user to get messages for
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved messages
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: integer
 *               example: 200
 *             message:
 *               type: string
 *               example: Message records
 *             success:
 *               type: boolean
 *               example: true
 *             data:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   sender:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   profile:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   campaign:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *       500:
 *         description: An error occurred
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: integer
 *               example: 500
 *             message:
 *               type: string
 *               example: An error occurred
 *             success:
 *               type: boolean
 *               example: false
 *             error:
 *               type: string
 *               example: Error message
 */

module.exports = {}; 
