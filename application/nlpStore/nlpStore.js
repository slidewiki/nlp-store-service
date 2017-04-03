'use strict';

const nlpService = require('../services/nlp'),
    deckService = require('../services/deck'),
    nlpDB = require('../database/nlpDatabase'),
    async = require('async');

function handleDeckUpdate(deckId){
    // console.log('deck ' + deckId);
    return nlpService.nlpForDeck(deckId).then( (nlpResult) => nlpDB.insert(nlpResult));
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
            handleDeckUpdate(deckId).then( () => {
                callback();
            }).catch( (err) => {
                console.log('slide update: deck id ' + deckId + ' - NLP errored: ' + err.message);
                callback();
            });
        });
    });
}


module.exports = { handleDeckUpdate, handleSlideUpdate };
