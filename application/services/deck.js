'use strict';

const rp = require('request-promise-native');
const Microservices = require('../configs/microservices');

module.exports = {

    getSlide: function(slideId){
        return rp.get({
            uri: Microservices.deck.uri + '/slide/' + slideId,
            json: true,
        });
    }
};
