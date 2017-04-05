// /* eslint dot-notation: 0, no-unused-vars: 0 */
// 'use strict';
//
// //Mocking is missing completely TODO add mocked objects
//
// describe('REST API', () => {
//
//     let server;
//
//     beforeEach((done) => {
//         //Clean everything up before doing new tests
//         Object.keys(require.cache).forEach((key) => delete require.cache[key]);
//         require('chai').should();
//         let hapi = require('hapi');
//         server = new hapi.Server();
//         server.connection({
//             host: 'localhost',
//             port: 3000,
//             timeout: {
//                 server: 5000
//             }
//         });
//         require('../routes.js')(server);
//         done();
//     });
//
//     let options = {
//         method: 'POST',
//         url: '/init/475',
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     };
//
//     context('when computing nlp results for a deck, it', () => {
//         it('should reply with the nlp results', (done) => {
//             server.inject(options, (response) => {
//                 console.log(response);
//                 response.should.be.an('object').and.contain.keys('statusCode','payload');
//                 // response.statusCode.should.equal(200);
//                 // response.payload.should.be.a('string');
//                 // let payload = JSON.parse(response.payload);
//                 // payload.should.be.an('object').and.contain.keys('title', 'language');
//                 // payload.title.should.equal('Dummy');
//                 // payload.language.should.equal('en');
//                 done();
//             });
//         });
//     });
// });
