#!/bin/bash
[ "${FLOCKER}" != "$0" ] && exec env FLOCKER="$0" flock -en "$0" "$0" "$@" || :
# CWD="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
CWD="/opt/coadmin-peer"



pm2check() {
    # usage <name> <folder> <filename> <parameters>
    # example: pm2check resolver /opt/ns3-resolver/ resolver.js ""
    pm2 describe "$1" >/dev/null || { cd "$2" && pm2 start --log-date-format "YYYY-MM-DD HH:mm:ss" "$3" --name "$1" -- "$4" && pm2 save; }
    pm2 describe "$1" | egrep -q "status.*(errored|stopped)" && { pm2 restart "$1"; }
}



hostname | egrep '^coadmin.org$' && {
    echo "we should not run on main server, since this is dev"
    exit 0
}

test -e /opt/coadmin-peer-dev && exit



## install ourself into crontab
test -h "/etc/cron.hourly/coadmin-update" || ln -s "$CWD/update.sh" /etc/cron.hourly/coadmin-update

cd "$CWD" || exit

test -d /etc/profile.d && {
tee /etc/profile.d/coadmin-peer.sh <<EOF
YELLOW="\033[0;33m"
CLEAR="\033[0m"
yellow() { echo -en "\${YELLOW}"\$@"\${CLEAR}"; }

yellow "> coadmin peer is installed"
echo ""
EOF
}

## for now update every hour ro latest peer version
git stash
git pull
npm install 


pm2check coadmin /opt/coadmin-peer peer.js ""

echo "Done"