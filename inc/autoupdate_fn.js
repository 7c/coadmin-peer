const chalk = require('chalk')
const vars = require('./vars.js')
const package = require('./../package.json')
const { isDevServer } = require('./shared.js')
const { execSync } = require('child_process');
const semver = require('semver')

module.exports = function (clientId,minVersion)  {
    console.log(chalk.inverse('autoupdate'),clientId)
    // if dev server or provided minimum version is invalid - we ignore
    if (isDevServer() || !semver.valid(minVersion)) return
    if (semver.gt(minVersion,package.version)) {
        console.log(chalk.red.inverse(`Autoupdating from ${package.version} -> ${minVersion}`))
        execSync('git stash && git pull && npm i && npm update && /usr/bin/pm2 restart coadmin',{cwd: __dirname,timeout:120*1000})
        console.log(`Autoupdate done`)
        process.exit(0)
    }
}

