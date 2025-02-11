/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Get All Videos
 *     tags:
 *       - Videos 
 *     parameters:
 *       - name: Accept-Language
 *         in: header
 *         enum: [ "english", "arabic","french", "chinese", "german"]
 *         description: Select Language  to get response Messages in selected language  
 *         required: false 
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
 *       - name: Accept-Language
 *         in: header
 *         enum: [ "english", "arabic","french", "chinese", "german"]
 *         description: Select Language  to get response Messages in selected language  
 *         required: false 
 *       - name: id
 *         in: path
 *         description: ID of the video to fetch
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
 * /video/{id}:
 *   delete:
 *     summary: Delete video by video Id
 *     tags:
 *       - Videos
 *     parameters:
 *       - name: Accept-Language
 *         in: header
 *         enum: [ "english", "arabic","french", "chinese", "german"]
 *         description: Select Language  to get response Messages in selected language  
 *         required: false 
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
 *       - name: Accept-Language
 *         in: header
 *         enum: [ "english", "arabic","french", "chinese", "german"]
 *         description: Select Language  to get response Messages in selected language  
 *         required: false 
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
 *       - name: Accept-Language
 *         in: header
 *         enum: [ "english", "arabic","french", "chinese", "german"]
 *         description: Select Language  to get response Messages in selected language  
 *         required: false 
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
 *       - name: Accept-Language
 *         in: header
 *         enum: [ "english", "arabic","french", "chinese", "german"]
 *         description: Select Language  to get response Messages in selected language  
 *         required: false 
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
 *         description: Comment liked successfully
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
 *       - name: Accept-Language
 *         in: header
 *         enum: [ "english", "arabic","french", "chinese", "german"]
 *         description: Select Language  to get response Messages in selected language  
 *         required: false 
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
 *       - name: Accept-Language
 *         in: header
 *         enum: [ "english", "arabic","french", "chinese", "german"]
 *         description: Select Language  to get response Messages in selected language  
 *         required: false 
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
 *         description: Comment reply successfully
 *       400:
 *         description: Invalid Comment Id
 *       500:
 *         description: Something went wrong
 */


/**
 * @swagger
 * /friends/impact:
 *   get:
 *     summary: Get friends Impacts
 *     tags:
 *       - Videos
 *     parameters:
 *       - name: Accept-Language
 *         in: header
 *         enum: [ "english", "arabic","french", "chinese", "german"]
 *         description: Select Language  to get response Messages in selected language  
 *         required: false 
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token  
 *       - name: page
 *         in: query
 *         description: Add Number of Page.
 *         required: false
 *       - name: pageSize
 *         in: query
 *         description: Describe the number of records in Page.
 *         required: false  
 *     responses:
 *       200:
 *         description: Friends' impact videos retrieved successfully
 *       401:
 *         description: Correct  Authorization Token Required!
 *       404:
 *         description: Bad request
 *       400:
 *         description: No Records Found
 */



/**
 * @swagger
 * /video/upload:
 *   post:
 *     summary:  Get encoded video and thumbnail url 
 *     tags:
 *       - Videos
 *     parameters:
 *       - name: Accept-Language
 *         in: header
 *         enum: [ "english", "arabic","french", "chinese", "german"]
 *         description: Select Language  to get response Messages in selected language  
 *         required: false 
 *       - name: Authorization
 *         in: header
 *         description: Authorization Token
 *       - name: video
 *         in: formData
 *         type: file
 *         description: Embed a  video to upload
 *         required: true   
 *     responses:
 *       200:
 *         description: Video uploaded Sucessfully
 *       401:
 *         description: Correct  Authorization Token Required!
 *       404:
 *         description: Bad request
 *       400:
 *         description: Internal server error
 */

/**
 * @swagger
 * /video/{id}/watch:
 *   patch:
 *     summary: Add views Count in video
 *     tags:
 *       - Videos
 *     parameters:
 *       - name: Accept-Language
 *         in: header
 *         enum: [ "english", "arabic","french", "chinese", "german"]
 *         description: Select Language  to get response Messages in selected language  
 *         required: false 
 *       - name: id
 *         in: path
 *         description: ID of the video to watch 
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Video watch count has been updated.
 *       401:
 *         description: Correct  Authorization Token Required!
 *       404:
 *         description: Bad request
 *       400:
 *         description: Internal server error
 */