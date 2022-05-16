const package = require('./package.json')
const {tryLock} = require('tcp-mutex')
const argv = require('minimist')(process.argv.slice(2))
const chalk = require('chalk')
const { getConfig } = require('./config.js')
const { wait, softexit } = require('mybase')
const os = require('os')
const { connectSocketIOServer } = require('./inc/shared.js')

let config

// import commands we support
const stats_fn = require('./inc/stats_fn.js')
const services_fn = require('./inc/services_fn.js')
const logs_fn = require('./inc/logs_fn.js')
const startstats_fn = require('./inc/startstats_fn.js')
const tests_fn = require('./inc/tests_fn.js')
const autoupdate_fn = require('./inc/autoupdate_fn.js')

async function start() {
    try {
        config = await getConfig()
        console.log(`Started ${package.version}`)
        if (!argv.bootstrap) await tryLock(config.lockPort)
        
        let server = await connectSocketIOServer(config,true)

        server.on('startstats',startstats_fn) // will be asked once auth
        server.on('stats',stats_fn)           // will be asked periodically from server
        server.on('services',services_fn)     // will be asked peridically from server
        server.on('tests',tests_fn)           // will be asked peridically from server
        server.on('autoupdate',autoupdate_fn) // will be asked from server
        server.on('logs',logs_fn)     // will be asked peridically from server
        
        if (argv.bootstrap) {
            while(!server.authenticated) {
                await wait(1)
            }
            console.log(chalk.green(`bootstrapped`))
            await wait(1)
            process.exit(0)
        }

        // process.exit(0)
    } catch (err) {
        console.error(err)
        softexit("error",600)
    }
}

start()

