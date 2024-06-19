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



/**
 * @swagger
 * /campaigns:
 *   post:
 *     summary: Add a New Campaign
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *       - name: body
 *         in: body
 *         description: Add campaign
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - title
 *             - cause
 *             - story
 *             - image
 *             - video 
 *           properties:
 *             title:
 *               type: string
 *               example: The Discovery Campaign on Remote Sensing of Plastic Marine Litter
 *             cause:
 *               type: string
 *               example: environment
 *             phase:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: Awareness and Education
 *                   action:
 *                       type: array
 *                       example:
  *                       - name: donation
 *                         amount: 30
 *                         description: Fundraise for educational materials and online campaign tools.
 *                         karmaPoint: 10
 *                         karmaUnit: 10$
 *                       - name: petition
 *                         numberOfSignature: 10
 *                         neededSignaturesFor: To share awareness about wildlife conservation
 *                         karmaPoint: 12
 *                       - name: participation
 *                         participant: 10
 *                         roleTitle: Community Outreach Volunteer
 *                         description: As a Community Outreach Volunteer, you will play a pivotal role...
 *                         location:
 *                           type: Point
 *                           coordinates: [18.7323, 73.1232]
 *                         address: chandigarh Mohali
 *                         startDate: 1asfdasfd
 *                         numberOfDays: 5
 *                         onSite:
 *                           status: true
 *                           details: Active in-person contribution, hands-on involvement.
 *                         remote:
 *                           status: false
 *                           details: Contribution from a distance or virtual involvement.
 *                         partTime:
 *                           status: true
 *                           details: 4h every day of participation
 *                         fullTime:
 *                           status: true
 *                           details: 4h every day of participation
 *                         responsibilities:
 *                           - name: Develop and distribute educational materials on environmental sustainability
 *                           - name: Establish and maintain relationships with local schools, businesses, and community groups to foster environmental initiatives
 *                           - name: Assist in the coordination of volunteer activities and events
 *                           - name: Collect feedback from community members to improve future outreach efforts
 *                         skills:
 *                           -  666fd24b8d9935683510fcbb
 *                           -  666fd24b8d9935683510fcbc
 *                           -  666fd24b8d9935683510fcbd
 *                         requirements:
 *                           - name: Must be at least 18 years old
 *                           - name: Able to commit to a minimum of 4 hours per day
 *                           - name: Background check may be required for working with minors or in certain community settings
 *                         provides:
 *                           - name: Comprehensive training on our organization's mission and outreach strategies
 *                           - name: Ongoing support and guidance from our experienced team
 *                           - name: Ongoing support and guidance from our experienced team
 *                         karmaPoint: 2000
*             story:
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
 *                   example: actionVideo
 *                 thumbnailUrl:
 *                   type: string
 *                   example: thumbnail/1717285896269.png
 * 
 *     responses:
 *       200:
 *         description: Campaign added successfully!
 *       403:
 *         description: No Authorization Token!
 *       500:
 *         description: Internal server error
 *      
 */







module.exports = {}; 