/**
 * @swagger
 * /advocate:
 *   post:
 *     summary: Advocate to the campaign.
 *     tags:
 *       - Advocate
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *         required: true
 *         schema:
 *           type: string
 *       - name: campaign
 *         in: formData
 *         description: Add campaign Id to Advocating  
 *         required: true
 *       - name: description
 *         in: formData
 *         description: Describe your post, add hashtags, or mention creators that inspired you 
 *         required: true
 *       - name: title
 *         in: formData
 *         description: Add The Title of the video
 *         required: true
 *       - name: video
 *         in: formData
 *         type: file
 *         description: Embed a motivating video to enhance the impact of your message
 *         required: true 

 * 
 *     responses:
 *       200:
 *         description: Advocate added successfully.
 *       403:
 *         description: Correct Authorization Token Required!
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /advocate/{id}:
 *   delete:
 *     summary: Delete the advocacy.
 *     tags:
 *       - Advocate
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *         required: true
 *         schema:
 *           type: string
 *       - name: id
 *         in: path
 *         description: Add the Advocacy Id  
 *         required: true
 * 
 *     responses:
 *       200:
 *         description: Advocate deleted successfully.
 *       403:
 *         description: Correct Authorization Token Required!
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /advocate:
 *   get:
 *     summary: Get  the Advocate Records.
 *     tags:
 *       - Advocate
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *         required: true
 *         schema:
 *           type: string
 *       - name: id
 *         in: query
 *         description: Either add id in query to get single else get all records
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Advocate records retrieved successfully..
 *       500:
 *         description: Internal server error
 */
