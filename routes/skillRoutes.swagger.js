/**
 * @swagger
 * /skills:
 *   get:
 *     summary: Get All Skills
 *     tags:
 *       - Skills
 *     parameters:
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

 *     responses:
 *       200:
 *         description: List of skills
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Skill'
 *       404:
 *         description: Skills not found
 */


/**
 * @swagger
 * /skill/{id}:
 *   delete:
 *     summary: Get  Skill
 *     tags:
 *       - Skills
 *     parameters:
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