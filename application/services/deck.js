'use strict';

const rp = require('request-promise-native');
const Microservices = require('../configs/microservices');

module.exports = {

    getSlide: function(slideId){
        return rp.get({
            uri: Microservices.deck.uri + '/slide/' + slideId,
            json: true,
        });
    }, 

    getDeckDeepUsage: function(id){
        return rp.get({
            uri: `${Microservices.deck.uri}/deck/${id}/deepUsage`,
            json: true,
        });
    }
};
