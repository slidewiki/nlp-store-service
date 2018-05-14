'use strict';

const MongoStream = require('mongo-trigger'),
    nlpStore = require('../nlpStore/nlpStore'),
    mongoConfig = require('../configuration').MongoDB;

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
                    nlpStore.handleDeckUpdate(event.data._id).catch( (err) => {
                        console.log('deck listener: deck ' + event.data._id + ' - ' + err.message);
                    });
                    break;
                case 'update':
                    nlpStore.handleDeckUpdate(event.targetId).catch( (err) => {
                        console.log('deck listener: deck ' + event.targetId + ' - ' + err.message);
                    });
                    break;
            }
        });
    }
};
