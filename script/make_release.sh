#!/usr/bin/env bash

# Requirements
command -v perl >/dev/null 2>&1 || { echo >&2 "'perl' is required but it's not installed.  Aborting."; exit 1; }
command -v git >/dev/null 2>&1 || { echo >&2 "'git' is required but it's not installed.  Aborting."; exit 1; }

# Check if there are any uncommited changes
if [[ -n $(git status -s) ]]
then
    echo "Please commit your changes first and/or ignore untracked files in git."
    exit 1
fi

# Check if we are on master branch

# Get latest tag
LAST_VERSION="$(git describe --abbrev=0 --tags)"
echo "Last version tag in git is ${LAST_VERSION}"

# Precalc new versions
NEW_MAJOR_VERSION=$(echo ${LAST_VERSION} | perl -pe 's/^(\d+)(.*)(\.\d+)(\.\d+)$/($1+1).".0.0"/e')
NEW_MINOR_VERSION=$(echo ${LAST_VERSION} | perl -pe 's/^(\d+\.)(\d+)(.*)(\.\d+)$/$1.($2+1).".0"/e')
NEW_PATCH_VERSION=$(echo ${LAST_VERSION} | perl -pe 's/^((\d+\.)*)(\d+)(.*)$/$1.($3+1).$4/e')

# Get release type and version
echo "Do you want to release a major version [${NEW_MAJOR_VERSION}], minor version [${NEW_MINOR_VERSION}] or a patch [${NEW_PATCH_VERSION}]?"
select RELEASE_TYPE in "major" "minor" "patch" "exit"; do
    case $RELEASE_TYPE in
        major ) NEW_VERSION=$NEW_MAJOR_VERSION; break;;
        minor ) NEW_VERSION=$NEW_MINOR_VERSION; break;;
        patch ) NEW_VERSION=$NEW_PATCH_VERSION; break;;
        exit ) echo "Aborting."; exit 1; break;;
    esac
done

# Confirm release
echo "Do you REALLY want to release ${NEW_VERSION}? WARNING: Release needs to be undone manually when done unintentionally!"
select CONFIRM in "yes" "no"; do
    case $CONFIRM in
        yes ) echo "Selected ${RELEASE_TYPE} release."; break;;
        no ) echo "Aborting."; exit 1; break;;
    esac
done

#bump version in gradle.properties