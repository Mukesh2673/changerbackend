/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search the Records 
 *     tags:
 *       - Search
 *     parameters:
 *       - name: lat
 *         in: query
 *         description: Add the latitude to find records located in the given location.
 *         required: false
 *       - name: searchKey
 *       - name: lng
 *         in: query
 *         description: Add the longitude to find records located in the given location.
 *         required: false
 *       - name: searchKey
 *         in: query
 *         description: Add text to search
 *         required: false
 *       - name: cause
 *         in: query
 *         description: Add cause to search records
 *         required: false
 *       - name: hashtags
 *         in: query
 *         description: Add hashtags to search records
 *         required: false
 *     responses:
 *       200:
 *         description: Records retrieved  successfully.
 *       500: 
 *             description: Internal server error
*/
