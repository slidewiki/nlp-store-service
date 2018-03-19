/*
These are routes as defined in https://docs.google.com/document/d/1337m6i7Y0GPULKLsKpyHR4NRzRwhoxJnAZNnDFCigkc/edit#
Each route implementes a basic parameter/payload validation and a swagger API documentation description
*/
'use strict';

const Joi = require('joi'),
    handlers = require('./controllers/handler');

module.exports = function(server) {
    
    server.route({
        method: 'GET',
        path: '/nlp/{deckId}',
        handler: handlers.getDeckNLP,
        config: {
            validate: {
                params: {
                    deckId: Joi.string()
                }
            },
            tags: ['api'],
            description: 'Retrieve NLP results for a single deck'
        }
    });

    server.route({
        method: 'GET',
        path: '/statistics/deckCount',
        handler: handlers.getNumberOfDecks,
        config: {
            validate: {
                query: {
                    field: Joi.string(),
                    value: Joi.string(),
                    detectedLanguage: Joi.string()
                }
            },
            tags: ['api'],
            description: 'Retrieve NLP results for a single deck'
        }
    });

    server.route({
        method: 'GET',
        path: '/statistics/termFrequencies/{deckId}',
        handler: handlers.getTermFrequencies,
        config: {
            validate: {
                params: {
                    deckId: Joi.string()
                }
            },
            tags: ['api'],
            description: 'Retrieve term frequencies for single deck'
        }
    });

    server.route({
        method: 'POST',
        path: '/nlp/query',
        handler: handlers.getNLPResults,
        config: {
            validate: {
                payload: Joi.object().keys({
                    query: Joi.string().required().description('Lucene query'), 
                    language: Joi.string().description('Detected language filter'),
                    excludeDeckIds: Joi.string().regex(/[0-9](,[0-9])*/).empty('').description('A comma delimited list of deck ids to exclude from results'), 
                    page: Joi.number().integer().positive().default(1), 
                    pageSize: Joi.number().integer().positive().default(10)
                })
            }, 
            tags: ['api'],
            description: 'Retrieve query results from indexed nlp results'
        }
    });

};
