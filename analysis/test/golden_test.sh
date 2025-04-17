#!/usr/bin/env bash
set -e

# Arguments
# 1. version e.g.: 1.123.1
# 2. (optional) tmp file path e.g.: /tmp/golden_test/
# 3. (optional) ccsh path e.g.: /usr/local/bin/ccsh
#
# To be executed inside the analysis/test folder

DATA="data/codecharta"


if [ -z "$1" ]; then
  echo "No CodeCharta version specified"
  exit 1
fi
CC_VERSION=$1

if [ -z "$2" ];
then
  echo "No temp file path given, using default"
  TEMP_DIR="../build/tmp/goldentest"
else
  TEMP_DIR="$2"
fi
mkdir -p "${TEMP_DIR}"

if [ -z "$3" ];
then
  echo "No ccsh path given, using compiled version"
  CC_TAR_NAME="codecharta-analysis-${CC_VERSION}.tar"
  CCSH="${TEMP_DIR}/codecharta-analysis-${CC_VERSION}/bin/ccsh"
  echo "Installing CodeCharta analysis to ${TEMP_DIR}"
  cp "../build/distributions/${CC_TAR_NAME}" "${TEMP_DIR}"
  tar xf "${TEMP_DIR}/${CC_TAR_NAME}" -C "${TEMP_DIR}"
  rm "${TEMP_DIR}/${CC_TAR_NAME}"
else
  CCSH="$3"
fi

exit_with_err() {
  echo $1 >&2
  echo "You have to manually remove ${TEMP_DIR}" >&2
  exit 1
}

deinstall_codecharta() {
  echo
  echo "Deleting CodeCharta test installation in ${TEMP_DIR}"
  echo
  rm -rf "${TEMP_DIR}"
}

validate() {
  if ! "${CCSH}" check "$1"; then
    exit_with_err "$1 no valid cc.json"
  fi
}

check_gitlogparser_log_scan() {
  echo " -- expect GitLogParser log-scan subcommand to produce valid cc.json file"
  ACTUAL_GITLOG_JSON_LOG_SCAN="${TEMP_DIR}/actual_gitlogparser_log_scan.cc.json"
  returnCode="0"
  timeout 60s "${CCSH}" gitlogparser "log-scan" --git-log "${DATA}/gitlogparser-cc.txt" --repo-files "${DATA}/gitlogparser-cc-filelist.txt" -o "${ACTUAL_GITLOG_JSON_LOG_SCAN}" --silent=true -nc || returnCode="$?"
  if [ "$returnCode" -eq 124 ]; then
    exit_with_err "Parser got stuck, this is likely due to an open System.in stream not handled correctly"
  elif [ "$returnCode" -ne 0 ]; then
    exit_with_err "Parser exited with code $returnCode"
  fi
  validate "${ACTUAL_GITLOG_JSON_LOG_SCAN}"
}

check_gitlogparser_repo_scan() {
  echo " -- expect GitLogParser repo-scan subcommand to produce valid cc.json file"
  ACTUAL_GITLOG_JSON_REPO_SCAN="${TEMP_DIR}/actual_gitlogparser_repo_scan.cc.json"
  returnCode="0"
  timeout 120s "${CCSH}" gitlogparser "repo-scan" --repo-path "$(dirname "$(dirname "$PWD")")" -o "${ACTUAL_GITLOG_JSON_REPO_SCAN}" --silent=true -nc || returnCode="$?"
  if [ "$returnCode" -eq 124 ]; then
    exit_with_err "Parser got stuck, this is likely due to an open System.in stream not handled correctly"
  elif [ "$returnCode" -ne 0 ]; then
    exit_with_err "Parser exited with code $returnCode"
  fi
  validate "${ACTUAL_GITLOG_JSON_REPO_SCAN}"
}

check_csvexporter() {
  echo " -- expect CSVexporter to produce correct csv table"
  ACTUAL_CSVEXPORT="${TEMP_DIR}/actual_csvexport.csv"
  "${CCSH}" csvexport "${DATA}/csvexport_input.cc.json" --depth-of-hierarchy=2 -o "${ACTUAL_CSVEXPORT}"
  if ! diff -q --strip-trailing-cr -- "${ACTUAL_CSVEXPORT}" "${DATA}/csvexport_gold.csv"; then
    exit_with_err "${ACTUAL_CSVEXPORT} could not be found or is not equal to gold"
  fi
}

