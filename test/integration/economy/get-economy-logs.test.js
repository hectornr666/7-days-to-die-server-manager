const supertest = require('supertest');
const expect = require("chai").expect;
const faker = require('faker');

const mockPlayer = require('../../util/mockPlayer');

describe('GET /api/sdtdserver/economy/logs', function () {
  it('should return an array', async function () {

    let player = await mockPlayer({});

    const logs = new Array(50).fill(null).map(e => mockEconomyLog({playerId: player.id}));

    await Promise.all(logs);

    return supertest(sails.hooks.http.app)
      .get('/api/sdtdserver/economy/logs')
      .query({
        serverId: sails.testServer.id,
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .then(response => {
        expect(response.body).to.be.an('array');
        expect(response.body).to.have.lengthOf(logs.length);
      });
  });
  it('should return 400 when no server ID is given', async function () {

    return supertest(sails.hooks.http.app)
      .get('/api/sdtdserver/economy/logs')
      .expect(400);
  });
});

async function mockEconomyLog({
  action,
  playerId,
  serverId
}) {
  const actions = ['give', 'config', 'deduct', 'set'];
  if (!action) {
    action = actions[Math.floor(Math.random() * actions.length)];
  }
  let createdPlayer = await HistoricalInfo.create({
    type: 'economy',
    amount: faker.random.number(),
    economyAction: actions[Math.floor(Math.random() * actions.length)],
    server: serverId ? serverId : sails.testServer.id,
    player: playerId ? playerId : faker.random.number(1)
  }).fetch();
  return createdPlayer;
}
