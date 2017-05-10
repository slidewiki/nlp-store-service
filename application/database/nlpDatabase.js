/*
Controller for handling mongodb and the data model slide while providing CRUD'ish.
*/

'use strict';

const helper = require('./helper'),
    co = require('../common');

function get(deckId) {
    return helper.connectToDatabase()
        .then((db) => db.collection('nlp'))
        .then((col) => col.findOne({
            deckId: deckId
        }));
}

function insert(nlpResult) {
    return helper.connectToDatabase()
        .then((db) => db.collection('nlp'))
        .then((col) => {
            // if already exists, overwrite it
            return col.findOneAndReplace(
                { deckId: nlpResult.deckId },
                nlpResult,
                { upsert:true, returnOriginal:false }
            );
        });
}

function getCount(query){
    return helper.connectToDatabase()
        .then((db) => db.collection('nlp'))
        .then((col) => col.find(query).count());
}

function getTermFrequencies(deckId){

    return get(deckId).then( (nlpResult) => {
        // TODO: if not found, compute nlp now
        if(!nlpResult)  return;

        let {
            detectedLanguage,
            wordFrequenciesExclStopwords,
            NERFrequencies,
            DBPediaSpotlightURIFrequencies
        } = nlpResult;

        let promises = [];

        wordFrequenciesExclStopwords.forEach( (item) => {
            promises.push(getCount({
                'wordFrequenciesExclStopwords.entry': item.entry
            }).then( (freq) => {
                item.frequencyOtherDecks = freq;
            }));
            promises.push(getCount({
                'wordFrequenciesExclStopwords.entry': item.entry,
                'detectedLanguage': detectedLanguage
            }).then( (freq) => {
                item.frequencyOtherDecksWithLanguageRestriction = freq;
            }));
        });

        NERFrequencies.forEach( (item) => {
            promises.push(getCount({
                'NERFrequencies.entry': item.entry
            }).then( (freq) => {
                item.frequencyOtherDecks = freq;
            }));
            promises.push(getCount({
                'NERFrequencies.entry': item.entry,
                'detectedLanguage': detectedLanguage
            }).then( (freq) => {
                item.frequencyOtherDecksWithLanguageRestriction = freq;
            }));
        });

        DBPediaSpotlightURIFrequencies.forEach( (item) => {
            promises.push(getCount({
                'DBPediaSpotlightURIFrequencies.entry': item.entry
            }).then( (freq) => {
                item.frequencyOtherDecks = freq;
            }));
            promises.push(getCount({
                'DBPediaSpotlightURIFrequencies.entry': item.entry,
                'detectedLanguage': detectedLanguage
            }).then( (freq) => {
                item.frequencyOtherDecksWithLanguageRestriction = freq;
            }));
        });

        return Promise.all(promises).then( () => {
            return {
                wordFrequenciesExclStopwords,
                NERFrequencies,
                DBPediaSpotlightURIFrequencies
            };
        });
    });
}

module.exports = { get, getCount, insert, getTermFrequencies };
