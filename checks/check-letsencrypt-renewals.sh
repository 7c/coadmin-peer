#!/bin/bash

test -d /etc/letsencrypt/renewal && {
    if npx lefolder; then
        report_test_ok "letsencrypt renewals"
    else
        report_test_error "letsencrypt renewals"
    fi
}
