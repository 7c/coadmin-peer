#!/bin/bash

## redis has trouble if RDB file is too big...
## lets warn by files over 500MB
test -d /var/lib/redis && {
    report_test_ok "redis RDB file size is over 500MB"
    test -n "$(find /var/lib/redis -type f -size +500M)" && {
        report_test_error "redis RDB file size is over 500MB"
    }
}
