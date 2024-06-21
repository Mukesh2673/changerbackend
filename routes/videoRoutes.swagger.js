/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Get All Videos
 *     tags:
 *       - Videos 
 *     responses:
 *       200:
 *         description: Video records retrieved successfully.
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /video/{id}:
 *   get:
 *     summary: Get details of video  by ID
 *     tags:
 *       - Videos
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the video to fetch
 *         required: true
 *         type: string
 *       - name: body
 *         in: body
 *         description: Add comments to the Videos
 *     responses:
 *       200:
 *         description: Video records retrieved successfully.
 *       404:
 *         description: Video not found
 *       500:
 *         description: Something went wrong
 */


/**
 * @swagger
 * /video/{id}:
 *   delete:
 *     summary: Delete video by video Id
 *     tags:
 *       - Videos
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the video to Delete
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Video records retrieved successfully.
 *       404:
 *         description: Video not found
 *       500:
 *         description: Something went wrong
 */


/**
 * @swagger
 * /video/{videoId}/like:
 *   post:
 *     summary: Add Likes to the Videos
 *     tags:
 *       - Videos
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token    
 *       - name: videoId
 *         in: path
 *         description: ID of the video to 
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Video has been Liked Successfully.
 *       404:
 *         description: Video not found
 *       500:
 *         description: Something went wrong
 */


/**
 * @swagger
 * /video/{videoId}/comment:
 *   post:
 *     summary: Add Comment to the Videos
 *     tags:
 *       - Videos
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token    
 *       - name: videoId
 *         in: path
 *         description: ID of the video to Comment 
 *         required: true
 *         type: string
 *       - name: body
 *         in: body
 *         description: Add Messages text
 *         required: true
 *         schema:
 *          type: object
 *          required:
 *              -message
 *          properties:
 *            message:
 *               type: string
 *               example: nice Videos              
 *     responses:
 *       200:
 *         description: Comment added successfully.
 *       404:
 *         description: Video not found
 *       500:
 *         description: Something went wrong
 */


/**
 * @swagger
 * /video/{videoId}/comment/{commentId}/like:
 *   post:
 *     summary: Like Comment of video
 *     tags:
 *       - Videos
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token    
 *       - name: videoId
 *         in: path
 *         description: ID of the video to add Like to Comment 
 *         required: true
 *         type: string
 *       - name: commentId
 *         in: path
 *         description: ID of the comment of Comment 
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Liked Comment/unLiked Comment
 *       404:
 *         description: Video not found
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /video/{videoId}/comment/reply/{repliesCommentId}/like:
 *   post:
 *     summary: Add like to the reply Comment
 *     tags:
 *       - Videos
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token    
 *       - name: videoId
 *         in: path
 *         description: ID of the video to like Comment 
 *         required: true
 *         type: string
 *       - name: repliesCommentId
 *         in: path
 *         description: ID of the repliesCommentId of  Comment 
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: video
 *         schema:
 *          type: array
 *          items:
 *           $ref: '#/components/schemas/Video'  
 *       400:
 *         description: Invalid  reply Comment Id
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /video/{videoId}/comment/{commentId}/reply:
 *   post:
 *     summary: Reply to the comment
 *     tags:
 *       - Videos
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token    
 *       - name: videoId
 *         in: path
 *         description: ID of the video to Comment 
 *         required: true
 *         type: string
 *       - name: commentId
 *         in: path
 *         description: ID of the Comment to reply 
 *         required: true
 *         type: string
 *       - name: body
 *         in: body
 *         description: Add Messages text
 *         required: true
 *         schema:
 *          type: object
 *          required:
 *              -message
 *          properties:
 *            message:
 *               type: string
 *               example: nice Videos
 *     responses:
 *       200:
 *         description: video
 *         schema:
 *          type: array
 *          items:
 *           $ref: '#/components/schemas/Video'  
 *       400:
 *         description: Invalid Comment Id
 *       500:
 *         description: Something went wrong
 */
