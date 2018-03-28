'use strict';

const nlpService = require('../services/nlp'),
    deckService = require('../services/deck'),
    nlpDB = require('../database/nlpDatabase'),
    async = require('async');

const solr = require('../lib/solrClient');
const _ = require('lodash');

function updateNLPForDeck(deckId){
    return nlpService.nlpForDeck(deckId).then( (nlpResult) => {
        return nlpDB.insert(nlpResult).then( () => {
            return indexNLPResult(nlpResult);
        });
    });
}

function handleSlideUpdate(slideId){
    // console.log('slide ' + slideId);
    return deckService.getSlide(slideId).then( (slide) => {

        // find usage set of all slide revisions
        let usageSet = new Set();
        for(let i in slide.revisions){
            slide.revisions[i].usage.forEach( (u) => {
                usageSet.add(u.id);
            });
        }

        // update each parent deck in the usage set
        async.eachSeries(usageSet, (deckId, callback) => {
            updateNLPForDeck(deckId).then( () => {
                callback();
            }).catch( (err) => {
                console.log('slide update: deck id ' + deckId + ' - NLP errored: ' + err.message);
                callback();
            });
        });
    });
}

function indexNLPResult(result){

    // expand named entities, spotlight entities and tokens according to their frequency
    let namedEntities = result.NERFrequencies.map( (item) => {
        return _.fill(Array(item.frequency), item.entry);
    });
    namedEntities = _.flatten(namedEntities);

    let namedEntitiesWithLang = namedEntities.map( (item) => `${item}_${result.detectedLanguage}`);
    namedEntities = namedEntities.concat(namedEntitiesWithLang);

    let spotlightEntities = result.DBPediaSpotlightURIFrequencies.map( (item) => {
        return _.fill(Array(item.frequency), item.entry);
    });
    spotlightEntities = _.flatten(spotlightEntities);

    let spotlightEntitiesWithLang = spotlightEntities.map( (item) => `${item}_${result.detectedLanguage}`);
    spotlightEntities = spotlightEntities.concat(spotlightEntitiesWithLang);

    let tokens = result.wordFrequenciesExclStopwords.map( (item) => {
        return _.fill(Array(item.frequency), item.entry);
    });
    tokens = _.flatten(tokens);

    let tokensWithLang = tokens.map( (item) => `${item}_${result.detectedLanguage}`);
    tokens = tokens.concat(tokensWithLang);

    // form solr doc and add it to solr
    let doc = {
        solr_id: `deck_${result.deckId}`,
        _id: parseInt(result.deckId), 
        namedentity: namedEntities,
        spotlightentity: spotlightEntities,
        token: tokens,
        language: result.detectedLanguage
    };
    
    return solr.add(doc);
}


module.exports = { updateNLPForDeck, handleSlideUpdate, indexNLPResult };
