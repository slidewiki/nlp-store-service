'use strict';

const solr = require('solr-client'),
    config = require('../configuration').solrConfig,
    rp = require('request-promise-native'),
    solrUri = `${config.PROTOCOL}://${config.HOST}:${config.PORT}${config.PATH}/${config.CORE}`,
    client = solr.createClient({
        host: config.HOST,
        port: config.PORT,
        core: config.CORE,
        path: config.PATH,
        secure: (config.PROTOCOL === 'https')
    });
const querystring = require('querystring');

let self = module.exports = {
    add: function(data){
        return new Promise( (resolve, reject) => {
            client.add(data, (err, obj) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(obj);
                }
            });
        });
    },

    commit: function(){
        client.commit();
    },

    query: function(queryParams, requestHandler){
        let queryString = querystring.stringify(queryParams);
        let requestUri = `${solrUri}/${requestHandler}?${queryString}`;

        // console.log(requestUri);
        return rp.get({
            uri: requestUri, 
            json: true
        });
    },

    // delete solr documents by query with commit changes option
    delete: function(query, commit=false){
        return rp.get({
            uri: `${solrUri}/update?stream.body=<delete><query>${query}</query></delete>&commit=${commit}`
        });
    }, 

    getTermVectors: function(deckId){
        // params for term-vector component
        // requesting term-vectors for field: token, namedentity and spotlightentity
        let query = {
            q: `solr_id:deck_${deckId}`, 
            rows: 1, 
            indent: false, 
            tv: true, 
            'tv.tf': true, 
            'tv.df': true, 
            'tv.fl': ['token', 'namedentity', 'spotlightentity'], 
            fl: 'solr_id', 
            'json.nl': 'map'
        };
        return this.query(query, 'tvrh').then( (response) => response.termVectors[`deck_${deckId}`]);
    }, 

    countDecks: function(language){
        let query = {};
        query.q = '*:*';
        query.fl = 'solr_id';

        if(language) query.fq = `language:${language}`;
        
        return this.query(query, 'select').then( (response) => response.response.numFound);
    }, 
};
