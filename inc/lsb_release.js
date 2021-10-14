const fs = require('fs')
const child_process = require('child_process')

const execKeys = {
  'LSB Version': 'lsbVersion',
  'Distributor ID': 'distributorID',
  'Description': 'description',
  'Release': 'release',
  'Codename': 'codename'
};

const fileKeys = {
  'DISTRIB_ID': 'distributorID',
  'DISTRIB_RELEASE': 'release',
  'DISTRIB_CODENAME': 'codename',
  'DISTRIB_DESCRIPTION': 'description'
};

const parse = function parse(data, delimeter, keyMap, valueMap) {
  var result = {};

  data.split('\n').forEach(function (l) {
    var key, val, pos = l.indexOf(delimeter)

    if (pos === -1) return;

    key = keyMap[l.substr(0, pos)];

    result[key] = l.substr(pos + 1).trim()

    if (valueMap) {
      result[key] = valueMap(result[key])
    }
  });
  return result;
}

module.exports = function release(){
  try {
    return module.exports.fromFile()
  } catch (e) {
    if (e.code === 'ENOENT') {
      try {
        return module.exports.fromCommand()
      } catch (nextE) {
        return null
      }
    }
    return null
  }
}

// FIXME throws
module.exports.fromCommand = function fromCommand() {
    const stdout = child_process.execSync('lsb_release -a', {stdio:['ignore']})
    const releaseInfo = parse(stdout.toString('utf8'), ':', execKeys)
    return releaseInfo
};

module.exports.fromFile = function fromFile() {
  const data = fs.readFileSync('/etc/lsb-release', 'utf8')
  const releaseInfo = parse(data, '=', fileKeys, function (val) {
      return (val[0] === '"' && val[val.length - 1] === '"')
        ? val.substr(1, val.length - 2)
        : val
    })
  return releaseInfo
};
