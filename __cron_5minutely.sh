#!/bin/bash
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
        node /opt/coadmin-peer/tools/report_test.js --project 'system' --group 'system' --id "$id" --result "ok" --details "$details"
    }
}

isInstalled() {
    dpkg -s $1 2>&1 | grep -q 'is not installed and no information'  && return 1
    dpkg -s $1 2>&1 | grep Status | grep -q 'not-installed'          && return 2
    dpkg -s $1 2>&1 | grep Status | grep -q 'half-installed'         && return 3
    dpkg -s $1 2>&1 | grep Status | grep -q 'half-configured'         && return 4
    return 0
}

report_test_error() {
    local id="$1"
    local details="$2"
    test -z $2 && details="-"
    test -e /opt/coadmin-peer/tools/report_test.js && {
        node /opt/coadmin-peer/tools/report_test.js --project 'system' --group 'system' --id "$id" --result "error" --details "$details"
    }
}

ensure_processRunning() {
    if pgrep "$1" >/dev/null; then report_test_ok "$2"; else report_test_error "$2"; fi
}

### tests

## nginx is installed but not running
isInstalled nginx && ensure_processRunning nginx "nginx is running"
ensure_processRunning cron "cron is running"
ensure_processRunning vnstatd "vnstatd is running"
ensure_processRunning zabbix_agentd "zabbix_agentd is running"
isInstalled puppet-agent && ensure_processRunning puppet "puppet agent is running"

## check puppet agent run status
# /opt/puppetlabs/puppet/cache/state/last_run_summary.yaml

bye