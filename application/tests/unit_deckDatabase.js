// example unit tests
'use strict';

//Mocking is missing completely TODO add mocked objects

let chai = require('chai');
let chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

chai.should();

let helper = require('../database/helper.js');
let deckDB = require('../database/deckDatabase');

describe('deckDatabase', function() {

    beforeEach(function() {
        return helper.cleanDatabase().then(() =>
            helper.connectToDatabase().then((db) =>
                helper.applyFixtures(db, require('./fixtures/decks.json'))
            )
        );
    });

    context('when querying the decks database, it', () => {

        it('should return an existing deck', () => {
            let deckId = 91;
            let res = deckDB.get(deckId);
            return Promise.all([
                res.should.be.fulfilled.and.eventually.not.be.empty,
                res.should.eventually.be.an('object').and.contain.keys('_id', 'user', 'description', 'revisions', 'lastUpdate', 'timestamp')
            ]);
        });

        it('should return null when the deck does not exist', () => {
            let deckId = 12323;
            let res = deckDB.get(deckId);
            return Promise.resolve(
                res.should.be.fulfilled.and.eventually.be.null
            );
        });

        it('should return the total number of decks in the database', () => {
            let res = deckDB.getTotalCount();
            return Promise.resolve(
                res.should.be.fulfilled.and.eventually.equal(7)
            );
        });
    });
});
