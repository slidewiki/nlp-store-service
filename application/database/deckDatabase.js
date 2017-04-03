/*
Controller for handling mongodb and the deck model slide while providing CRUD'ish.
*/

'use strict';

const helper = require('./helper');

module.exports = {
    get: function (identifier) {
        return helper.connectToDatabase()
        .then((db) => db.collection('decks'))
        .then((col) => col.findOne({
            _id: identifier
        }));
    },

    getAllIds: function (offset, limit, sorter) {
        return helper.connectToDatabase()
        .then((db) => db.collection('decks'))
        .then((col) => col.find({}, { _id: 1 }).skip(offset).limit(limit).sort(sorter))
        .then((cursor) => cursor.toArray());
    },

    getTotalCount: function(){
        return helper.connectToDatabase()
        .then((db) => db.collection('decks'))
        .then((col) => col.find({}).count());
    }
};
