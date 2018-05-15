'use strict';

const MongoStream = require('mongo-trigger'),
    handler = require('../controllers/handler'),
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
                    handler.update('slide', event.data._id).catch( (err) => {
                        console.warn('slide listener: slide ' + event.data._id + ' - ' + err.message);
                    });
                    break;
                case 'update':
                    handler.update('slide', event.targetId).catch( (err) => {
                        console.warn('slide listener: slide ' + event.targetId + ' - ' + err.message);
                    });
                    break;
            }
        });
    }
};
