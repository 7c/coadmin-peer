const argv = require('minimist')(process.argv.slice(2))
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const debug = require('debug')('config')
const { isLocal, wait } = require('mybase')
var vars = require('./inc/vars.js')
const publicIp = require('public-ip')

function getConfig() {
    return new Promise(async function (resolve, reject) {
        try {            
            resolve(config)
            vars.config = config
            vars.ip4 = await publicIp.v4()
        }
        catch (err) {
            reject(err)
        }

    })
}


var config = {
    lockPort: 56278,
    myFolder: path.join('/var/coadmin'),
    socketserver: argv.dev ? 'http://127.0.0.1:8840' : 'https://coadmin.org',
}


if (require.main === module) {
    getConfig().then(c => {
        console.log(c)
        process.exit(0)
    })
}


if (isLocal()) console.log(chalk.magenta(`*** LOCAL MODE ENABLED ***`))



// make sure to have myFolder ready
if (!fs.existsSync(config.myFolder)) {
    console.log(`Trying to create myFolder`)
    // try to create it
    try {
        fs.mkdirSync(config.myFolder)
        console.log(chalk.green(`Successfully created myFolder`))
    }catch(err) {
        console.log(chalk.red(`missing myFolder '${config.myFolder}', make sure to create it`))
        console.log(err)
        Sentry.captureException(err)
        wait(2).then(()=>{process.exit(0)})
    }
}

module.exports = {
    getConfig
}