check_edgefilter() {
  echo " -- expect Edgefilter to produce valid cc.json file"
  ACTUAL_EDGEFILTER_JSON="${TEMP_DIR}/actual_edgefilter.cc.json"
  "${CCSH}" edgefilter "${DATA}/edgefilter.cc.json" -o "${ACTUAL_EDGEFILTER_JSON}"
  validate "${ACTUAL_EDGEFILTER_JSON}"
}

check_mergefilter() {
  echo " -- expect MergeFilter to produce valid cc.json file"
  ACTUAL_MERGEFILTER_JSON="${TEMP_DIR}/actual_mergefilter.cc.json"
  "${CCSH}" merge "${DATA}/mergefilter_a.cc.json" "${DATA}/mergefilter_b.cc.json" -o "${ACTUAL_MERGEFILTER_JSON}" -nc
  validate "${ACTUAL_MERGEFILTER_JSON}"
}

check_codemaatimporter() {
  echo " -- expect CodeMaatImporter to produce valid cc.json.gz file"
  ACTUAL_CODEMAAT_JSON="${TEMP_DIR}/actual_codemaatimporter.cc.json.gz"
  "${CCSH}" codemaatimport "${DATA}/codemaat.csv" -o "${ACTUAL_CODEMAAT_JSON}"
  validate "${ACTUAL_CODEMAAT_JSON}"
}

check_csvimporter() {
  echo " -- expect CSVimporter to produce valid cc.json file with corrected name"
  ACTUAL_CSVIMPORT_JSON="${TEMP_DIR}/actual_csvimport"
  "${CCSH}" csvimport "${DATA}/csvimport.csv" -o "${ACTUAL_CSVIMPORT_JSON}.json" -nc
  validate "${ACTUAL_CSVIMPORT_JSON}.cc.json"
}

check_sourcemonitor() {
  echo " -- expect SourceMonitorImporter to produce valid cc.json on system.out"
  ACTUAL_SOURCEMON_JSON="${TEMP_DIR}/actual_sourcemonitorimporter.json"
  "${CCSH}" sourcemonitorimport ${DATA}/sourcemonitor.csv >"${ACTUAL_SOURCEMON_JSON}"
  validate "${ACTUAL_SOURCEMON_JSON}"
}

check_sonar() {
  echo " -- expect SonarImporter to produce valid cc.json file with multiple extensions"
  ACTUAL_SONAR_JASON="${TEMP_DIR}/actual_sonarimport.drive0.storage"
  "${CCSH}" sonarimport https://sonarcloud.io maibornwolff-gmbh_codecharta_visualization -o ${ACTUAL_SONAR_JASON} -nc
  validate "${ACTUAL_SONAR_JASON}.cc.json"
}

check_sourcecodeparser() {
  echo " -- expect SourceCodeParser to produce valid cc.json file"
  ACTUAL_SCP_JSON="${TEMP_DIR}/actual_scpparser.cc.json"
  "${CCSH}" sourcecodeparser "${DATA}/sourcecode.java" -o "${ACTUAL_SCP_JSON}" -nc
  validate "${ACTUAL_SCP_JSON}"
}

check_coverageimporter_javascript() {
    echo " ---- expect CoverageImporter to produce valid cc.json file for javascript"
    ACTUAL_JAVASCRIPT_COVERAGE_JSON="${TEMP_DIR}/actual_coverageimporter_javascript.cc.json"
    "${CCSH}" coverageimport "${DATA}/coverageReports/lcov.info" --language=javascript -o "${ACTUAL_JAVASCRIPT_COVERAGE_JSON}" -nc
    validate "${ACTUAL_JAVASCRIPT_COVERAGE_JSON}"
}

check_coverageimporter_java() {
    echo " ---- expect CoverageImporter to produce valid cc.json file for java"
    ACTUAL_JAVA_COVERAGE_JSON="${TEMP_DIR}/actual_coverageimporter_java.cc.json"
    "${CCSH}" coverageimport "${DATA}/coverageReports/jacoco.xml" --language=java -o "${ACTUAL_JAVA_COVERAGE_JSON}" -nc
    validate "${ACTUAL_JAVA_COVERAGE_JSON}"
}

