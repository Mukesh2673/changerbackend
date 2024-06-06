/**
 * @swagger
 * /campaigns:
 *   get:
 *     summary: Get all campaigns
 *     tags:
 *       - Campaigns
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

/**
 * @swagger
 * /campaigns/{id}:
 *   get:
 *     summary: Get details of a campaign by ID
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the campaign to fetch
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Details of the campaign
 *         schema:
 *           $ref: '#/components/schemas/Campaign'
 *       404:
 *         description: Campaign not found
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /campaign/{id}/participate/:
 *   post:
 *     summary: Participate in a campaign
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the campaign to participate in
 *         required: true
 *         type: string
 *       - name: body
 *         in: body
 *         description: User details
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: CampaignParticipant schema details
 *         schema:
 *           $ref: '#/components/schemas/CampaignParticipant'
 *       404:
 *         description: Campaign not found
 *       422:
 *         description: Already participating in the campaign
 *       500:
 *         description: Internal server error
 */


module.exports = {}; 