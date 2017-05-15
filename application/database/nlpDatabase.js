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

function getAggregateCounts(field, deckId, terms, language){

    // $match docs that have specified terms
    let matchTerms = {};
    matchTerms.$match = {};
    matchTerms.$match[`${field}.entry`] = {
        $in: terms
    };

    // $project only the required fields
    let projectFields = {};
    projectFields.$project = {
        'deckId': 1,
        'detectedLanguage': 1
    };
    projectFields.$project[`${field}`] = 1;

    // $unwind the field that we are interested in
    let unwindField = {};
    unwindField.$unwind = `$${field}`;

    // $group terms and their counts per language and also keep frequencies
    // of terms in each deck
    let groupTermsPerLang = {};
    groupTermsPerLang.$group = {};
    groupTermsPerLang.$group._id = {};
    groupTermsPerLang.$group._id.term = `$${field}.entry`;
    groupTermsPerLang.$group._id.language = '$detectedLanguage';

    groupTermsPerLang.$group.countPerDeck = {};
    groupTermsPerLang.$group.countPerDeck.$push = {};
    groupTermsPerLang.$group.countPerDeck.$push.deckId = '$deckId';
    groupTermsPerLang.$group.countPerDeck.$push.frequency = `$${field}.frequency`;

    groupTermsPerLang.$group.count = { $sum: 1 };

    return helper.connectToDatabase()
        .then((db) => db.collection('nlp'))
        .then((col) => {
            return col.aggregate(
                [
                    matchTerms,
                    projectFields,
                    unwindField,
                    matchTerms,
                    groupTermsPerLang,
                    {
                        $group: {
                            _id: '$_id.term',
                            countPerLang: {
                                $push: {
                                    language: '$_id.language',
                                    count: '$count',
                                    countPerDeck: '$countPerDeck'
                                }
                            },
                            totalCount: { $sum: '$count' }
                        }
                    },
                    {
                        $unwind: '$countPerLang'
                    },
                    {
                        $match: {
                            'countPerLang.language': language
                        }
                    },
                    {
                        $unwind: '$countPerLang.countPerDeck'
                    },
                    {
                        $match: {
                            'countPerLang.countPerDeck.deckId': deckId
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            entry: '$_id',
                            frequency: '$countPerLang.countPerDeck.frequency',
                            frequencyOtherDecks: '$totalCount',
                            frequencyOtherDecksWithLanguageRestriction: '$countPerLang.count'
                        }
                    }
                ]
            );
        }).then((cursor) => cursor.toArray());
}

function getTermFrequencies(deckId){

    return get(deckId).then( (nlpResult) => {
        // TODO: if not found, compute nlp now
        if(!nlpResult)  return;

        let frequencies = {};

        let words = nlpResult.wordFrequenciesExclStopwords.map( (item) => { return item.entry; });
        let wordFrequenciesPromise = getAggregateCounts('wordFrequenciesExclStopwords', deckId, words, nlpResult.detectedLanguage)
        .then( (wordFreq) => {
            frequencies.wordFrequenciesExclStopwords = wordFreq;
        });

        let namedEntities = nlpResult.NERFrequencies.map( (item) => { return item.entry; });
        let NERFrequenciesPromise = getAggregateCounts('NERFrequencies', deckId, namedEntities, nlpResult.detectedLanguage)
        .then( (namedEntitiesFreq) => {
            frequencies.NERFrequencies = namedEntitiesFreq;
        });

        let spotlightEntities = nlpResult.DBPediaSpotlightURIFrequencies.map( (item) => { return item.entry; });
        let spotlightEntitiesPromise = getAggregateCounts('DBPediaSpotlightURIFrequencies', deckId, spotlightEntities, nlpResult.detectedLanguage)
        .then( (spotlightEntitiesFreq) => {
            frequencies.DBPediaSpotlightURIFrequencies = spotlightEntitiesFreq;
        });

        return Promise.all([
            wordFrequenciesPromise,
            NERFrequenciesPromise,
            spotlightEntitiesPromise
        ]).then( () => {
            return frequencies;
        });
    });
}

module.exports = { get, getCount, insert, getTermFrequencies };
