#!/bin/bash

test -d /etc/letsencrypt/renewal && {
    if certbot --version >/dev/null; then
        report_test_ok "certbot installed"
    else
        report_test_error "certbot installed"
    fi

    if npx lefolder; then
        report_test_ok "letsencrypt renewals"
    else
        report_test_error "letsencrypt renewals"
    fi
}
