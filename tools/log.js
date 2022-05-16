const path = require('path')
const fs = require('fs')
const CRC32 = require('crc-32')
const debug = require('debug')('report_test')
const chalk = require('chalk')
const { config } = require('../config')
const argv = require('minimist')(process.argv.slice(2))

/*
    tool to log to coadmin backend
        --severity info|warning|error, default: info
        
    this script generates a .json file which then will be read from coadmin-peer
    to transfer to coadmin-server to be persisted in mysql
*/

function showUsage() {
    console.log(chalk.bold(`Usage:`))
    console.log(`node log.js <payload> [--severity|--verbose]`)
    console.log(`\t--severity ${chalk.gray('info|warning|error')}`)
    console.log(``)
    console.log(`\t--verbose`)
    process.exit(1)
}

async function start() {
    try {
        let { severity } = argv
        if (!severity) severity='info'
        if (!['info','warning','error'].includes(severity)) showUsage()
        
        console.log(argv._)

        if (argv._.length===0) showUsage()
        let payload = argv._.join(' ')

        let file_content = {
            v:1,
            severity,
            payload,
            t:Date.now()
        }


        let file_name = `${new Date().toISOString().substring(0,19).replace(/:/g,'_',)}.coadmin_log`        
        let full_filename = path.join(config.myFolder,file_name)
        if (fs.existsSync(config.myFolder)) {
            try {
                fs.writeFileSync(full_filename,JSON.stringify(file_content))
                if (argv.verbose) console.log(full_filename)
                process.exit(0)
            }catch(err) {
                console.error(err)
            }
        } else {
            console.error(`ERROR: FOLDER ${config.myFolder} DOES NOT EXIST`)
        }
    } catch(err) {
        console.log(chalk.red(err))
    }
    process.exit(1)
}

start()

