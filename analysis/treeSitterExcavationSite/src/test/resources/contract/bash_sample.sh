#!/bin/bash
# A comprehensive sample script demonstrating various Bash features.
# Used for golden file contract testing.

# Constants
MAX_RETRIES=3
PREFIX="Hello, "

# Status values
STATUS_PENDING="pending"
STATUS_ACTIVE="active"
STATUS_COMPLETED="completed"

# Simple function with no complexity
get_counter() {
    echo "$COUNTER"
}

# Calculate sum with validation and control flow
calculate() {
    local a=$1
    local b=$2
    local c=$3
    local d=$4
    local e=$5

    if [[ $a -lt 0 || $b -lt 0 ]]; then
        echo 0
        return
    fi

    local sum=0
    for ((i = 0; i < c; i++)); do
        sum=$((sum + a + b))
    done

    while [[ $d -gt 0 ]]; do
        sum=$((sum + d))
        d=$((d - 1))
    done

    echo $((sum + e))
}

# A long function that processes data with nested logic.
# This tests long_method detection (15+ lines).
process_data() {
    local -a items=("$@")
    local result=""
    local count=0

    for item in "${items[@]}"; do
        if [[ -z "$item" ]]; then
            result+="empty"
        elif [[ ${#item} -gt 10 ]]; then
            for ((i = 0; i < 3; i++)); do
                result+="${item:0:5}"
            done
        else
            result+="$item"
        fi
        count=$((count + 1))
    done

    result+=" total: $count"
    echo "$result"
}

# Demonstrates case statement usage
format_by_type() {
    local type=$1
    local label

    case $type in
        1)
            label="one"
            ;;
        2)
            label="two"
            ;;
        3)
            label="three"
            ;;
        *)
            label="unknown"
            ;;
    esac

    echo "${PREFIX}${label}"
}

# Command substitution example
greet() {
    local name=$1
    local date
    date=$(date +%Y-%m-%d)
    echo "Hello, $name! Today is $date"
}

# Array example
process_array() {
    local -a arr=("one" "two" "three")
    local result=""

    for item in "${arr[@]}"; do
        result+="$item "
    done

    echo "$result"
}
