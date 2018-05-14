'use strict';

const nlp = require('../../nlpStore/nlpStore.js');
const jobProgress = require('../agendaJobProgress');

module.exports = (agenda) => {
    agenda.define('nlp_update', (job, done) => {
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