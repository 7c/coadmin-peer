#!/bin/bash
CWD="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
source "$CWD/inc/shared.sh"
cd $CWD

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





### tests

## nginx is installed but not running
isInstalled nginx && ensure_processRunning nginx "nginx is running"
ensure_processRunning cron "cron is running"
ensure_processRunning vnstatd "vnstatd is running"


hostname | grep -q zabbix.vpn1.com || {
    ensure_processRunning zabbix_agentd "zabbix_agentd is running"
}

isInstalled puppet-agent && ensure_processRunning puppet "puppet agent is running"

## check puppet agent run status
# /opt/puppetlabs/puppet/cache/state/last_run_summary.yaml
# tree 

## detect puppet agent fail scenarios
isInstalled puppet-agent && {
    statedir='/opt/puppetlabs/puppet/cache/state'
    test -d "$statedir" || statedir=$(/opt/puppetlabs/bin/puppet agent --configprint statedir)
    logg "puppet statedir=$statedir"
    ## sync did not run at all
    report_test_ok "recent puppet sync succeed"
    ## puppet6 only - need to support puppet7
    grep -A 10 event "$statedir/last_run_summary.yaml" | grep 'total: 0$' -q && report_test_error "recent puppet sync succeed"
    ## sync run with errors
    grep -A 10 event "$statedir/last_run_summary.yaml" | grep 'failure:' | grep -v 'failure: 0' -q && report_test_error "recent puppet sync succeed"
}


## make sure qboss-client is running where it is installed
test -e /opt/qboss-client && {
    if pm2exists "qboss-client"; then
        report_test_ok "qboss-client is running"
    else
        report_test_error "qboss-client is running"
    fi
}


## timezone should be utc everywhere
if date | grep -q UTC; then
    report_test_ok "timezone is utc"
else
    report_test_error "timezone is utc"
fi


## test time off ness
if node tools/ntp-time.js >/dev/null; then
    report_test_ok "time is accurate"
else
    report_test_error "time is accurate"
fi


## do we have another root user other than root:
if [ $(getent passwd 0| wc -l) -eq "1" ]; then
    report_test_ok "single root user"
else
    report_test_error "single root user"
fi

## run checks inside coadmin-peer/checks folder
IFS=$'\n'
for check in $(find "$CWD/checks" -name 'check-*.sh' -type f -group root -executable); do
green "check >$check\n"
source "$check"
done
#  -print -exec {} \;


## run checks inside /var/coadmin/checks folder
test -d "/var/coadmin/checks" && {
    IFS=$'\n'
    for check in $(find "/var/coadmin/checks" -name 'check-*.sh' -type f -group root -executable); do
    green "check >$check\n"
    source "$check"
    done
}



bye $watchdogpid