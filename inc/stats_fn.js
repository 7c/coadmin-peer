const chalk = require('chalk')
const os = require('os')
// cp { execSync } = require('child_process');
const lsbRelease = require('./lsb_release.js')
const vars = require('./vars.js')
const package = require('./../package.json')
const { isDevServer } = require('./shared.js')

let current_lsbRelease = false




module.exports = function (clientId,callback)  {
    console.log(chalk.inverse('stats_fn'),clientId)
    const freeMemory = Math.round(os.freemem() / 1024 / 1024)

    var mem_heapUsed=Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    var mem_heapTotal=Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    var mem_rss=Math.round(process.memoryUsage().rss / 1024 / 1024)
    var mem_external=Math.round(process.memoryUsage().external / 1024 / 1024)
    
    if (!current_lsbRelease) current_lsbRelease=lsbRelease()
    
    let data = {
        mem_heapUsed,
        mem_heapTotal,
        mem_rss,
        freeMemory,
        mem_external,
        hostname: os.hostname(),
        uptime:os.uptime(),
        loadavrg:os.loadavg(),
        time:Date.now(),
    }
    
    if (isDevServer()) console.log(chalk.yellow.inverse(`stats`),clientId,data)
    return callback(vars.socketio.clientid,data)
}

