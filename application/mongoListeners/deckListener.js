'use strict';

const MongoStream = require('mongo-trigger'),
    mongoConfig = require('../configuration').MongoDB;
const agenda = require('agenda');
const deckService = require('../services/deck');
// const { promisify } = require('util');
const saveJob = require('../lib/saveJob');

async function queueUpdate(id) {
    let deepUsage = await deckService.getDeckDeepUsage(id);

    let deckIds = deepUsage.map( (item) => item.id);
    
    // add own deck id to the decks that need to be updated
    // hint: /deck/:id/deepUsage doesn't include self
    deckIds.push(id);

    try {
        for (let deckId of deckIds) {
            await saveJob('nlpUpdate', { deckId });
        }
    } catch(err) {
        console.warn(err.message);
    }
}

module.exports = {
    listen: function(){

        // init data stream
        let decksStream = new MongoStream({
            format: 'pretty',
            host: mongoConfig.HOST,
            port: mongoConfig.PORT,
        });

        // watch decks collection
        let deckCollection = mongoConfig.SLIDEWIKIDATABASE + '.decks';
        decksStream.watch(deckCollection, (event) => {
            // console.log('\ndeck ' + JSON.stringify(event));

            switch(event.operation){
                case 'insert':
                    queueUpdate(event.data._id).catch( (err) => {
                        console.warn('deck listener: deck ' + event.data._id + ' - ' + err.message);
                    });
                    break;
                case 'update':
                    queueUpdate(event.targetId).catch( (err) => {
                        console.warn('deck listener: deck ' + event.targetId + ' - ' + err.message);
                    });
                    break;
            }
        });
    }
};
