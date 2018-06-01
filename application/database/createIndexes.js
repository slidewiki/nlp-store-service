'use strict';

const helper = require('./helper');

// this function should include commands that create indexes (if any)
// for any collections that the service may be using

// it should always return a promise
module.exports = function() {

    let nlpIndexes = helper.getCollection('nlp').then((decks) => {
        return decks.createIndexes([
            { key: {'deckId': 1} },
            { key: {'detectedLanguage': 1} },
            { key: {'wordFrequenciesExclStopwords.entry': 1} },
            { key: {'NERFrequencies.entry': 1} },
            { key: {'DBPediaSpotlightURIFrequencies.entry': 1} },
            { key: {'data.deckId' : 1} },
        ]);
    });


    let agendaIndexes = helper.getCollection('agendaJobs').then((decks) => {
        return decks.createIndexes([
            { key: {'data.deckId' : 1} },
        ]);
    });

    return Promise.all([nlpIndexes, agendaIndexes]);

};
