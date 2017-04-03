'use strict';

const rp = require('request-promise-native');
const Microservices = require('../configs/microservices');

const deckConfidence = 0.6, slideConfidence = 0.6;

module.exports = {

    nlpForDeck: function(deckId){
        return rp.get({
            uri: Microservices.nlp.uri + '/nlp/nlpForDeck/' + deckId +
                '?dbpediaSpotlightConfidenceForSlide=' + slideConfidence +
                '&dbpediaSpotlightConfidenceForDeck=' + deckConfidence,
            json: true,
        });
    }
};
