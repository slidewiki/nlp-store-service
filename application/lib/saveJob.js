'use strict';

const agenda = require('./agenda');

module.exports = (name, data) => {
    return new Promise( (resolve, reject) => {
        let job = agenda.create(name, data);

        // ensure there is only one instance of this job with the same deck id
        job.unique({
            'data.deckId': data.deckId
        });
        
        // in order to avoid duplicates
        job.schedule('one second');

        job.save( (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};