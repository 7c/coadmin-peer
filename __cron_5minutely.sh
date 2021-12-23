#!/bin/bash
CWD="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
source "$CWD/inc/shared.sh"

## parse parameters
optstring=":v"
verbose=
while getopts ${optstring} arg; do
  case "${arg}" in
    v) verbose=1 ;;
  esac
done


mainpid=$$
(sleep 1m; kill $mainpid) &
watchdogpid=$!
bye() {
    echo "."
    kill -9 $watchdogpid
}

report_test_ok() { 
    local id="$1"
    local details="$2"
    test -z $2 && details="-"
    test -e /opt/coadmin-peer/tools/report_test.js && {
        test -z $verbose || echo "✅ $id "
        node /opt/coadmin-peer/tools/report_test.js --project 'system' --group 'system' --id "$id" --result "ok" --details "$details"
    }
}

report_test_error() {
    local id="$1"
    local details="$2"
    test -z $2 && details="-"
    test -e /opt/coadmin-peer/tools/report_test.js && {
        test -z $verbose || echo "❌ $id"
        node /opt/coadmin-peer/tools/report_test.js --project 'system' --group 'system' --id "$id" --result "error" --details "$details"
    }
}

ensure_processRunning() {
    # report_test_ok "$2"
    if pgrep -f "$1" >/dev/null; then report_test_ok "$2"; else report_test_error "$2"; fi
}

### tests

## nginx is installed but not running
isInstalled nginx && ensure_processRunning nginx "nginx is running"
ensure_processRunning /usr/sbin/cron "cron is running"
ensure_processRunning /usr/sbin/vnstatd "vnstatd is running"
ensure_processRunning zabbix_agentd "zabbix_agentd is running"
isInstalled puppet-agent && ensure_processRunning puppet "puppet agent is running"

## check puppet agent run status
# /opt/puppetlabs/puppet/cache/state/last_run_summary.yaml
# tree 

## detect puppet agent fail scenarios
isInstalled puppet-agent && {
    statedir='/opt/puppetlabs/puppet/cache/state'
    test -d "$statedir" || statedir=$(/opt/puppetlabs/bin/puppet puppet agent --configprint statedir)
    logg "puppet statedir=$statedir"
    ## sync did not run at all
    report_test_ok "recent puppet sync succeed"
    grep -A 10 event "$statedir/last_run_summary.yaml" | grep 'total: 0$' -q && report_test_error "recent puppet sync succeed"
    ## sync run with errors
    grep -A 10 event "$statedir/last_run_summary.yaml" | grep 'failure:' | grep -v 'failure: 0' -q && report_test_error "recent puppet sync succeed"
}

bye