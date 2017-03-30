/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
    co = require('../common'),
    async = require('async');

const nlpStore = require('../nlpStore/nlpStore'),
    deckDB = require('../database/deckDatabase'),
    nlpDB = require('../database/nlpDatabase'),
    nlpService = require('../services/nlp');

module.exports = {
    //Get slide from database or return NOT FOUND
    // getSlide: function(request, reply) {
    //     slideDB.get(encodeURIComponent(request.params.id)).then((slide) => {
    //         if (co.isEmpty(slide))
    //             reply(boom.notFound());
    //         else
    //             reply(co.rewriteID(slide));
    //     }).catch((error) => {
    //         request.log('error', error);
    //         reply(boom.badImplementation());
    //     });
    // },
    //
    // //Create Slide with new id and payload or return INTERNAL_SERVER_ERROR
    // newSlide: function(request, reply) {
    //     slideDB.insert(request.payload).then((inserted) => {
    //         if (co.isEmpty(inserted.ops[0]))
    //             throw inserted;
    //         else
    //             reply(co.rewriteID(inserted.ops[0]));
    //     }).catch((error) => {
    //         request.log('error', error);
    //         reply(boom.badImplementation());
    //     });
    // },
    //
    // //Update Slide with id id and payload or return INTERNAL_SERVER_ERROR
    // replaceSlide: function(request, reply) {
    //     slideDB.replace(encodeURIComponent(request.params.id), request.payload).then((replaced) => {
    //         if (co.isEmpty(replaced.value))
    //             throw replaced;
    //         else
    //             reply(replaced.value);
    //     }).catch((error) => {
    //         request.log('error', error);
    //         reply(boom.badImplementation());
    //     });
    // },
    init: function(request, reply){
        let limit = 100;
        deckDB.getTotalCount().then( (totalCount) => {
            let offset = 0;
            async.doWhilst(
                (callback) => {
                    deckDB.getAllIds(offset, limit, {_id:1}).then( (allDecks) => {
                        async.eachSeries(allDecks, (deck, callback2) => {
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
                () => { return offset <= totalCount; }
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
    }
};
