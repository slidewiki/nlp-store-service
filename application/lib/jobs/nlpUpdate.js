'use strict';

const nlp = require('../../nlpStore/nlpStore.js');

module.exports = (agenda) => {
    agenda.define('nlpUpdate', (job, done) => {
        let data = job.attrs.data;
        nlp.updateNLPForDeck(
            data.deckId
        ).then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });
};