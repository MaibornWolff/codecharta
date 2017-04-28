#!/usr/bin/env bash

mkdir -p gh-pages/visualization/
cp -R visualization/dist/coverage gh-pages/visualization/
cp -R visualization/dist/doc gh-pages/visualization/
cp -R visualization/dist/app gh-pages/visualization/