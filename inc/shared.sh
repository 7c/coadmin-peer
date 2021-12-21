#!/bin/bash
export reset=`tput sgr0`
use_ansi() { test -t 1; }
is_interactive() { test -t 0; }


## myip - exports myip variable
## isInstalled
## isInstalled2
## check_config
export reset=`tput sgr0`

myip() {
    test -z $myip && myip=$(dig +short myip.opendns.com @resolver1.opendns.com)
    test -z $myip && myip=$(curl https://ip8.com/ip)
    test -z $myip && exit 1
    export myip="$myip"
}

slack() {
    if test -e /bin/slack; then
        hn=$(hostname)
        /bin/slack chat send "[$hn] $1" '#checks'
    else
        echo "slack tool is not installed"
    fi
}

out() {
  echo "$(tput setab 2)$1 ${reset}";
}


## do we colors?
if use_ansi ; then
    GREEN="\033[0;32m"
    RED="\033[0;31m"
    YELLOW="\033[0;33m"
    BOLD_WHITE="\033[1;37m"
    GRAY="\033[0;90m"
    CLEAR="\033[0m"
else
    GREEN=""
    RED=""
    YELLOW=""
    BOLD_WHITE=""
    GRAY=""
    CLEAR=""
fi
green() { echo -en "${GREEN}"$@"${CLEAR}"; }
gray() { echo -en "${GRAY}"$@"${CLEAR}"; }
red() { echo -en "${RED}"$@"${CLEAR}"; }
yellow() { echo -en "${YELLOW}"$@"${CLEAR}"; }
hl() { echo -en "${BOLD_WHITE}"$@"${CLEAR}"; }
pass() {
    local check="✔"
    green $check
}

fail() {
    local x="✘"
    red $x
}

logg() {
    if [ "$0" != "-bash" ]; then
    LOGPATH='/var/log/bashscripts.log'
    rp=$(realpath $0)
    d=$(date)
    echo "$rp - $d : $1" >> "$LOGPATH"
    fi
}



isInstalled() {
    dpkg -s $1 2>&1 | grep -q 'is not installed and no information'  && return 1
    dpkg -s $1 2>&1 | grep Status | grep -q 'not-installed'          && return 2
    dpkg -s $1 2>&1 | grep Status | grep -q 'half-installed'         && return 3
    dpkg -s $1 2>&1 | grep Status | grep -q 'half-configured'         && return 4
    return 0
}

# use this function for remove candidates, because half-installed/half-configured
# ones also do return 0 beside not installed
isInstalled2() {
    dpkg -s $1 2>&1 | grep -q 'is not installed and no information'  && return 1
    dpkg -s $1 2>&1 | grep Status | grep -q 'not-installed'          && return 2

    dpkg -s $1 2>&1 | grep Status | grep -q 'half-installed'         && return 0
    dpkg -s $1 2>&1 | grep Status | grep -q 'half-configured'         && return 0
    return 0
}

check_config() {
	# returns 0 (success) if configuration has been changed or it does not exist on the other side
	# returns 1 if configuration has NOT changed
    # use this like check_config "$config" "$STUNNEL_CONFIG" && where $config is a string which was created inside the script
    input="$1"
    test -e "$2" || {
        out "Configuration '$2' was never deployed"
	    echo -e "$1" > $2
	    return 0
    }
	# echo "Working with $config"
	hashcmd='/usr/bin/md5sum'
	test -e /sbin/md5 && hashcmd='/sbin/md5'

	tmp="/tmp"
	test ! -z $TMPDIR && tmp=$TMPDIR
	tmpfile=$tmp/.tmp.$(echo "$2" | eval "$hashcmd" | cut -d' ' -f1 )

	echo -e "$input" > $tmpfile
	hash1=$(cat "$tmpfile" | eval "$hashcmd")  # hash from possible config
	hash2=$(cat "$2" | eval "$hashcmd")	# hash from existing config
	test -e $tmpfile && rm -f "$tmpfile"
	# echo "$hash1"
	# echo "$hash2"
	if [ "$hash1" != "$hash2" ]; then
	# out "Configuration '$2' has been modified"
	echo -e "$1" > $2
	return 0
	else
	# out "Configuration '$2' has not changed yet"
	return 1
	fi
}

logg "."