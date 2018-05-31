'use strict';

const Agenda = require('agenda');
const dbConfig = require('../configuration').MongoDB;
const { agendaConfig } = require('../configuration');

// graceful stop so as to unlock currently running jobs
function gracefulStop() {
    console.log('Agenda gracefully stopped');
    agenda.stop( () => {
        process.exit(0);
    });
}

// TODO maybe use another database as this is only transient persistance ?
let connectionString = `mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.SLIDEWIKIDATABASE}`;

let agenda = new Agenda({
    db: {
        address: connectionString,
        collection: agendaConfig.AGENDA_JOBS_COLLECTION,
    },

    // number of a specific job running concurrently
    defaultConcurrency: agendaConfig.AGENDA_JOBS_CONCURRENCY,
});

let jobTypes = process.env.JOB_TYPES ? process.env.JOB_TYPES.split(',') : [];

jobTypes.forEach((type) => {
    require('./jobs/' + type)(agenda);
});

if (jobTypes.length) {
    // we are a worker
    agenda.on('ready', () => {
        agenda.start();
        console.log('Agenda listener is waiting for jobs');
    });

    // also log stuff
    agenda.on('start', (job) => {
        console.log('Job %s started for deck %s', job.attrs.name, job.attrs.data.deckId);
    });
    agenda.on('success', (job) => {
        console.log('Job %s completed successfully for deck %s', job.attrs.name, job.attrs.data.deckId);
    });
    agenda.on('fail', (err, job) => {
        console.warn('Job %s for deck %s failed', job.attrs.name, job.attrs.data.deckId);
        console.warn(err.message);
    });

    process.on('SIGTERM', gracefulStop);
    process.on('SIGINT' , gracefulStop);
}

module.exports = agenda;