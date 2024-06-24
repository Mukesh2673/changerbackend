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
 * /campaign/report:
 *   post:
 *     summary: Report to The Campaign
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token        
 *       - name: body
 *         in: body
 *         description: Report the Campaign by Campaign Id
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - reportSubject
 *             - details
 *             - campaign 
 *           properties:
 *             reportSubject:
 *               type: string
 *             details:
 *               type: string
 *             campaign:
 *               type: string   
 *     responses:
 *       200:
 *         description: Report Added Successfully
 *       403:
 *         description: Correct  Authorization Token Required!
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /campaign/{campaignId}/participate/{participationId}:
 *   post:
 *     summary: Participate in The Campaign for the Volunteers
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token        
 *       - name: campaignId
 *         in: path
 *         description: Campaing Id you Want to participate
 *         required: true
 *       - name: participationId
 *         in: path
 *         description: Campaing Participation Id from campaign Phase
 *         required: true 
 *         schema:
 *           type: object
 *           required:
 *             - reportSubject
 *             - details
 *             - campaign 
 *           properties:
 *             reportSubject:
 *               type: string
 *             details:
 *               type: string
 *             campaign:
 *               type: string   
 *     responses:
 *       200:
 *         description: You successfully participated in the campaign.
 *       500:
 *         description: Internal server error
 *       401:
 *         description: Correct  Authorization Token Required!
 *       404:
 *         description: campaign does not correspond to the participation
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

/**
 * @swagger
 * /campaign/message:
 *   post:
 *     summary: Post the messages for the campaign-related user within campaigns.
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token        
 *       - name: body
 *         in: body
 *         description: Message to a particular user who is a part of the campaign by user ID and campaign ID.
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - profile
 *             - campaign
 *             - message 
 *           properties:
 *             profile:
 *               type: string
 *             campaign:
 *               type: string
 *             message:
 *               type: string   
 *     responses:
 *       200:
 *         description: Message sent successfully.
 *       403:
 *         description: Correct  Authorization Token Required!
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /campaign/{campaignId}/message:
 *   get:
 *     summary: Get the messages of a user in a particular campaign.
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token        
 *       - name: campaignId
 *         in: path
 *         description: Get the Message of users in a perticular campaign by campaign Id 
 *         required: true
 *     responses:
 *       200:
 *         description: Message records retrieved successfully.
 *       403:
 *         description: Correct  Authorization Token Required!
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /campaign/{campaignId}/message:
 *   get:
 *     summary: Get the messages of a user in a particular campaign.
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token        
 *       - name: campaignId
 *         in: path
 *         description: Get the Message of users in a perticular campaign by campaign Id 
 *         required: true
 *     responses:
 *       200:
 *         description: Message records retrieved successfully.
 *       403:
 *         description: Correct  Authorization Token Required!
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /campaign/volunteers:
 *   get:
 *     summary: Retrieve the list of all volunteers along with their corresponding campaigns.
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token        
 *       - name: location
 *         in: query
 *         description: Add the location to find volunteers located in the given location.
 *         required: false
 *       - name: skill
 *         in: query
 *         description: Add the Skills to find volunteers related to the given skill.
 *         required: false
 *       - name: cause
 *         in: query
 *         description: Add the Cause to find volunteers related to the given cause.
 *         required: false
 *     responses:
 *       200:
 *         description: Volunteers records retrieved successfully.
 *       403:
 *         description: Correct  Authorization Token Required!
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /campaign/volunteers:
 *   get:
 *     summary: Retrieve the list of all volunteers along with their corresponding campaigns.
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token        
 *       - name: location
 *         in: query
 *         description: Add the location to find volunteers located in the given location.
 *         required: false
 *       - name: skill
 *         in: query
 *         description: Add the Skills to find volunteers related to the given skill.
 *         required: false
 *       - name: cause
 *         in: query
 *         description: Add the Cause to find volunteers related to the given cause.
 *         required: false
 *     responses:
 *       200:
 *         description: Volunteers records retrieved successfully.
 *       403:
 *         description: Correct  Authorization Token Required!
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /campaign/volunteers/forYou:
 *   get:
 *     summary: Retrieve the list of all campaign that user voluntered.
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token        
 *       - name: page
 *         in: query
 *         description: Add Number of Page.
 *         required: false
 *       - name: PageSize
 *         in: query
 *         description: Describe the number of records in Page.
 *         required: false
 *     responses:
 *       200:
 *         description: campaign  records retrieved successfully.
 *       403:
 *         description: Correct  Authorization Token Required!
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /campaign/{campaignId}/impactVideo:
 *   post:
 *     summary: Add impact to the campaign by uploading a video.
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *         required: true
 *         schema:
 *           type: string
 *       - name: campaignId
 *         in: path
 *         description: ID of the campaign to add impact videos to.
 *         required: true
 *       - name: location
 *         in: formData
 *         description: Add the Geo location of the Video in  
 *         required: true
 *       - name: address
 *         in: formData
 *         description: Add the address corresponding to the map location
 *         required: true
 *       - name: description
 *         in: formData
 *         description: Report the Campaign by Campaign Id
 *         required: true
 *       - name: video
 *         in: formData
 *         type: file
 *         description: Report the Campaign by Campaign Id
 *         required: true
 *     responses:
 *       200:
 *         description: Campaign impact video added successfully.
 *       403:
 *         description: Correct Authorization Token Required!
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /campaign/signPetition:
 *   post:
 *     summary: Sign the Petition of Campaign
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *         required: true
 *         schema:
 *           type: string
 *       - name: body
 *         in: body
 *         description: Save the signed petition for the campaign identified by the campaign petition ID.
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *              - petition
 *              - location 
 *           properties: 
 *              petition:
 *                type: string
 *                example: 66727f3d7c01ff8098c967a5
 *              location:
 *                type: Object
 *                example: {"type": "Point", "coordinates": [80.9462, 12.83]}          
 *     responses:
 *       200:
 *         description: Petition Signed successfully.
 *       403:
 *         description: Correct Authorization Token Required!
 *       500:
 *         description: Internal server error
 */


module.exports = {}; 