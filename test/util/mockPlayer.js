const faker = require('faker');

module.exports = async function mockPlayer({
  roleId,
  steamId,
  userId,
  serverId,
}) {
  let createdUser = await User.create({
    steamId: faker.random.uuid(),
    username: faker.internet.userName()
  }).fetch();

  let createdPlayer = await Player.create({
    steamId: steamId ? steamId : createdUser.steamId,
    name: faker.internet.userName(),
    server: serverId ? serverId : sails.testServer.id,
    user: userId ? userId : createdUser.id,
    role: roleId,
  }).fetch();
  return createdPlayer;
}
