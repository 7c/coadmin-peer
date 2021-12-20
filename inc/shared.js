const path = require('path')
const fs = require('fs')
const os = require('os')
const chalk = require('chalk')
const { isLocal,wait } = require('mybase')
const package = require('./../package.json')
const debug = require('debug')('shared')
const Metrix = require("telegraf-metrix-node")
const metrix = new Metrix("udp://127.0.0.1:8094", 'coadmin_peer')
const vars = require('./vars')
const argv = require('minimist')(process.argv.slice(2))

function bi(fields, tags = {}) {
    
    if (Object.keys(fields).length > 0) {
        if (isLocal()) {
            console.log(chalk.inverse('bi:'), metrix.line('coadmin_peer', tags, fields))
        } else return metrix.send('coadmin_peer', tags, fields)
    }
}


function isDevServer() {
    return os.hostname()==='coadmin.org'
}

function delConfig(config,key) {
    return new Promise(async function (resolve,reject) {
        let configPath = path.join(config.myFolder,key)
        try {
            fs.unlinkSync(configPath)
            console.log(`deleted config ${configPath}`)
            return resolve(true)
        }catch(err) {
            Sentry.captureException(err)
            console.log(err)
        }
        return resolve(false)
    })
}

function storeConfig(config,key,value) {
    return new Promise(async function (resolve,reject) {
        let configPath = path.join(config.myFolder,key)
        try {
            fs.writeFileSync(configPath,value)
            // console.log(`deployed config ${configPath}`)
            return resolve(true)
        }catch(err) {
            Sentry.captureException(err)
            // console.log(err)
        }
        return resolve(false)
    })
}

function serverAuthenticate(config,server,silent=true) {
    return new Promise(async function (resolve,reject) {
        let tokenPath = path.join(config.myFolder,'token')
        let token = '-'
        let ip4 = vars.ip4
        // load the token
        if (fs.existsSync(tokenPath)) {
            try {
                token = fs.readFileSync(tokenPath,'ascii')
                if (!silent) console.log(`token read as ${token}`)
            }catch(err) {
                if (!silent) console.log(err)
            }
        }
        if (argv.token) token = argv.token
        let hostname = os.hostname()
        if (argv.ip4) ip4=argv.ip4 // debugging
        let auth_data = {ip4,token,hostname,version:package.version}
        if (isDevServer()) auth_data.devserver = true
        if (!silent) console.log(`>auth`,auth_data)
        server.emit('auth',auth_data,async function (response) {
            if (!silent) console.log(`response>`,response)
            let clientid = response.clientid
            let resolver_token = response.token
            if (!response || !clientid || !token) {
                if (!silent) console.log(chalk.red(`error by authentication`))
                await wait(10)
                process.exit(0)
            }
            if (!silent) console.log(chalk.green(`authentication success`))
            server.authenticated = true
            server.clientid = clientid
            vars.socketio=server
            // store token if it is different than the one we procide         
            if (resolver_token!==token && resolver_token) await storeConfig(config,'token',resolver_token)
        })
    })
}


function connectSocketIOServer(config,silent=false) {
    return new Promise(async function (resolve, reject) {
        if (!silent) console.log(chalk.green(`connecting socket.io server at ${config.socketserver}`))
        const io = require('socket.io-client')
        const socket = io.connect(config.socketserver, { transports: ['websocket'],upgrade: true,timeout:60000 })
        socket.authenticated=false
        socket.on('error', (err) => {
            bi({io_error:1})
            if (!silent) console.log(`error event:`, err)
        })

        socket.on('disconnect', (err) => {
            if (!silent) console.log(chalk.red(`socketio:`),`disconnect`)
            bi({io_disconnect:1})
            socket.connected = false
        })

        socket.on('connect_error', function (err) {
            bi({io_cerror:1})
            if (!silent) console.log(chalk.red(`socketio:`),err.toString(),chalk.gray(err.type))
        })



    
        socket.on('connect', async function () {
            bi({io_connect:1})
            if (!silent) console.log(`socketio: connected`)
            socket.connected = true
            serverAuthenticate(config,socket,silent)
            // socket.emit('auth', argv._)
            // connected = true
            // await wait(5)
            // socket.emit('auth', { secret: config.token })
            // socket.on('say', (data) => {
            //     console.log(`say`, data)
            // })

        })
        return resolve(socket)
    })

}


module.exports = {
    connectSocketIOServer,
    delConfig,
    storeConfig,
    isDevServer
}