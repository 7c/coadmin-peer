const chalk = require('chalk')
const os = require('os')
const fs = require('fs')
const path = require('path')
// cp { execSync } = require('child_process');
const lsbRelease = require('./lsb_release.js')
const vars = require('./vars.js')
const package = require('./../package.json')
const { isDevServer, readJsonOrDelete, unlinkSilently } = require('./shared.js')

function readTestresultFiles(theFolder) {
    return new Promise(async function (resolve,reject) {
        try {
            fs.readdir(theFolder, function(err, items) {
                if (err) return reject(err)

                let selected_files = []
                for (var i=0; i<items.length; i++) {
                    let fn = items[i]
                    if (fn.search(/\.coadmin_test$/)>0) {
                        selected_files.push(path.join(theFolder,fn))
                    }
                }
                resolve(selected_files)
            })
        }catch(_err) {
            reject(_err)
        }
    })
}


module.exports = async function (clientId,callback)  {
    // responsible to read all service files from coadmin folder and send them to
    // server, server will process them properly
    console.log(chalk.inverse('tests_fn'),clientId)
    let service_files = await readTestresultFiles(vars.config.myFolder)
    let data = []
    console.log(`processing ${service_files.length} ${chalk.yellow('test')} files`)
    for(let sf of service_files) {
        let json = readJsonOrDelete(sf)
        if (!json) continue
        data.push(json)
        // we shall not send more than 100 updates at once, batching is important to 
        // unload coadmin-server
        if (data.length>100) break
        unlinkSilently(sf)
    }

    // if (isDevServer()) console.log(chalk.yellow.inverse(`stats`),clientId,data)
    return callback(vars.socketio.clientid,data)
}
