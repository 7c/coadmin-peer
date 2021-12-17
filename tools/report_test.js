const path = require('path')
const fs = require('fs')
const CRC32 = require('crc-32')
const debug = require('debug')('report_test')
const chalk = require('chalk')
const { config } = require('../config')
const argv = require('minimist')(process.argv.slice(2))

/*
    tool to report tests from bash scripts (mostly)
        --project: String
        --group: String
        --id: String
        --result: ['ok','error','warning']
        --details: String
    
    this script generates a .json file which then will be read from coadmin-peer
    to transfer to coadmin-server to be presented in mysql
*/

function showUsage() {
    console.log(chalk.bold(`Usage:`))
    console.log(`\t--project${chalk.gray(':String')}`)
    console.log(`\t--group${chalk.gray(':String')}`)
    console.log(`\t--id${chalk.gray(':String')}`)
    console.log(`\t--result:${chalk.gray("['ok','error','warning']")}`)
    console.log(`\t--details${chalk.gray(':String')}`)
    process.exit(1)
}

async function start() {
    try {
        var { project,group,id,result,details} = argv
        if (!project || !group || !id || !result || !details) showUsage()
        if (!['ok','error','warning'].includes(result)) showUsage()

        let file_content = {
            v:1,
            project:project,
            group:group,
            id:id,
            result:result,
            details:details,
            t:Date.now()
        }
        let file_name = Math.abs(CRC32.str(`${project}_${group}_${id}`))+'.coadmin_test'

        let full_filename = path.join(config.myFolder,file_name)
        if (fs.existsSync(config.myFolder)) {
            try {
                fs.writeFileSync(full_filename,JSON.stringify(file_content))
                console.log(full_filename)
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

