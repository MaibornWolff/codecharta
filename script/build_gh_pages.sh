#!/usr/bin/env bash

mkdir -p gh-pages/visualization/
cp -R visualization/dist/coverage gh-pages/visualization/
cp -R visualization/dist/docs gh-pages/visualization/
cp -R visualization/dist/webpack/ gh-pages/visualization/app/

analysis/gradlew -p analysis/ installDist

# old demo file
analysis/build/install/codecharta-analysis/bin/ccsh sonarimport -o gh-pages/visualization/app/codecharta.cc.json https://sonarcloud.io de.maibornwolff.codecharta:visualization

# new demo file with edges
mkdir gh-pages/demo_files
cd gh-pages/demo_files

git log --numstat --raw --topo-order > git.log
analysis/build/install/codecharta-analysis/bin/ccsh scmlogparser -o codecharta_git.cc.json --input-format GIT_LOG_NUMSTAT_RAW git.log
analysis/build/install/codecharta-analysis/bin/ccsh modify --setRoot /root/visualization -o codecharta_git_mod.cc.json codecharta_git.cc.json

analysis/build/install/codecharta-analysis/bin/ccsh sonarimport -o codecharta_sonar.cc.json https://sonarcloud.io de.maibornwolff.codecharta:visualization
analysis/build/install/codecharta-analysis/bin/ccsh modify --setRoot /root/de.maibornwolff.codecharta/visualization -o codecharta_sonar_mod.cc.json codecharta_sonar.cc.json

analysis/build/install/codecharta-analysis/bin/ccsh merge -o ../visualization/app/codecharta_with_edges.cc.json -p CodeCharta codecharta_sonar_mod.cc.json codecharta_git_mod.cc.json