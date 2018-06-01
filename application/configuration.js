/* This module is used for configurating the mongodb connection*/
'use strict';

const co = require('./common');

function check(config){
    for(let key in config){
        if(!config[key]){
            console.error('Config Error: ' + key + ' is not defined');
            process.exit(1);
        }
    }
}

let host = 'localhost';
//read mongo URL from /etc/hosts
const fs = require('fs');
try {
    const lines = fs.readFileSync('/etc/hosts').toString().split('\n');
    lines.filter((line) => line.includes('mongodb')).forEach((line) => {
        const entries = line.split(' ');
        host = entries[entries.length - 1];
        console.log('Using ' + host + ' as database host.');
    });
} catch (e) {
    console.log('Exception: Windows or no read rights to read /etc/hosts (bad)');
}
//read mongo URL from ENV
host = (!co.isEmpty(process.env.DATABASE_URL)) ? process.env.DATABASE_URL : host;
if(host !== 'localhost')
    console.log('Using ' + host + ' as database host.');

let port = 27017;
//read mongo port from ENV
if (!co.isEmpty(process.env.DATABASE_PORT)){
    port = process.env.DATABASE_PORT;
    console.log('Using ' + port + ' as database port.');
}

let slidewikiDbName = 'slidewiki';
if (process.env.NODE_ENV === 'test') {
    slidewikiDbName = 'slidewiki_test';
}


let mongoConfig = {
    PORT: port,
    HOST: host,
    NS: 'local',
    SLIDEWIKIDATABASE: slidewikiDbName
};

console.log('#=========================== MONGO CONFIG ===========================#');
console.log(JSON.stringify(mongoConfig, null, 4));
console.log();

// find solr config ENV variables
// default - give error
let solrConfig = {};
solrConfig.HOST = (!co.isEmpty(process.env.SOLR_HOST)) ? process.env.SOLR_HOST : 'solr';
solrConfig.PORT = (!co.isEmpty(process.env.SOLR_CONFIG_PORT)) ? process.env.SOLR_CONFIG_PORT : '8983';
solrConfig.CORE = (!co.isEmpty(process.env.SOLR_CORE)) ? process.env.SOLR_CORE : 'swiknlp';
solrConfig.PATH = (!co.isEmpty(process.env.SOLR_PATH)) ? process.env.SOLR_PATH : '/solr';
solrConfig.PROTOCOL = (!co.isEmpty(process.env.SOLR_PROTOCOL)) ? process.env.SOLR_PROTOCOL : 'http';
//local testing SOLR config:
// solrConfig.HOST = (!co.isEmpty(process.env.SOLR_HOST)) ? process.env.SOLR_HOST : 'slidewiki.imis.athena-innovation.gr';
//production SOLR config:
solrConfig.HOST = (!co.isEmpty(process.env.SOLR_HOST)) ? process.env.SOLR_HOST : 'solr';

console.log('#=========================== SOLR CONFIG ===========================#');
console.log(JSON.stringify(solrConfig, null, 4));
console.log();

check(solrConfig);

let agendaJobsCollection = (!co.isEmpty(process.env.AGENDA_JOBS_COLLECTION)) ? process.env.AGENDA_JOBS_COLLECTION : 'agendaJobs';
let agendaJobsConcurrency = (!co.isEmpty(process.env.AGENDA_JOBS_CONCURRENCY)) ? process.env.AGENDA_JOBS_CONCURRENCY : 1;

let agendaConfig = {
    AGENDA_JOBS_COLLECTION: agendaJobsCollection, 
    AGENDA_JOBS_CONCURRENCY: agendaJobsConcurrency,
};

check(agendaConfig);

console.log('#=========================== SOLR CONFIG ===========================#');
console.log(JSON.stringify(agendaConfig, null, 4));
console.log();

module.exports = {
    MongoDB: mongoConfig, 
    solrConfig: solrConfig, 
    agendaConfig: agendaConfig,
};
