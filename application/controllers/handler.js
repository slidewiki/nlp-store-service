/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/

'use strict';

const boom = require('boom');
const nlpDB = require('../database/nlpDatabase');

module.exports = {
    
    getDeckNLP: function(request, reply){
        nlpDB.get(request.params.deckId).then( (nlpResult) => {
            if(!nlpResult){
                reply(boom.notFound());
            }
            else{
                reply(nlpResult);
            }
        }).catch( (err) => {
            request.log('error', err.message);
            reply(boom.badImplementation());
        });
    },

    getNumberOfDecks: function(request, reply){
        let query = {};

        // add filter
        if(request.query.field && request.query.value){
            query[decodeURIComponent(request.query.field)] = decodeURIComponent(request.query.value);
        }

        // add language filter
        if(request.query.detectedLanguage){
            query.detectedLanguage = request.query.detectedLanguage;
        }

        // console.log(query);
        nlpDB.getCount(query).then( (count) => {
            reply(count);
        }).catch( (err) => {
            request.log('error', err);
            reply(boom.badImplementation());
        });
    },

    getTermFrequencies: function(request, reply){
        nlpDB.getTermFrequencies(request.params.deckId).then( (termFreq) => {
            if(!termFreq){
                reply(boom.notFound());
            }
            else{
                reply(termFreq);
            }
        }).catch( (err) => {
            request.log('error', err);
            reply(boom.badImplementation());
        });
    }
};
