/**
 * @api {get} /photos/:idOrSlug Request single Photo information
 * @apiName GetSinglePhoto
 * @apiGroup Photo
 *
 * @apiParam {any} idOrSlug Photo's unique ID or slug.
 *
 * @apiSuccess {Number} id Unique ID of the Photo.
 * @apiSuccess {String} country Country where the Photo was taken.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 1,
 *       "country": "Mexico"
 *     }
 *
 * @apiError PhotoNotFound The id of the Photo was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "PhotoNotFound"
 *     }
 */
