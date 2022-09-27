#!/usr/bin/env bash
set -e

INSTALL_DIR="../build/tmp/goldentest"

exit_with_err() {
  echo $1 >&2
  echo "You have to manually remove ${INSTALL_DIR}" >&2
  exit 1
}

if [ -z "$1" ]; then
  exit_with_err "No CodeCharta version specified"
fi

CC_VERSION=$1
CC_TAR_NAME="codecharta-analysis-${CC_VERSION}.tar"
CCSH="${INSTALL_DIR}/codecharta-analysis-${CC_VERSION}/bin/ccsh"
DATA="data/codecharta"

install_codecharta() {
  echo
  echo "Installing CodeCharta analysis to ${INSTALL_DIR}"
  echo
  mkdir -p "${INSTALL_DIR}"
  cp "$1" "${INSTALL_DIR}"
  tar xf "${INSTALL_DIR}/${CC_TAR_NAME}" -C "${INSTALL_DIR}"
  rm "${INSTALL_DIR}/${CC_TAR_NAME}"
}

deinstall_codecharta() {
  echo
  echo "Deleting CodeCharta test installation in ${INSTALL_DIR}"
  echo
  rm -rf "${INSTALL_DIR}"
}

validate() {
  if ! "${CCSH}" check "$1"; then
    exit_with_err "$1 no valid cc.json"
  fi
}

check_gitlogparser_log_scan() {
  echo " -- expect GitLogParser log-scan subcommand to produce valid cc.json file"
  ACTUAL_GITLOG_JSON_LOG_SCAN="${INSTALL_DIR}/actual_gitlogparser_log_scan.cc.json"
  returnCode="0"
  timeout 60s "${CCSH}" gitlogparser "log-scan" --git-log "${DATA}/gitlogparser-cc.txt" --repo-files "${DATA}/gitlogparser-cc-filelist.txt" -o "${ACTUAL_GITLOG_JSON_LOG_SCAN}" -nc || returnCode="$?"
  if [ "$returnCode" -eq 124 ]; then
    exit_with_err "Parser got stuck, this is likely due to an open System.in stream not handled correctly"
  elif [ "$returnCode" -ne 0 ]; then
    exit_with_err "Parser exited with code $returnCode"
  fi
  validate "${ACTUAL_GITLOG_JSON_LOG_SCAN}"
}

check_gitlogparser_repo_scan() {
  echo " -- expect GitLogParser repo-scan subcommand to produce valid cc.json file"
  ACTUAL_GITLOG_JSON_REPO_SCAN="${INSTALL_DIR}/actual_gitlogparser_repo_scan.cc.json"
  returnCode="0"
  timeout 60s "${CCSH}" gitlogparser "repo-scan" --repo-path "$(dirname "$(dirname "$PWD")")" -o "${ACTUAL_GITLOG_JSON_REPO_SCAN}" -nc || returnCode="$?"
  if [ "$returnCode" -eq 124 ]; then
    exit_with_err "Parser got stuck, this is likely due to an open System.in stream not handled correctly"
  elif [ "$returnCode" -ne 0 ]; then
    exit_with_err "Parser exited with code $returnCode"
  fi
  validate "${ACTUAL_GITLOG_JSON_REPO_SCAN}"
}

check_csvexporter() {
  echo " -- expect CSVexporter to produce correct csv table"
  ACTUAL_CSVEXPORT="${INSTALL_DIR}/actual_csvexport.csv"
  "${CCSH}" csvexport "${DATA}/csvexport_input.cc.json" --depth-of-hierarchy=2 -o "${ACTUAL_CSVEXPORT}"
  if ! cmp --silent -- "${ACTUAL_CSVEXPORT}" "${DATA}/csvexport_gold.csv"; then
    exit_with_err "${ACTUAL_CSVEXPORT} could not be found or is not equal to gold"
  fi
}

check_edgefilter() {
  echo " -- expect Edgefilter to produce valid cc.json file"
  ACTUAL_EDGEFILTER_JSON="${INSTALL_DIR}/actual_edgefilter.cc.json"
  "${CCSH}" edgefilter "${DATA}/edgefilter.cc.json" -o "${ACTUAL_EDGEFILTER_JSON}"
  validate "${ACTUAL_EDGEFILTER_JSON}"
}

check_mergefilter() {
  echo " -- expect MergeFilter to produce valid cc.json file"
  ACTUAL_MERGEFILTER_JSON="${INSTALL_DIR}/actual_mergefilter.cc.json"
  "${CCSH}" merge "${DATA}/mergefilter_a.cc.json" "${DATA}/mergefilter_b.cc.json" -o "${ACTUAL_MERGEFILTER_JSON}" -nc
  validate "${ACTUAL_MERGEFILTER_JSON}"
}

check_codemaatimporter() {
  echo " -- expect CodeMaatImporter to produce valid cc.json.gz file"
  ACTUAL_CODEMAAT_JSON="${INSTALL_DIR}/actual_codemaatimporter.cc.json.gz"
  "${CCSH}" codemaatimport "${DATA}/codemaat.csv" -o "${ACTUAL_CODEMAAT_JSON}"
  validate "${ACTUAL_CODEMAAT_JSON}"
}

check_csvimporter() {
  echo " -- expect CSVimporter to produce valid cc.json file with corrected name"
  ACTUAL_CSVIMPORT_JSON="${INSTALL_DIR}/actual_csvimport"
  "${CCSH}" csvimport "${DATA}/csvimport.csv" -o "${ACTUAL_CSVIMPORT_JSON}.json" -nc
  validate "${ACTUAL_CSVIMPORT_JSON}.cc.json"
}

