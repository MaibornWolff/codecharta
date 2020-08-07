---
categories:
  - Dev-guide
tags:
  - release
title: Make a release
---

# How to Release

Before you start releasing please take your time to check the functionality of codecharta. If there were no changes to the analysis part, there is no reason to check that. If there were changes to the analysis, you should create some cc.jsons and check if the visualization is working as intended.
Don't just check the new features. Take your time to make sure that the core features of codecharta are still working as intended.

## Choosing a new Version

The new version depends on what kind of entries are found in the unreleased part of the changelog.

- Only Bug-Fixes or Chore => **Patch**
- Contains Features or Changes => **Minor**
- Breaks the API => **Major**

## Preparation

- Pull the remote main branch
- Check if the CHANGELOG.md is up to date with what you're going to release

## Releasing

- Install all python dependencies using `pipenv install`
- Navigate to the root-folder of codecharta and run `pipenv run make_release` and follow the wizard

## Waiting

- Releasing should take approx. 30min. Check Travis CI for a status on your release

## Post-Work

- Click `Edit` on your latest [release](https://github.com/MaibornWolff/codecharta/releases) and add the release notes from your gh-pages post
- Quick-test our [web demo](https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json&file=codecharta_analysis.cc.json) for it's core and new features again
