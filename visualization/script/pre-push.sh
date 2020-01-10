#!/usr/bin/env bash

BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

if [[ $BRANCH_NAME =~ ^[a-z]+\/([0-9]+\/)?[a-z-]+$ || $BRANCH_NAME = "master" || $BRANCH_NAME = "gh-pages" ]]
then
    exit 0
fi

echo "ERROR: Wrong branch naming with $BRANCH_NAME"

if [[ $BRANCH_NAME =~ [A-Z] ]]
then
    echo "- Do not use uppercase letters and split words by dash."
fi

if [[ $BRANCH_NAME =~ [_] ]]
then
    echo "- Do not use underscores and split words by dash."
fi

echo "- The branch must be named using following syntax, while the issue number is optional, in case there is no issue"
echo "  <branch-type>/[<issue-number>/]<branch-name>"
echo "  Example: feature/123/my-branch-name"
echo "  Rename the current branch with: git branch -m <new-branch-name>"

exit 1
