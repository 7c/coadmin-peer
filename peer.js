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
const startstats_fn = require('./inc/startstats_fn.js')

async function start() {
    try {
        config = await getConfig()
        if (!argv.bootstrap) await tryLock(config.lockPort)
        
        let server = await connectSocketIOServer(config,true)

        server.on('startstats',startstats_fn) // will be asked once auth
        server.on('stats',stats_fn)           // will be asked periodically
        
        
        
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

