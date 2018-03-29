'use strict';
const _ = require('lodash');

let self = module.exports = {
    getTfDf: function(termVectors, language, deckId, languageFilter) {
        if(_.isEmpty(termVectors)) return {};

        let langSuffix = `_${language}`;
        let parseFunc = (languageFilter) ? this.parseLangField.bind(this) : this.parse.bind(this);

        let tokens = Object.keys(termVectors.token || []);
        let tfidf = {};
        tfidf.wordFrequenciesExclStopwords = {};
        tfidf.wordFrequenciesExclStopwords = parseFunc(tokens, langSuffix, termVectors.token);

        let spotlightentities = Object.keys(termVectors.spotlightentity || []);
        tfidf.DBPediaSpotlightURIFrequencies = {};
        tfidf.DBPediaSpotlightURIFrequencies = parseFunc(spotlightentities, langSuffix, termVectors.spotlightentity);
        
        let namedentities = Object.keys(termVectors.namedentity || []);
        tfidf.NERFrequencies = {};
        tfidf.NERFrequencies = parseFunc(namedentities, langSuffix, termVectors.namedentity);

        return tfidf;    
    },

    parseLangField: function(keys, suffix, termVectorsForField){
        return keys.filter( (item) => item.endsWith(suffix))
        .map( (item) => {
            return {
                entry: this.removeSuffix(item),
                frequency: termVectorsForField[item].tf, 
                frequencyOtherDecks: termVectorsForField[item].df 
            };
        });
    }, 

    parse: function(keys, suffix, termVectorsForField){
        return keys.filter( (item) => !item.endsWith(suffix))
        .map( (item) => {
            return {[item]: termVectorsForField[item]};
        });
    }, 

    removeSuffix: function(term){
        return term.substr(0, term.lastIndexOf('_'));
    }
};