check_coverageimporter_csharp() {
    echo " ---- expect CoverageImporter to produce valid cc.json file for csharp"
    ACTUAL_CSHARP_COVERAGE_JSON="${TEMP_DIR}/actual_coverageimporter_csharp.cc.json"
    "${CCSH}" coverageimport "${DATA}/coverageReports/coverage.cobertura.xml" --language=csharp -o "${ACTUAL_CSHARP_COVERAGE_JSON}" -nc
    validate "${ACTUAL_CSHARP_COVERAGE_JSON}"
}

check_coverageimporter() {
    echo " -- expect CoverageImporter to produce valid cc.json files for all supported languages"
    check_coverageimporter_javascript
    check_coverageimporter_java
}

check_svnlog() {
  echo " -- expect SVNLogParser to produce valid cc.json to system.out"
  ACTUAL_SVNLOG_JSON="${TEMP_DIR}/actual_svnlogparser.json"
  "${CCSH}" svnlogparser "${DATA}/SVNTestLog.txt" --silent >"${ACTUAL_SVNLOG_JSON}"
  validate "${ACTUAL_SVNLOG_JSON}"
}

check_tokei() {
  echo " -- expect TokeiImporter to produce valid cc.json file"
  ACTUAL_TOKEI_JSON="${TEMP_DIR}/actual_tokeiparser.cc.json"
  "${CCSH}" tokeiimporter "${DATA}/tokei_results.json" --path-separator \\ -o "${ACTUAL_TOKEI_JSON}" -nc
  validate "${ACTUAL_TOKEI_JSON}"
}

check_rawtext() {
  echo " -- expect RawTextParser to produce valid cc.json file"
  ACTUAL_RAWTEXT_JSON="${TEMP_DIR}/actual_rawtextparser.cc.json"
  "${CCSH}" rawtextparser "${DATA}/rawText/" -o "${ACTUAL_RAWTEXT_JSON}" -nc
  validate "${ACTUAL_RAWTEXT_JSON}"
}

check_pipe() {
  echo " -- expect pipe chain from tokei, sourcecodeparser, svnlogparser and modify to work"
  sh "${CCSH}" tokeiimporter "${DATA}/tokei_results.json" --path-separator \\ |
    sh "${CCSH}" sourcecodeparser "${DATA}/sourcecode.java" |
    sh "${CCSH}" svnlogparser "${DATA}/SVNTestLog.txt" |
    sh "${CCSH}" modify --move-from=root/src --move-to=root/bar \
      -o ${TEMP_DIR}/piped_out.json 2>${TEMP_DIR}/piped_out_log.json
  validate ${TEMP_DIR}/piped_out.cc.json
  if ! grep -q "Created Project with 9 leaves." ${TEMP_DIR}/piped_out_log.json; then
    exit_with_err "ERR: Pipes broken."
  fi
}

check_help() {
  echo " -- expected to put out help information"
  sh "${CCSH}" --help >${TEMP_DIR}/help_long_output 2>&1
  sh "${CCSH}" -h >${TEMP_DIR}/help_short_output 2>&1
  if ! grep -q "Command Line Interface for CodeCharta analysis" ${TEMP_DIR}/help_long_output; then
    exit_with_err "ERR: Help not printed as expected"
  fi
  if ! grep -q "Command Line Interface for CodeCharta analysis" ${TEMP_DIR}/help_short_output; then
    exit_with_err "ERR: Help not printed as expected"
  fi
}

check_version() {
  echo " -- expected to put out version information"
  sh "${CCSH}" --version >${TEMP_DIR}/version_long_output  2>&1
  sh "${CCSH}" -v >${TEMP_DIR}/version_short_output 2>&1
  if ! grep -q "$1" ${TEMP_DIR}/version_long_output; then
    exit_with_err "ERR: Version not printed as expected"
  fi
  if ! grep -q "$1" ${TEMP_DIR}/version_short_output; then
    exit_with_err "ERR: Version not printed as expected"
  fi
}

run_tests() {
  echo
  echo "Running Tests"
  java -version
  echo

  check_gitlogparser_log_scan
  check_gitlogparser_repo_scan
  check_csvexporter
  check_edgefilter
  check_mergefilter
  check_codemaatimporter
  check_csvimporter
  check_sourcemonitor
  check_sonar
  check_sourcecodeparser
  check_coverageimporter
  check_svnlog
  check_tokei
  check_rawtext

  check_pipe

  check_help
  check_version "$1"

  echo
  echo "... Testing finished."
  echo
}

run_tests "$1"
deinstall_codecharta


