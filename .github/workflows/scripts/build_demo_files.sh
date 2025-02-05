#!/usr/bin/env bash

analysis/gradlew -p analysis/ installDist

<<<<<<<< HEAD:.github/workflows/scripts/build_demo_files.sh
mkdir temp_dir

git ls-files > temp_dir/file-name-list.txt
git log --numstat --raw --topo-order --reverse -m > temp_dir/git.log

cd temp_dir || exit
CCSH=../analysis/build/install/codecharta-analysis/bin/ccsh
========
mkdir gh-pages/temp_dir

git ls-files > gh-pages/temp_dir/file-name-list.txt
git log --numstat --raw --topo-order --reverse -m > gh-pages/temp_dir/git.log

cd gh-pages/temp_dir || exit
CCSH=../../analysis/build/install/codecharta-analysis/bin/ccsh
>>>>>>>> bb1a54a27 (Rename build demo file script #3910):script/build_demo_files.sh

# Data for for both visualization and analysis
$CCSH gitlogparser log-scan --git-log git.log --repo-files file-name-list.txt -o codecharta_git.cc.json -nc

# Map for visualization
$CCSH modify --set-root root/visualization -o codecharta_git_mod.cc.json codecharta_git.cc.json

$CCSH sonarimport -nc -o codecharta_sonar.cc.json https://sonarcloud.io maibornwolff-gmbh_codecharta_visualization
$CCSH modify --set-root root/maibornwolff-gmbh_codecharta_visualization -o codecharta_sonar_mod.cc.json codecharta_sonar.cc.json

$CCSH merge -o ../visualization/dist/webpack/codecharta.cc.json codecharta_sonar_mod.cc.json codecharta_git_mod.cc.json -nc
# Zipped map for pipeline build
$CCSH merge -o ../visualization/dist/webpack/codecharta.cc.json codecharta_sonar_mod.cc.json codecharta_git_mod.cc.json

# Map for analysis
$CCSH sonarimport -nc -o codecharta_sonar_analysis.cc.json https://sonarcloud.io maibornwolff-gmbh_codecharta_analysis
$CCSH modify --set-root root/maibornwolff-gmbh_codecharta_analysis -o codecharta_sonar_mod.cc.json codecharta_sonar_analysis.cc.json
$CCSH modify --set-root root/analysis -o codecharta_git_mod.cc.json codecharta_git.cc.json
$CCSH merge -o ../visualization/dist/webpack/codecharta_analysis.cc.json codecharta_sonar_mod.cc.json codecharta_git_mod.cc.json -nc
# Zipped map for pipeline build
$CCSH merge -o ../visualization/dist/webpack/codecharta_analysis.cc.json codecharta_sonar_mod.cc.json codecharta_git_mod.cc.json


<<<<<<<< HEAD:.github/workflows/scripts/build_demo_files.sh
cd ..
rm -r temp_dir
========
cd ../..
rm -r gh-pages/temp_dir
>>>>>>>> bb1a54a27 (Rename build demo file script #3910):script/build_demo_files.sh
