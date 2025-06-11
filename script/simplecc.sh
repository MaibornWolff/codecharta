#!/bin/bash

command_exists() {
    command -v "$1" >/dev/null 2>&1
    if [[ $? -ne 0 ]]; then
        echo "I require $1 but it's not installed, aborting. Please check install instructions at $2 and try again."
        exit 1
    fi
}
command_exists "complexity" "https://github.com/thoughtbot/complexity"
command_exists "tokei" "https://github.com/XAMPPRocky/tokei"
command_exists "ccsh" "https://codecharta.com/docs/overview/getting-started#installation"
command_exists "git" "https://git-scm.com/"



if [[ "$#" -lt 2 || "$1" != "create" ]]; then
    echo "
This scripts creates a simple CodeCharta software quality map for (almost) every programming language using CodeCharta shell, 'tokei', 'complexity' and 'git' commands.

Usage: Inside any Git working copy run

$0 create <filename> [--debug]

--debug enables debug mode, which means compression of .cc.json files is turned off and temporary files are not deleted automatically."
    exit 1
fi

debug=$([ "$3" == "--debug" ] && echo true || echo false);
fileext=$([ $debug == true ] && echo "cc.json" || echo "cc.json.gz")
debugparam=$([ $debug == true ] && echo "-nc" || echo "")
targetfile=$2.$fileext


if [ -f $targetfile ]; then
    echo "WARNING: $targetfile already exists and will be overwritten."
    rm $targetfile
fi

echo "
Gathering whitespace complexity ...
==================================="
echo "whitespace_complexity,file" > ws_complexity.csv
complexity --format csv | sed 's/\,\.\//\,/' >> ws_complexity.csv
ccsh csvimport --path-column-name=file -o ws_complexity.$fileext $debugparam ws_complexity.csv

echo "
Analyzing Git repository (for larger or older repositories this might take some minutes) ...
============================================================================================"
ccsh gitlogparser repo-scan --repo-path . -o git.$fileext $debugparam

echo "
Gathering Tokei metrics ...
==========================="
tokei . -o json > tokei.json
ccsh tokeiimporter tokei.json -r . -o tokei.$fileext $debugparam


echo "
Analyzing rawtext ...
==========================="
ccsh rawtextparser . -o rawtext.$fileext $debugparam


echo "
Combining all data ...
======================"
ccsh merge -o $targetfile $debugparam ws_complexity.$fileext git.$fileext tokei.$fileext rawtext.$fileext

if [ $debug == true ]; then
    echo "
NOT deleting temporary files in debug mode.
===========================================

If you want to delete temporary files please execute manually:

rm ws_complexity.$fileext git.$fileext tokei.$fileext tokei.json ws_complexity.csv rawtext.$fileext"
else
    echo "
Deleting temporary files ...
============================"
rm ws_complexity.$fileext git.$fileext tokei.$fileext tokei.json ws_complexity.csv rawtext.$fileext
fi

    echo "
#########
All done.
#########
"

if [ -f $targetfile ]; then
    echo "
Created $targetfile.


Open it using CodeCharta Web Studio at https://codecharta.com/visualization/app/

Recommended defaults are:
- Area Metric: rloc
- Height Metrix: whitespace_complexity
- Color Metric: number_of_commits or weeks_with_commits"
else
    echo "Arg! Something wrent wrong :/
Please check outputs above for errors and/or enable debug mode by appending --debug at the end of command to manually check generated files."
fi
