const os = require('os')
// cp { execSync } = require('child_process');
const lsbRelease = require('./lsb_release.js')

let current_lsbRelease = false

module.exports = (callback) => {
    var mem_heapUsed=Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    var mem_heapTotal=Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    var mem_rss=Math.round(process.memoryUsage().rss / 1024 / 1024)
    var mem_external=Math.round(process.memoryUsage().external / 1024 / 1024)

    if (!current_lsbRelease) current_lsbRelease=lsbRelease()

    
    let data = {
        mem_heapUsed,
        mem_heapTotal,
        mem_rss,
        mem_external,
        hostname: os.hostname(),
        kernel_release:os.release(),
        os_type:os.type(),
        uptime:os.uptime(),
        platform: os.platform(),
        loadavrg:os.loadavg(),
        time:Date.now(),
        cpus:os.cpus(),
        interfaces:os.networkInterfaces(),
        lsbRelease:current_lsbRelease
    }
    
    return callback(data)
}

