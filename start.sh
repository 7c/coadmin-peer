#!/bin/bash

pm2check() {
     pm2 describe "$1" >/dev/null|| { cd "$2" && pm2 start --log-date-format "YYYY-MM-DD HH:mm:ss" "$3.js" --name "$1" && pm2 save;}
     pm2 describe "$1" | egrep -q "status.*(errored|stopped)" && pm2 restart "$1"
}

pm2check 'coadmin' /opt/coadmin-peer 'peer'