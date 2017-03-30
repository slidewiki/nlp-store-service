'use strict';

const nlpService = require('../services/nlp'),
    deckService = require('../services/deck'),
    nlpDB = require('../database/nlpDatabase');
    
function handleDeckUpdate(deckId){
    return nlpService.nlpForDeck(deckId).then( (nlpResult) => nlpDB.insert(nlpResult));
}


function handleSlideUpdate(slideId){
    console.log(slideId);
}


module.exports = { handleDeckUpdate, handleSlideUpdate };
