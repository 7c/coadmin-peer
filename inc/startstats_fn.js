const chalk = require('chalk')
const os = require('os')
const lsbRelease = require('./lsb_release.js')
const vars = require('./vars.js')
const package = require('./../package.json')
const { isDevServer } = require('./shared.js')

let current_lsbRelease = false
const totalMemory = Math.round(os.totalmem() / 1024 / 1024)
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone


// stats we will send once after authentication

module.exports = (clientId,callback) => {
    console.log(chalk.inverse('startstats_fn'),clientId)
    if (!current_lsbRelease) current_lsbRelease=lsbRelease()
    let data = {
        totalMemory,
        kernel_release:os.release(),
        os_type:os.type(),
        platform: os.platform(),
        cpus:os.cpus(),
        timezone,
        interfaces:os.networkInterfaces(),
        lsbRelease:current_lsbRelease,
        peerVersion:package.version
    }
    if (isDevServer()) console.log(chalk.yellow.inverse(`startstats`),clientId,data)
    return callback(vars.socketio.clientid,data)
}
