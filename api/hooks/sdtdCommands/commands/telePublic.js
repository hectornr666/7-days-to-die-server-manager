let SdtdCommand = require('../command.js');
const sevenDays = require('machinepack-7daystodiewebapi');

class telePublic extends SdtdCommand {
    constructor(serverId) {
        super(serverId, {
            name: 'telepublic',
            description: "Make a teleport public",
            extendedDescription: "Let everyone on the server teleport to a location",
            aliases: ["telepub", "pubtele", "publictele"]
        });
        this.serverId = serverId;
    }

    async isEnabled(chatMessage, player, server, args) {
        return server.config.enabledPlayerTeleports
    }

    async run(chatMessage, player, server, args) {

        let playerTeleports = await PlayerTeleport.find({ player: player.id });
        let playersOnServer = await Player.find({ server: server.id });
        let publicTeleports = await PlayerTeleport.find({
          player: playersOnServer.map(player => player.id),
          publicEnabled: true
        });
    
        let teleportsToCheckForName = publicTeleports;

        let nameAlreadyInUse = false
        teleportsToCheckForName.forEach(teleport => {
          if (teleport.name == args[0]) {
            nameAlreadyInUse = true
          }
        })
    
        if (nameAlreadyInUse) {
          return chatMessage.reply(`That name is already in use! Pick another one please.`);
        }

        if (playerTeleports.length == 0) {
            return chatMessage.reply(`Found no teleport location for you!`)
        }

        let teleportFound = false
        playerTeleports.forEach(teleport => {
            if (teleport.name == args[0]) {
                teleportFound = teleport
            }
        })

        if (!teleportFound) {
            return chatMessage.reply(`No teleport with that name found`)
        }

        if (server.config.economyEnabled && server.config.costToMakeTeleportPublic) {
            let notEnoughMoney = false;
            let result = await sails.helpers.economy.deductFromPlayer.with({
                playerId: player.id,
                amountToDeduct: server.config.costToMakeTeleportPublic,
                message: `COMMAND - ${this.name}`
            }).tolerate('notEnoughCurrency', totalNeeded => {
                notEnoughMoney = true;
            })
            if (notEnoughMoney) {
                return chatMessage.reply(`You do not have enough money to do that! This action costs ${server.config.costToMakeTeleportPublic} ${server.config.currencyName}`)
            }
        }

        await PlayerTeleport.update({ id: teleportFound.id }, { publicEnabled: true });
        return chatMessage.reply(`Your teleport ${teleportFound.name} has been set as public.`)



    }
}

module.exports = telePublic;
