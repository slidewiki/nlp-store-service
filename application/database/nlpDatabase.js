/*
Controller for handling mongodb and the data model slide while providing CRUD'ish.
*/

'use strict';

const helper = require('./helper'),
    co = require('../common');

function get(deckId) {
    return helper.connectToDatabase()
        .then((db) => db.collection('nlp'))
        .then((col) => col.findOne({
            deckId: deckId
        }));
}

function insert(nlpResult) {
    return helper.connectToDatabase()
        .then((db) => db.collection('nlp'))
        .then((col) => {
            // if already exists, overwrite it
            return col.findOneAndReplace(
                { deckId: nlpResult.deckId },
                nlpResult,
                { upsert:true }
            );
        });
}
//
// function replace(tagName, tag) {
//     return helper.connectToDatabase()
//         .then((db) => db.collection('tags'))
//         .then((col) => {
//             let valid = false;
//             try {
//                 valid = tagModel(tag);
//                 if (!valid) {
//                     return tagModel.errors;
//                 }
//                 // set timestamp
//                 tag.timestamp = (new Date()).toISOString();
//
//                 return col.findOneAndReplace({
//                     tagName: tagName
//                 }, tag);
//             } catch (e) {
//                 console.log('validation failed', e);
//             }
//             return;
//         });
// }

// function bulkUpload(tags, user){
//     try {
//         let promises = [];
//
//         tags.forEach( (newTag) => {
//             newTag.user = user;
//             promises.push(insert(newTag));
//         });
//
//         return Promise.all(promises);
//     } catch (e) {
//         console.log('validation failed', e);
//     }
//     return;
// }
//
// function suggest(q, limit){
//
//     let query = {tagName: new RegExp('^' + co.escape(q), 'i')};
//     let projection = {
//         _id: 0,
//         tagName: 1,
//         name: 1,
//         uri: 1,
//     };
//     return helper.connectToDatabase()
//     .then((db) => db.collection('tags'))
//     .then((col) => col.find(query, projection)
//                         .skip(0)    // offeset
//                         .limit(parseInt(limit)))
//     .then((cursor) => cursor.toArray());
//
// }

module.exports = { get, insert };
