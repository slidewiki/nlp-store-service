'use strict';

const MongoStream = require('mongo-trigger'),
    nlpStore = require('../nlpStore/nlpStore'),
    mongoConfig = require('../configuration').MongoDB;

module.exports = {
    listen: function(){

        // init data stream
        let slidesStream = new MongoStream({
            format: 'pretty',
            host: mongoConfig.HOST,
            port: mongoConfig.PORT,
        });

        // watch slides collection
        let slideCollection = mongoConfig.SLIDEWIKIDATABASE + '.slides';
        slidesStream.watch(slideCollection, (event) => {
            // console.log('\nslide ' + JSON.stringify(event));

            switch(event.operation){
                case 'insert':
                    nlpStore.handleSlideUpdate(event.data._id).catch( (err) => {
                        console.log(err);
                    });
                    break;
                case 'update':
                    nlpStore.handleSlideUpdate(event.targetId).catch( (err) => {
                        console.log(err);
                    });
                    break;
            }
        });
    }
};
