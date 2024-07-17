/**
 * @swagger
 * /content/hashtags/{tag}:
 *   get:
 *     summary: Get Content by hastags
 *     tags:
 *       - Hashtags
 *     parameters:
 *       - name: Accept-Language
 *         in: header
 *         enum: [ "english", "arabic","french", "chinese", "german"]
 *         description: Select Language  to get response Messages in selected language  
 *         required: false 
 *       - name: tag
 *         in: path
 *         description: Add the hashtag to find records.
 *         required: false
 *     responses:
 *       200:
 *         description: Records retrieved  successfully.
 *       500: 
 *             description: Internal server error
*/
