/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search the Records 
 *     tags:
 *       - Search
 *     parameters:
 *       - name: Accept-Language
 *         in: header
 *         enum: [ "english", "arabic","french", "chinese", "german"]
 *         description: Select Language  to get response Messages in selected language  
 *         required: false 
 *       - name: lat
 *         in: query
 *         description: Add the latitude to find records located in the given location.
 *         required: false
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
 *         schema: 
 *         type: array
 *         items: 
 *          type: string  
 *          example: animal
 *       - name: hashtags
 *         in: query
 *         description: Add hashtags to search records by hastags
 *         required: false
 *         type: string 
 *         example: environment 
 *       - name: recordType
 *         in: query
 *         enum: [ "Campaigns", "Users","Impact", "Issues", "Hashtags", "Skills"]
 *         description: Add the records type
 *         required: false
 *     responses:
 *       200:
 *         description: Records retrieved  successfully.
 *       500: 
 *             description: Internal server error
*/


/**
 * @swagger
 * /searchkeywords/trending:
 *   get:
 *     summary: Search the Records 
 *     tags:
 *       - Search
 *     parameters:
 *       - name: Accept-Language
 *         in: header
 *         enum: [ "english", "arabic","french", "chinese", "german"]
 *         description: Select Language  to get response Messages in selected language  
 *         required: false 
 *       - name: page
 *         in: query
 *         description: Add Number of Page.
 *         required: false
 *       - name: pageSize
 *         in: query
 *         description: Describe the number of records in Page.
 *         required: false
 *       - name: searchKey
 *         in: query
 *         description: Add text to search
 *         required: false
 *     responses:
 *       200:
 *         description: Records retrieved  successfully.
 *       500: 
 *             description: Internal server error
*/
