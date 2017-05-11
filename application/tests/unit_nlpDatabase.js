// example unit tests
'use strict';

//Mocking is missing completely TODO add mocked objects

let chai = require('chai');
let chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

chai.should();

let helper = require('../database/helper.js');
let nlpDB = require('../database/nlpDatabase');

describe('nlpDatabase', () => {

    beforeEach( () => {
        return helper.cleanDatabase().then(() =>
            helper.connectToDatabase().then((db) =>
                helper.applyFixtures(db, require('./fixtures/nlpResults.json'))
            )
        );
    });

    context('when querying the nlp results database, it', () => {

        it('should return stored nlp results for a deck', () => {
            let deckId = '31';
            let res = nlpDB.get(deckId);
            return Promise.all([
                res.should.be.fulfilled.and.eventually.not.be.empty,
                res.should.eventually.be.an('object').and.contain.keys('_id', 'deckId', 'children', 'detectedLanguage', 'frequencyOfMostFrequentWord', 'wordFrequenciesExclStopwords', 'DBPediaSpotlight')
            ]);
        });

        it('should return null when nlp results for a deck are not stored', () => {
            let deckId = '12323';
            let res = nlpDB.get(deckId);
            return Promise.resolve(
                res.should.be.fulfilled.and.eventually.be.null
            );
        });

        it('should respond to count queries on the stored nlp results', () => {
            let query = {'detectedLanguage': 'en'};
            let query2 = {'wordFrequenciesExclStopwords.entity': 'test'};

            let res = nlpDB.getCount(query);
            let res2 = nlpDB.getCount(query2);

            return Promise.all([
                res.should.be.fulfilled.and.eventually.equal(1),
                res2.should.be.fulfilled.and.eventually.equal(0)
            ]);
        });

        it('should respond to term freqeuncies for a deck', () => {
            let deckId = '30';
            let res = nlpDB.getTermFrequencies(deckId);

            return Promise.resolve(
                res.should.be.fulfilled.and.eventually.not.be.empty,
                res.should.eventually.be.an('object').and.contain.keys('wordFrequenciesExclStopwords', 'NERFrequencies', 'DBPediaSpotlightURIFrequencies')
            );
        });
    });
});
