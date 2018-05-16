/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/
/* eslint promise/always-return: "off" */

'use strict';

const boom = require('boom');
const nlpDB = require('../database/nlpDatabase');
const solr = require('../lib/solrClient');
const util = require('../lib/util');
const nlpStore = require('../nlpStore/nlpStore');
const { promisify } = require('util');
const deckService = require('../services/deck');
const agenda = require('../lib/agenda');

module.exports = {
    
    getDeckNLP: function(request, reply){
        let deckId = request.params.deckId;
        nlpDB.get(deckId).then( (nlpResult) => {
            if(!nlpResult){
                // if nlp result is not already stored, compute it now
                return nlpStore.updateNLPForDeck(deckId).then( () => {
                    return nlpDB.get(deckId).then( (nlpResult) => {
                        if(!nlpResult)
                            reply(boom.notFound());
                        else 
                            reply(nlpResult);
                    });
                });
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
    }, 

    getTfDf: function(request, reply){
        let deckId = request.params.deckId;
        let minFreq = request.query.minFrequencyOfTermOrEntityToBeConsidered;
        let minForLanguageDependent = request.query.minForLanguageDependent;

        nlpDB.get(deckId).then( (nlpResult) => {
            if(!nlpResult){
                // if nlp result is not already stored, compute it now
                nlpStore.updateNLPForDeck(deckId).then( () => {
                    return nlpDB.get(deckId).then( (nlpResult) => {
                        if(!nlpResult){
                            return reply(boom.notFound());
                        }
                        else 
                            return nlpStore.computeTfDf(deckId, nlpResult, minFreq, minForLanguageDependent)
                                .then( (response) => {
                                    reply(response);
                                }); 
                    });
                }).catch( (err) => {
                    if(err.statusCode === 404){
                        return reply(boom.notFound());
                    }else{
                        request.log('error', err);
                        return reply(boom.badImplementation()); 
                    }
                });
            }else{
                return nlpStore.computeTfDf(deckId, nlpResult, minFreq, minForLanguageDependent)
                    .then( (response) => {
                        reply(response);
                    });
            }      
        }).catch( (err) => {
            request.log('error', err);
            reply(boom.badImplementation());
        });
    }, 

    getNLPResults: function(request, reply){
        // basic query
        let query = {};
        query.q = request.payload.query;

        query.fq = [];
        
        // add language filter
        if(request.payload.language){
            query.fq.push(`language:${request.payload.language}`);
        }

        // exclude deck ids
        if(request.payload.excludeDeckIds){
            let deckIdsToExclude = request.payload.excludeDeckIds.split(',').map( (deckId) => {
                return `-_id:${parseInt(deckId)}`;
            });
            query.fq.push(deckIdsToExclude.join(' AND '));
        }
        
        // return and filter only deck ids
        query.fl = '_id, score';
        
        // pagination params
        let start = (request.payload.page - 1) * request.payload.pageSize;
        query.start = start;
        query.rows = request.payload.pageSize;

        solr.query(query, 'query').then( (solrResponse) => {
            let response = solrResponse.response;

            reply({
                numFound: response.numFound, 
                page: request.payload.page,
                pageSize: request.payload.pageSize, 
                items: response.docs
            });
        }).catch( (err) => {
            request.log('error', err);
            reply(boom.badImplementation());
        });
    }, 

    update: async function(type, id) {
        let deepUsage = await deckService.getDeepUsage(type, id);

        let deckIds = deepUsage.map( (item) => item.id);
        
        if(type === 'deck'){
            // add own deck id to the decks that need to be updated
            // hint: /deck/:id/deepUsage doesn't include self
            deckIds.push(id);
        }

        try {
            for (let deckId of deckIds) {
                // add a new job foreach deck in the path till the root deck
                await promisify(agenda.now).bind(agenda)('nlpUpdate', {
                    deckId
                });
            }
        } catch(err) {
            console.warn(err.message);
        }
    },

};
