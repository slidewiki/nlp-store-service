'use strict';
const _ = require('lodash');

let self = module.exports = {
    getTfDf: function(termVectors, language, deckId, languageFilter) {
        if(_.isEmpty(termVectors)) return {};

        let langSuffix = `_${language}`;
        let parseFunc = (languageFilter) ? this.parseLangField.bind(this) : this.parse.bind(this);

        let tokens = Object.keys(termVectors.token || []);
        let tfidf = {};
        tfidf.token = {};
        tfidf.token = parseFunc(tokens, langSuffix, termVectors.token);

        let spotlightentities = Object.keys(termVectors.spotlightentity || []);
        tfidf.spotlightentity = {};
        tfidf.spotlightentity = parseFunc(spotlightentities, langSuffix, termVectors.spotlightentity);
        
        let namedentities = Object.keys(termVectors.namedentity || []);
        tfidf.namedentity = {};
        tfidf.namedentity = parseFunc(namedentities, langSuffix, termVectors.namedentity);

        return tfidf;    
    },

    parseLangField: function(keys, suffix, termVectorsForField){
        return keys.filter( (item) => item.endsWith(suffix))
        .map( (item) => {
            return {
                entry: this.removeSuffix(item),
                tf: termVectorsForField[item].tf, 
                df: termVectorsForField[item].df 
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