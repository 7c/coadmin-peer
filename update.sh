#!/bin/bash
[ "${FLOCKER}" != "$0" ] && exec env FLOCKER="$0" flock -en "$0" "$0" "$@" || :
# CWD="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
CWD="/opt/coadmin-peer"

hostname | egrep '^coadmin.org$' && {
    echo "we should not run on main server, since this is dev"
    exit 0
}

test -e /opt/coadmin-peer-dev && exit

## install ourself into crontab
test -h "/etc/cron.hourly/coadmin-update" || ln -s "$CWD/update.sh" /etc/cron.hourly/coadmin-update

cd "$CWD" || exit

## for now update every hour ro latest peer version
git stash
git pull
npm install 

echo "Done"