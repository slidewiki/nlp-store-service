'use strict';
const _ = require('lodash');

let self = module.exports = {
    getTfDf: function(termVectors, language, deckId, languageFilter, minFreq, nlpResult) {
        if(_.isEmpty(termVectors)) return {};

        let langSuffix = `_${language}`;
        let parseFunc = (languageFilter) ? this.parseLangField.bind(this) : this.parse.bind(this);

        let tokens = Object.keys(termVectors.token || []);
        let tfidf = {};
        tfidf.wordFrequenciesExclStopwords = {};
        tfidf.wordFrequenciesExclStopwords = parseFunc(tokens, langSuffix, termVectors.token, minFreq);
        this.addFreqInDeckTitle(nlpResult, 'wordFrequenciesExclStopwords', tfidf);

        let spotlightentities = Object.keys(termVectors.spotlightentity || []);
        tfidf.DBPediaSpotlightURIFrequencies = {};
        tfidf.DBPediaSpotlightURIFrequencies = parseFunc(spotlightentities, langSuffix, termVectors.spotlightentity, minFreq);
        this.addFreqInDeckTitle(nlpResult, 'DBPediaSpotlightURIFrequencies', tfidf);

        let namedentities = Object.keys(termVectors.namedentity || []);
        tfidf.NERFrequencies = {};
        tfidf.NERFrequencies = parseFunc(namedentities, langSuffix, termVectors.namedentity, minFreq);
        this.addFreqInDeckTitle(nlpResult, 'NERFrequencies', tfidf);

        return tfidf;    
    },

    addFreqInDeckTitle: function(nlpResult, field, tfidf){
        (nlpResult[field] || [])
        .filter( (item) => item.hasOwnProperty('frequencyInDeckTitle'))
        .forEach( (itemInTitle) => {
            let found = tfidf[field].find( (itemInField) => itemInField.entry === itemInTitle.entry);
            if(found)
                found.frequencyInDeckTitle = itemInTitle.frequencyInDeckTitle;
        });
    },

    parseLangField: function(keys, suffix, termVectorsForField, minFreq){
        return keys.filter( (item) => item.endsWith(suffix))
        .map( (item) => {
            if(termVectorsForField[item].tf < minFreq)
                return;

            return {
                entry: this.removeSuffix(item),
                frequency: termVectorsForField[item].tf, 
                frequencyOtherDecks: termVectorsForField[item].df 
            };
        }).filter(Boolean);
    }, 

    parse: function(keys, suffix, termVectorsForField, minFreq){
        return keys.filter( (item) => !item.endsWith(suffix))
        .map( (item) => {
            if(termVectorsForField[item].tf < minFreq)
                return;

            return {
                entry: item,
                frequency: termVectorsForField[item].tf, 
                frequencyOtherDecks: termVectorsForField[item].df 
            };
        }).filter(Boolean);;
    }, 

    removeSuffix: function(term){
        return term.substr(0, term.lastIndexOf('_'));
    }
};