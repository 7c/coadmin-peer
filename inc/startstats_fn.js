const chalk = require('chalk')
const os = require('os')
const lsbRelease = require('./lsb_release.js')
const vars = require('./vars.js')
const package = require('./../package.json')

let current_lsbRelease = false
const totalMemory = Math.round(os.totalmem() / 1024 / 1024)


module.exports = (callback) => {
    if (!current_lsbRelease) current_lsbRelease=lsbRelease()
    // stats we will send once a auth
    let data = {
        totalMemory,
        kernel_release:os.release(),
        os_type:os.type(),
        platform: os.platform(),
        cpus:os.cpus(),
        interfaces:os.networkInterfaces(),
        lsbRelease:current_lsbRelease,
        peerVersion:package.version
    }
    console.log(chalk.yellow.inverse(`startstats`),data)
    return callback(vars.socketio.clientid,data)
}

