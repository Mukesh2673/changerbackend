/**
 * @swagger
 * /skills:
 *   get:
 *     summary: Get All Skills
 *     tags:
 *       - Skills
 *     parameters:
 *       - name: Accept-Language
 *         in: header
 *         enum: [ "english", "arabic","french", "chinese", "german"]
 *         description: Select Language  to get response Messages in selected language  
 *         required: false 
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: pageSize
 *         in: query
 *         description: Number of skills per page for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: search
 *         in: query
 *         description: Search Skill Records
 *         required: false
 *         schema:
 *           type: string
 *           example: IT Support 
 *       - name: verified
 *         in: query
 *         type: boolean
 *         description: Add skill verify status
 *         required: true
 *     responses:
 *       200:
 *         description: Skill records retrieve successfully
 *       404:
 *         description: Skills not found
 */


/**
 * @swagger
 * /skill/{id}:
 *   delete:
 *     summary: Delete a  Skill
 *     tags:
 *       - Skills
 *     parameters:
 *       - name: Accept-Language
 *         in: header
 *         enum: [ "english", "arabic","french", "chinese", "german"]
 *         description: Select Language  to get response Messages in selected language  
 *         required: false 
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *       - name: id
 *         in: path
 *         description: ID of the  skill
 *         required: true
 *         type: string         
 *     responses:
 *       200:
 *         description: Skill records
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Skill'
 *       404:
 *         description: Skill not found
 */


/**
 * @swagger
 * /skills/add:
 *   post:
 *     summary: publish a new Skill.
 *     tags:
 *       - Skills
 *     parameters:
 *       - name: Accept-Language
 *         in: header
 *         enum: [ "english", "arabic","french", "chinese", "german"]
 *         description: Select Language  to get response Messages in selected language  
 *         required: false 
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *         required: true
 *         schema:
 *           type: string
 *       - name: id
 *         in: query
 *         description: Add  either id or skill Name. 
 *         required: false
 *       - name: skill
 *         in: query
 *         description: Add either id or skill Name. 
 *         required: false
 *     responses:
 *       200:
 *         description: Skill added Successfully.
 *       403:
 *         description: Correct Authorization Token Required!
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /skill/{id}/verify:
 *   patch:
 *     summary: verify the  Skill
 *     tags:
 *       - Skills
 *     parameters:
 *       - name: Accept-Language
 *         in: header
 *         enum: [ "english", "arabic","french", "chinese", "german"]
 *         description: Select Language  to get response Messages in selected language  
 *         required: false 
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *       - name: id
 *         in: path
 *         description: ID of the  skill
 *         required: true
 *         type: string         
 *     responses:
 *       200:
 *         description: Skill Verified Successfully
 *       404:
 *         description: Skill not found
 *       401:
 *         description: You do not have the required admin privileges to perform this action
 */
