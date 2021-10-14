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

async function start() {
    try {
        config = await getConfig()
        if (!argv.bootstrap) await tryLock(config.lockPort)
        
        let server = await connectSocketIOServer(config)

        server.on('stats',stats_fn)
        
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

