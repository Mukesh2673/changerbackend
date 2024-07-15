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
 * /user/notification:
 *   get:
 *     summary: Get User Notification
 *     tags:
 *       - Users
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *         type: string
 *         required: true        
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
 *         description: User  records retrieved successfully.
 *         schema:
 *           $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */



/**
 * @swagger
 * /user/onboarding:
 *   post:
 *     summary: Register User Details
 *     tags:
 *       - Onboarding
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
 * /users/{id}/follow:
 *   post:
 *     summary: Follow a user
 *     tags:
 *       - Users
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token 
 *         required: true
 *         type: string   
 *       - name: id
 *         in: path
 *         description: ID of the follow user
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User followed successfully
*       401:
 *         description: Correct  Authorization Token Required!
 *       400:
 *         description: User already followed
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/{id}/unfollow:
 *   post:
 *     summary: Unfollow a user
 *     tags:
 *       - Users
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token 
 *         required: true
 *         type: string   
 *       - name: id
 *         in: path
 *         description: ID of the  unfollow user
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
 * /users/update:
 *   post:
 *     summary: Update user profile
 *     tags:
 *       - Profile
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token   
 *       - name: body
 *         in: body
 *         description: Fields to update
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - first_name
 *             - last_name
 *             - username
 *           properties:
 *              first_name: 
 *                type: string
 *                example: changer
 *              last_name: 
 *                type: string
 *                example: app
 *              username: 
 *                type: string
 *                example: changerapp
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         schema:
 *           $ref: '#/components/schemas/User'
 *       404:
 *         description: Invalid User
 *       403:
 *         description: No Authorization Token! 
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/cause:
 *   patch:
 *     summary: Add cause to user profile
 *     tags:
 *       - Onboarding
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token   
 *       - name: body
 *         in: body
 *         description: Cause for the user
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - cause
 *           properties:
 *             cause:
 *               type: array
 *               items:
 *                 type: string
 *                 example: environment
 *     responses:
 *       200:
 *         description: cause added to profile Successfully.
 *       500:
 *         description: Internal server error
 *       403:
 *         description: No Authorization Token! 
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
 *         required: true  
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
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *         required: true  
 *       - name: body
 *         in: body
 *         description: Report details
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *              - reportSubject
 *              - details
 *              - profile
 *           properties:
 *            reportSubject:
 *             type: string
 *             example: Non-existent profile
 *            details:
 *             type: string
 *             example: I contact the profile but not get any response
 *            profile:
 *             type: string
 *             example: 6479d85db73d8802b387381f
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
 * /user/profile/remove:
 *   post:
 *     summary: Remove user profile image
 *     tags:
 *       - Profile
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
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
 *               example: Profile image removed successfully     
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
 * /user/profile/upload:
 *   post:
 *     summary: Upload user profile image
 *     tags:
 *       - Profile
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *       - name: Image
 *         in: formData
 *         type: file
 *         description: Add images to upload
 *         required: true   
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 *       401:
 *         description: Correct  Authorization Token Required!
 *       404:
 *         description: Bad request 
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
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *       - name: body
 *         in: body
 *         description: Message details
 *         required: true
  *         schema:
 *           type: object
 *           required:
 *              - profile
 *              - message
 *           properties:
 *            profile:
 *             type: string
 *             example: 65deef3bc50f2a0bf4580fa1
 *            message:
 *             type: string
 *             example: Hello
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
 * /user/{id}/message:
 *   get:
 *     summary: Get users messages with current user
 *     tags:
 *       - Users
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *       - name: id
 *         in: path
 *         description: ID of the first user
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
 *     summary: Get current user messages
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

/**
 * @swagger
 * /accessToken:
 *   get:
 *     summary: Get Access token from refresh token
 *     tags:
 *       - Cognito
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Add refresh token to access token
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Access token has been retrieved successfully.
 *         schema:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *             idToken:
 *               type: string
 *             refreshToken:
 *               type: string 
 *             success:
 *               type: boolean 
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /cognitoUser:
 *   get:
 *     summary: Get cognito User details by access token
 *     tags:
 *       - Cognito
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Add refresh token to access token
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Cognito User records retrieved successfully.
 *       500:
 *         description: Internal server error
 */








module.exports = {}; 
