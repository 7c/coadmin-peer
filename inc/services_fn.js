const chalk = require('chalk')
const os = require('os')
const fs = require('fs')
const path = require('path')
// cp { execSync } = require('child_process');
const lsbRelease = require('./lsb_release.js')
const vars = require('./vars.js')
const package = require('./../package.json')
const { isDevServer } = require('./shared.js')

function readServiceFiles(theFolder) {
    return new Promise(async function (resolve,reject) {
        try {
            fs.readdir(theFolder, function(err, items) {
                if (err) return reject(err)

                let selected_files = []
                for (var i=0; i<items.length; i++) {
                    let fn = items[i]
                    if (fn.search(/\.coadmin_service$/)>0) {
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


function readJsonOrDelete(fn) {
    try {return JSON.parse(fs.readFileSync(fn,'utf8'))}catch(err) {}
    // unlink file if failed to parse
    try {fs.unlinkSync(fn)}catch(_) {}
    return false
}


function unlinkSilently(fn) {
    try {fs.unlinkSync(fn)}catch(_err) {}
}

module.exports = async function (clientId,callback)  {
    // responsible to read all service files from coadmin folder and send them to
    // server, server will process them properly
    console.log(chalk.inverse('services_fn'),clientId)
    let service_files = await readServiceFiles(vars.config.myFolder)
    let data = []
    console.log(`processing ${service_files.length} service files`)
    for(let sf of service_files) {
        let json = readJsonOrDelete(sf)
        if (!json) continue
        data.push(json)
        // we shall not send more than 100 updates at once, batching is important
        if (data.length>100) break
        unlinkSilently(sf)
    }
    // if (isDevServer()) console.log(chalk.yellow.inverse(`stats`),clientId,data)
    return callback(vars.socketio.clientid,data)
}
