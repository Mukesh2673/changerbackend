/**
 * @swagger
 * /issue:
 *   get:
 *     summary: Get all issue
 *     tags:
 *       - Issues
 *     responses:
 *       200:
 *         description: Campaigns retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: integer
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Campaign'
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


module.exports = {}; 