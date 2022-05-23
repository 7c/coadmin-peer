#!/bin/bash

## nginx 'Too many open files' error detection
test -d /var/log/nginx && {
    ago5=$(date --date='5 minutes ago' +"%Y/%m/%d %H:%M")
    if tail /var/log/nginx/*log -n 1000 | grep "$ago5" | grep -i -q 'Too many open files'; then
        report_test_error "nginx too many open files"
    else
        report_test_ok "nginx too many open files"
    fi
}
