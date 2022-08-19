#!/usr/bin/env bash
set -e

INSTALL_DIR="../build/tmp/goldentest"

exit_with_err(){
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
  "${CCSH}" check "$1"
  if [ "$?" -ne 0 ]; then
    exit_with_err "$1 no valid cc.json"
  fi
}

check_gitlogparser() {
  echo " -- expect GitLogParser to produce valid cc.json file"
  ACTUAL_GITLOG_JSON="${INSTALL_DIR}/actual_gitlogparser.cc.json"
  timeout 60s "${CCSH}" gitlogparser "${DATA}/gitlogparser-cc.log" -n "${DATA}/gitlogparser-cc-filelist.log" -o "${ACTUAL_GITLOG_JSON}" -nc
  if [ "$?" -eq 124 ]; then
    exit_with_err "Parser got stuck, this is likely due to an open System.in stream not handled correctly"
  fi
  validate "${ACTUAL_GITLOG_JSON}"
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

check_crococosmo_importer() {
  echo " -- expect CrococosmoImporter to produce valid cc.json files"
  ACTUAL_COSMO_JSON="${INSTALL_DIR}/actual_cosmoimport"
  "${CCSH}" crococosmoimport "${DATA}/crococosmo.xml" -o "${ACTUAL_COSMO_JSON}" -nc
  validate "${ACTUAL_COSMO_JSON}_1.cc.json"
  validate "${ACTUAL_COSMO_JSON}_2.cc.json"
}

check_csvimporter() {
  echo " -- expect CSVimporter to produce valid cc.json file"
  ACTUAL_CSVIMPORT_JSON="${INSTALL_DIR}/actual_csvimport.cc.json"
  "${CCSH}" csvimport "${DATA}/csvimport.csv" -o "${ACTUAL_CSVIMPORT_JSON}" -nc
  validate "${ACTUAL_CSVIMPORT_JSON}"
}

check_sourcemonitor() {
  echo " -- expect SourceMonitorImporter to produce valid cc.json on system.out"
  ACTUAL_SOURCEMON_JSON="${INSTALL_DIR}/actual_sourcemonitorimporter.json"
  "${CCSH}" sourcemonitorimport ${DATA}/sourcemonitor.csv > "${ACTUAL_SOURCEMON_JSON}"
  validate "${ACTUAL_SOURCEMON_JSON}"
}



check_understand() {
  echo " -- expect UnderstandImporter gives valid cc.json"
  ACTUAL_UNDERSTAND_JSON="${INSTALL_DIR}/actual_understandimporter.json"
  "${CCSH}" understandimport data/codecharta/understand.csv > "${ACTUAL_UNDERSTAND_JSON}" 2>${INSTALL_DIR}/understand_err.log
  validate "${ACTUAL_UNDERSTAND_JSON}"
}



check_jasome() {
  echo " -- expect JasomeImporter gives valid cc.json"
  ACTUAL_JASOME_JSON="${INSTALL_DIR}/actual_jasomeimport.json"
  "${CCSH}" jasomeimport data/codecharta/jasome.xml > "${ACTUAL_JASOME_JSON}"
  validate "${ACTUAL_JASOME_JSON}"
}

check_svnlog() {
  echo " -- expect SVNLogParser gives valid cc.json"
  ACTUAL_SVNLOG_JSON="${INSTALL_DIR}/actual_svnlog.json"
  "${CCSH}" svnlogparser data/codecharta/SVNTestLog.txt --silent > "${ACTUAL_SVNLOG_JSON}"
  validate "${ACTUAL_SVNLOG_JSON}"
}

check_merge() {
  echo " -- expect MergeFilter gives valid cc.json"
  ACTUAL_MERGE_JSON="${INSTALL_DIR}/actual_merge.json"
  "${CCSH}" merge data/codecharta/tomerge.json data/codecharta/tomerge2.json > "${ACTUAL_MERGE_JSON}"
  validate "${ACTUAL_MERGE_JSON}"
}

check_modify() {
    echo " -- expect StructureModifier gives valid cc.json"
    ACTUAL_MODIFY_JSON="${INSTALL_DIR}/actual_modify.json"
    "${CCSH}" modify data/codecharta/tomerge.json --move-from=root/src --move-to=root/bar > "${ACTUAL_MODIFY_JSON}"
    validate "${ACTUAL_MODIFY_JSON}"
}

check_sourcecodeparser() {
    echo " -- expect SourceCodeParser gives valid cc.json"
    ACTUAL_SCP_JSON="${INSTALL_DIR}/actual_scp.json"
    "${CCSH}" sourcecodeparser data/codecharta/ > "${ACTUAL_SCP_JSON}"
    validate "${ACTUAL_SCP_JSON}"
}

check_tokei() {
    echo " -- expect TokeiImporter gives valid cc.json"
    ACTUAL_TOKEI_JSON="${INSTALL_DIR}/actual_tokei.json"
    "${CCSH}" tokeiimporter data/codecharta/tokei_results.json --path-separator \\ > "${ACTUAL_TOKEI_JSON}"
    validate "${ACTUAL_TOKEI_JSON}"
}

check_pipe() {
   echo " -- expect pipes to work"
   sh "${CCSH}" tokeiimporter data/codecharta/tokei_results.json --path-separator \\ \
        | sh "${CCSH}" sourcecodeparser data/codecharta/ \
        | sh "${CCSH}" svnlogparser data/codecharta/SVNTestLog.txt \
        | sh "${CCSH}" modify --move-from=root/src --move-to=root/bar \
            -o ${INSTALL_DIR}/piped_out.json 2> ${INSTALL_DIR}/piped_out_log.json
    validate ${INSTALL_DIR}/piped_out.json
    if ! grep -q "Created Project with 9 leaves." ${INSTALL_DIR}/piped_out_log.json; then
      exit_with_err "ERR: Pipes broken."
    fi
}

check_sonar() {
  echo " -- expect sonar to work and system.in to be controled"
  timeout 15 "${CCSH}" sonarimport -nc https://sonarcloud.io maibornwolff-gmbh_codecharta_visualization -o ${INSTALL_DIR}/sonarGoldTest.cc.json
    if [ "$?" -eq 124 ]; then
      exit_with_err "system.in blocks endless "
    fi
}

run_tests() {
  echo
  echo "Running Tests..."
  echo


  check_gitlogparser
  check_csvexporter
  check_edgefilter
  check_mergefilter
  #check_codemaatimporter
  check_crococosmo_importer
  check_csvimporter
  check_sourcemonitor

  #check_sonar

  #check_understand
  #check_jasome
  #check_svnlog
  #check_merge
  #check_modify
  #check_sourcecodeparser
  #check_tokei
  #check_sonar

  #check_pipe

  echo
  echo "... Testing finished."
  echo
}


install_codecharta "../build/distributions/${CC_TAR_NAME}"
run_tests
deinstall_codecharta
