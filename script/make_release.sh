#!/usr/bin/env bash

# Requirements
command -v perl >/dev/null 2>&1 || { echo >&2 "'perl' is required but it's not installed.  Aborting."; exit 1; }
command -v git >/dev/null 2>&1 || { echo >&2 "'git' is required but it's not installed.  Aborting."; exit 1; }

# Check if we're on project root folder
if [ ! -d "./visualization" ] && [ ! -d "./analysis" ]; then
  echo "Please execute this script from the project root folder. Aborting."
  exit 1
fi

# Check if there are any uncommited changes
if [[ -n $(git status -s) ]]
then
    echo "Please commit your changes first and/or ignore untracked files in git. Aborting."
    exit 1
fi

# Check if we are on main branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" != "main" ]]; then
  echo 'You can only release on main branch. Aborting.';
  exit 1;
fi

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
        exit ) echo "Aborting."; exit 1;
    esac
done

# Confirm release
echo "Do you REALLY want to release ${NEW_VERSION}? WARNING: File changes need to be undone manually or through git when done unintentionally!"
select CONFIRM in "yes" "no"; do
    case $CONFIRM in
        yes ) echo "Selected ${RELEASE_TYPE} release. Updating project..."; break;;
        no ) echo "Aborting."; exit 1;
    esac
done

# bump version in gradle.properties
$(perl -p -i -e "s/^currentVersion=(.*)/currentVersion=${NEW_VERSION}/g" ./analysis/gradle.properties)
echo "v${NEW_VERSION}"
echo "incremented version in ./analysis/gradle.properties"

# bump version in package.jsons
npm --prefix ./analysis/node-wrapper --no-git-tag-version version $NEW_VERSION
echo "incremented version in ./analysis/node-wrapper/package.json + locks"

npm --prefix ./visualization --no-git-tag-version version $NEW_VERSION
echo "incremented version in ./visualization/package.json + locks"

# update changelog
DATE=`date +%Y-%m-%d`
UNRELEASED_TPL="## [unreleased]\n### Added 🚀\n\n### Changed\n\n### Removed 🗑\n\n### Fixed 🐞\n\n### Chore 👨‍💻 👩‍💻\n\n"
REPLACE="${UNRELEASED_TPL}## [${NEW_VERSION}] - ${DATE}"
$(perl -p -i -e "s/^\#\# \[unreleased\]/${REPLACE}/g" ./CHANGELOG.md)
echo "updated ./CHANGELOG.md"

# confirm and make a commit and tag it correctly

echo "Do you want to commit the changes and tag them correctly? WARNING: Commit and Tag need to be undone manually when done unintentionally!"
select CONFIRM in "yes" "no"; do
    case $CONFIRM in
        yes ) echo "Committing and tagging..."; break;;
        no ) echo "Aborting."; exit 1;
    esac
done

git commit -a -m "Releasing ${NEW_VERSION}"
git tag -a ${NEW_VERSION} -m "Releasing ${NEW_VERSION}"

# push
echo "The release is now committed and tagged but not pushed. In order to finish this release you need to push the commit and tag. Push ?"
select CONFIRM in "yes" "no"; do
    case $CONFIRM in
        yes ) echo "Pushing..."; break;;
        no ) echo "Aborting."; exit 1;
    esac
done

git push --follow-tags

echo "Please manually add the latest release notes, as soon as the build is successfully deployed"