check_sourcemonitor() {
  echo " -- expect SourceMonitorImporter to produce valid cc.json on system.out"
  ACTUAL_SOURCEMON_JSON="${INSTALL_DIR}/actual_sourcemonitorimporter.json"
  "${CCSH}" sourcemonitorimport ${DATA}/sourcemonitor.csv >"${ACTUAL_SOURCEMON_JSON}"
  validate "${ACTUAL_SOURCEMON_JSON}"
}

check_jasome() {
  echo " -- expect JasomeImporter to produce valid cc.json file"
  ACTUAL_JASOME_JSON="${INSTALL_DIR}/actual_jasomeimport.cc.json"
  "${CCSH}" jasomeimport "${DATA}/jasome.xml" -o "${ACTUAL_JASOME_JSON}" -nc
  validate "${ACTUAL_JASOME_JSON}"
}

check_metricgardener() {
  echo " -- expect MetricGardenerImporter to produce valid cc.json file with added extensions"
  ACTUAL_METRICGARDENER_JSON="${INSTALL_DIR}/actual_metricgardenerparser"
  "${CCSH}" metricgardenerimport "${DATA}/metricgardener.json" -o "${ACTUAL_METRICGARDENER_JSON}" --is-json-file
  validate "${ACTUAL_METRICGARDENER_JSON}.cc.json.gz"

  echo " -- expect MetricGardenerImporter to produce valid cc.json file when no MG.json was available"
  ACTUAL_METRICGARDENER_JSON2="${INSTALL_DIR}/actual_metricgardenerparser2"
  "${CCSH}" metricgardenerimport "${DATA}/metric-gardener-Example" -o "${ACTUAL_METRICGARDENER_JSON2}"
  validate "${ACTUAL_METRICGARDENER_JSON2}.cc.json.gz"
}

check_sonar() {
  echo " -- expect SonarImporter to produce valid cc.json file with multiple extensions"
  ACTUAL_SONAR_JASON="${INSTALL_DIR}/actual_sonarimport.drive0.storage"
  "${CCSH}" sonarimport https://sonarcloud.io maibornwolff-gmbh_codecharta_visualization -o ${ACTUAL_SONAR_JASON} -nc
  validate "${ACTUAL_SONAR_JASON}.cc.json"
}

check_sourcecodeparser() {
  echo " -- expect SourceCodeParser to produce valid cc.json file"
  ACTUAL_SCP_JSON="${INSTALL_DIR}/actual_scpparser.cc.json"
  "${CCSH}" sourcecodeparser "${DATA}/sourcecode.java" -o "${ACTUAL_SCP_JSON}" -nc
  validate "${ACTUAL_SCP_JSON}"
}

check_svnlog() {
  echo " -- expect SVNLogParser to produce valid cc.json to system.out"
  ACTUAL_SVNLOG_JSON="${INSTALL_DIR}/actual_svnlogparser.json"
  "${CCSH}" svnlogparser "${DATA}/SVNTestLog.txt" --silent >"${ACTUAL_SVNLOG_JSON}"
  validate "${ACTUAL_SVNLOG_JSON}"
}

check_tokei() {
  echo " -- expect TokeiImporter to produce valid cc.json file"
  ACTUAL_TOKEI_JSON="${INSTALL_DIR}/actual_tokeiparser.cc.json"
  "${CCSH}" tokeiimporter "${DATA}/tokei_results.json" --path-separator \\ -o "${ACTUAL_TOKEI_JSON}" -nc
  validate "${ACTUAL_TOKEI_JSON}"
}

check_rawtext() {
  echo " -- expect RawTextParser to produce valid cc.json file"
  ACTUAL_RAWTEXT_JSON="${INSTALL_DIR}/actual_rawtextparser.cc.json"
  "${CCSH}" rawtextparser "${DATA}/rawText/" -o "${ACTUAL_RAWTEXT_JSON}" -nc
  validate "${ACTUAL_RAWTEXT_JSON}"
}

check_pipe() {
  echo " -- expect pipe chain from tokei, sourcecodeparser, svnlogparser and modify to work"
  sh "${CCSH}" tokeiimporter "${DATA}/tokei_results.json" --path-separator \\ |
    sh "${CCSH}" sourcecodeparser "${DATA}/sourcecode.java" |
    sh "${CCSH}" svnlogparser "${DATA}/SVNTestLog.txt" |
    sh "${CCSH}" modify --move-from=root/src --move-to=root/bar \
      -o ${INSTALL_DIR}/piped_out.json 2>${INSTALL_DIR}/piped_out_log.json
  validate ${INSTALL_DIR}/piped_out.cc.json
  if ! grep -q "Created Project with 9 leaves." ${INSTALL_DIR}/piped_out_log.json; then
    exit_with_err "ERR: Pipes broken."
  fi
}

run_tests() {
  echo
  echo "Running Tests..."
  echo

  check_gitlogparser_log_scan
  check_gitlogparser_repo_scan
  check_csvexporter
  check_edgefilter
  check_mergefilter
  check_codemaatimporter
  check_csvimporter
  check_sourcemonitor
  check_jasome
  check_metricgardener
  check_sonar
  check_sourcecodeparser
  check_svnlog
  check_tokei
  check_rawtext

  check_pipe

  echo
  echo "... Testing finished."
  echo
}

install_codecharta "../build/distributions/${CC_TAR_NAME}"
run_tests
deinstall_codecharta
