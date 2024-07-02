/**
 * @swagger
 * /bookmarks:
 *   post:
 *     summary: Save The Bookmarks
 *     tags:
 *       - Bookmarks
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *         required: true
 *         schema:
 *           type: string
 *       - name: body
 *         in: body
 *         description: Save Either the Issue or the Campaign Bookmarks
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *              - issue
 *              - campaign 
 *           properties: 
 *              issue:
 *                type: string
 *                example: 66727f3d7c01ff8098c967a5
 *              campaign:
 *                type: Object
 *                example: 66727f3d7c01ff8098c967a5 
 *     responses:
 *       200:
 *         description: Bookmarks added successfully.
 *       403:
 *         description: Correct Authorization Token Required!
 *       400:
 *         description: Issue or  Campaign already Bookmarked
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /bookmarks/{id}:
 *   delete:
 *     summary: Delete The Bookmarks By Id
 *     tags:
 *       - Bookmarks
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *         required: true
 *         schema:
 *           type: stringS
 *       - name: id
 *         in: path
 *         description: Addd the Bookmarks Id  to Delete
 *         required: true

 *     responses:
 *       200:
 *         description: Bookmarks added successfully.
 *       403:
 *         description: Correct Authorization Token Required!
 *       400:
 *         description: Issue or  Campaign already Bookmarked
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /bookmarks:
 *   get:
 *     summary: Get  the Bookmarks Records.
 *     tags:
 *       - Bookmarks
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Advocate records retrieved successfully..
 *       500:
 *         description: Internal server error
 */