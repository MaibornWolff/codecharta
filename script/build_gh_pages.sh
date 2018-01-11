#!/usr/bin/env bash

mkdir -p gh-pages/visualization/
cp -R visualization/dist/coverage gh-pages/visualization/
cp -R visualization/dist/docs gh-pages/visualization/
cp -R visualization/dist/webpack/ gh-pages/visualization/app/