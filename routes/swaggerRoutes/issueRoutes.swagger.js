/**
 * @swagger
 * /issue:
 *   get:
 *     summary: Get all issue
 *     tags:
 *       - Issues
 *     responses:
 *       200:
 *         description: Issue retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: integer
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Issue'
 *             success:
 *               type: boolean
 *       400:
 *         description: Bad request
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: integer
 *             data:
 *               type: array
 *               items: {}
 *             success:
 *               type: boolean
 */


/**
 * @swagger
 * /issue/generate:
 *   post:
 *     summary: Generate Issue 
 *     tags:
 *       - Issues
 *     parameters:
 *       - name: idea
 *         in: body
 *         description: Add Idea to Generate relevent Issue
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - idea
 *           properties:
 *             idea:
 *               type: string
 *               example: Problem of plastic waste in Central London Park
 *     responses:
 *       200:
 *         description: Add Issue
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: integer
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Issue'
 *             success:
 *               type: boolean
 *       500: 
 *             description: Internal server error
 *       401: 
 *              description: Correct  Authorization Token Required! 
*/


/**
 * @swagger
 * /issue:
 *   post:
 *     summary: Add a New issue
 *     tags:
 *       - Issues
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *       - name: body
 *         in: body
 *         description: Add Issue 
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - title
 *             - location
 *             - cause
 *             - address
 *             - video 
 *             - description
 *           properties:
 *             title:
 *               type: string
 *               example: Problem of plastic waste in Central London Park
 *             cause:
 *               type: string
 *               example: environment
 *             address:
 *               type: string
 *               example: West Bridge London, United Kingdom
 *             desc:
 *               type: string
 *               example: Join us for a day of mental health awareness and advocacy! Our
 *             image:
 *              type: string
 *              example: thumbnail/1717285896269.png
 *             video:
 *               type: object
 *               properties:
 *                 videoUrl:
 *                   type: string
 *                   example: 1717285907501.m3u8
 *                 type:
 *                   type: string
 *                   example: impactVideo
 *                 thumbnailUrl:
 *                   type: string
 *                   example: thumbnail/1717285896269.png
 *             description:
 *              type: string
 *              example: Join me in tackling the plastic waste problem at Central London Park. Together, we can restore the beauty of our beloved park and create a healthier environment for all. #CleanUpCentralPark #PlasticFreeParks
 *     responses:
 *       200:
 *         description: Issue added successfully
 *       500: 
 *             description: Internal server error 
*/

/**
 * @swagger
 * /issue/upvotes:
 *   post:
 *     summary: Upvotes the issue
 *     tags:
 *       - Issues
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *       - name: body
 *         in: body
 *         description: Add Issue id 
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - issue
 *           properties:
 *             issue:
 *               type: string
 *               example: 667912d875fcf3a374ab3bab
 *     responses:
 *       200:
 *         description: Issue voted successfully
 *       500: 
 *             description: Internal server error 
*/

/**
 * @swagger
 * /issue/forUser:
 *   get:
 *     summary: Get Issue for User
 *     tags:
 *       - Issues
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *       - name: page
 *         in: query
 *         description: Add Number of Page.
 *         required: false
 *       - name: pageSize
 *         in: query
 *         description: Describe the number of records in Page.
 *         required: false
 *     responses:
 *       200:
 *         description: Issue records retrieved successfully.
 *       500: 
 *             description: Internal server error 
*/


/**
 * @swagger
 * /issue/join:
 *   post:
 *     summary: Join Issue
 *     tags:
 *       - Issues
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *       - name: body
 *         in: body
 *         description: Add Issue id 
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - issue
 *           properties:
 *             issueId:
 *               type: string
 *               example: 667912d875fcf3a374ab3bab
 *     responses:
 *       200:
 *         description: Issue joined successfully.
 *       500: 
 *             description: Internal server error
 *       400: 
 *             description: Issue already Joined  
*/

