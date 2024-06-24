/**
 * @swagger
 * /content/hashtags/{tag}:
 *   get:
 *     summary: Get Content by hastags
 *     tags:
 *       - Hashtags
 *     parameters:
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
