/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
    // co = require('../common'),
    async = require('async'),
    ProgressBar = require('progress');

const deckDB = require('../database/deckDatabase'),
    nlpDB = require('../database/nlpDatabase'),
    nlpService = require('../services/nlp');

module.exports = {
    init: function(request, reply){
        reply('NLP results are computed for all decks\nPlease check the logs for progress');
        let limit = 100;

        deckDB.getTotalCount().then( (totalCount) => {
            let offset = 0;
            let progressBar = new ProgressBar('Progress [:bar] :percent', { total: totalCount });

            async.doWhilst(
                (callback) => {
                    deckDB.getAllIds(offset, limit, {_id:1}).then( (allDecks) => {
                        async.eachSeries(allDecks, (deck, callback2) => {
                            progressBar.tick();
                            nlpService.nlpForDeck(deck._id).then( (nlpResult) => {
                                nlpDB.insert(nlpResult).then( () => {
                                    callback2();
                                }).catch( (err) => {
                                    console.log('deck ' + deck._id + ': ' + err.message);
                                    callback2();
                                });
                            }).catch( () => {
                                console.log('deck ' + deck._id + ': NLP errored');
                                callback2();
                            });
                        }, () => {
                            offset += limit;
                            callback();
                        });

                    }).catch( (err) => {
                        request.log('error', err.message);
                        reply(boom.badImplementation());
                    });
                },
                () => { return offset <= totalCount; },
                () => { console.log('Initial NLP results have been computed for all decks'); }
            );

        }).catch( (err) => {
            request.log('error', err.message);
            reply(boom.badImplementation());
        });
    },

    initDeck: function(request, reply){
        nlpService.nlpForDeck(request.params.deckId).then( (nlpResult) => {
            nlpDB.insert(nlpResult).then( (res) => {
                reply(res.value);
            }).catch( (err) => {
                request.log('error', err.message);
                reply(boom.badImplementation());
            });
        }).catch( (err) => {
            request.log('error', err.message);
            reply(boom.badImplementation());
        });
    },

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

        console.log(query);
        nlpDB.getCount(query).then( (count) => {
            reply(count);
        }).catch( (err) => {
            request.log('error', err);
            reply(boom.badImplementation());
        });
    }
};
