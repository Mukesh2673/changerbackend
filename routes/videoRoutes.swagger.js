/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Get All Videos
 *     tags:
 *       - Videos 
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