/**
 * @swagger
 * /issue/leave:
 *   post:
 *     summary: Leave Issue
 *     tags:
 *       - Issues
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *       - name: body
 *         in: body
 *         description: Add Issue id 
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - issue
 *           properties:
 *             issueId:
 *               type: string
 *               example: 667912d875fcf3a374ab3bab
 *     responses:
 *       200:
 *         description: Issue Leave successfully.
 *       500: 
 *             description: Internal server error
 *       400: 
 *             description: Issue Not Joined  
*/

/**
 * @swagger
 * /issue/{id}:
 *   get:
 *     summary: Issue Details
 *     tags:
 *       - Issues
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Get issue by  id 
 *         required: true
 *     responses:
 *       200:
 *         description: Issue Details Record retrieved successfully.
 *       500: 
 *             description: Internal server error
*/

/**
 * @swagger
 * /issue/{id}:
 *   patch:
 *     summary: Update the Issue
 *     tags:
 *       - Issues
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *       - name: id
 *         in: path
 *         description: issue Id
 *       - name: body
 *         in: body
 *         description: Update Issue 
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - title
 *             - description
 *             - notification
 *           properties:
 *             title:
 *               type: string
 *               example: Problem of plastic waste in Central London Park
 *             description:
 *              type: string
 *              example: Join me in tackling the plastic waste problem at Central London Park. Together, we can restore the beauty of our beloved park and create a healthier environment for all. #CleanUpCentralPark #PlasticFreeParks
 *             notification:
 *              type: string
 *              example: Every Message
 *     responses:
 *       200:
 *         description: Issue updated successfully.
 *       500: 
 *             description: Internal server error
 *       400: 
 *             description: Issue Not Joined  
*/

/**
 * @swagger
 * /issue/{id}:
 *   delete:
 *     summary: Delete the Issue
 *     tags:
 *       - Issues
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *       - name: id
 *         in: path
 *         description: issue Id
 *     responses:
 *       200:
 *         description: Issue deleted successfully.
 *       500: 
 *             description: Internal server error
 *       400: 
 *             description: Issue Not Joined  
*/

/**
 * @swagger
 * /issue/message:
 *   post:
 *     summary: Send Message to the Issue
 *     tags:
 *       - Issues
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *       - name: body
 *         in: body
 *         description: Add Message to the  Issue 
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - issueId
 *             - message
 *           properties:
 *             issueId:
 *               type: string
 *               example: 66792e4ab0123f7763ef28a3
 *             message:
 *              type: string
 *              example: hi
 *     responses:
 *       200:
 *         description: Message Sent successfully.
 *       500: 
 *             description: Internal server error
 *       400: 
 *             description: Issue Not Joined  
*/

/**
 * @swagger
 * /issue/report:
 *   post:
 *     summary: Report the Issue
 *     tags:
 *       - Issues
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *       - name: body
 *         in: body
 *         description: Add Report to the  Issue 
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - issue
 *             - reportSubject
 *             - details
 *           properties:
 *             issues:
 *               type: string
 *               example: 66792e4ab0123f7763ef28a3
 *             reportSubject:
 *              type: string
 *              example: fraud
 *             details:
 *              type: string
 *              example: this issue is Invalid
 *     responses:
 *       200:
 *         description: Report added Successfully.
 *       500: 
 *             description: Internal server error
 *       400: 
 *             description: Issue Not Valid  
*/

/**
 * @swagger
 * /issue/share:
 *   post:
 *     summary: Share the Issue
 *     tags:
 *       - Issues
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *       - name: body
 *         in: body
 *         description: share the  Issue 
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - id
 *           properties:
 *             issue:
 *               type: string
 *               example: 66792e4ab0123f7763ef28a3
 *     responses:
 *       200:
 *         description: Issue shared successfully.
 *       500: 
 *             description: Internal server error
 *       400: 
 *             description: Issue Not Valid  
*/

/**
 * @swagger
 * /issue/{id}/views:
 *   post:
 *     summary: View the Issue
 *     tags:
 *       - Issues
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *       - name: id
 *         in: path
 *         description: issue Id
 *     responses:
 *       200:
 *         description: Issue View successfully.
 *       500: 
 *             description: Internal server error
 *       400: 
 *             description: Issue Not Valid  
*/
















module.exports = {}; 