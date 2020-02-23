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

check_sourcemonitor() {
  echo " -- expect SourceMonitorImporter gives valid cc.json"
  ACTUAL_SOURCEMON_JSON="${INSTALL_DIR}/actual_sourcemonitorimporter.json"
  "${CCSH}" sourcemonitorimport data/codecharta/sourcemonitor.csv > "${ACTUAL_SOURCEMON_JSON}"
  validate "${ACTUAL_SOURCEMON_JSON}"
}

check_understand() {
  echo " -- expect UnderstandImporter gives valid cc.json"
  ACTUAL_UNDERSTAND_JSON="${INSTALL_DIR}/actual_understandimporter.json"
  "${CCSH}" understandimport data/codecharta/understand.csv > "${ACTUAL_UNDERSTAND_JSON}" 2>${INSTALL_DIR}/understand_err.log
  validate "${ACTUAL_UNDERSTAND_JSON}"
}

check_crococosmo() {
  echo " -- expect CrococosmoImporter gives valid cc.json"
  ACTUAL_COSMO_JSON="${INSTALL_DIR}/actual_cosmoimport.json"
  "${CCSH}" crococosmoimport data/codecharta/crococosmo.xml > "${ACTUAL_COSMO_JSON}"
  validate "${ACTUAL_COSMO_JSON}"
}

check_jasome() {
  echo " -- expect JasomeImporter gives valid cc.json"
  ACTUAL_JASOME_JSON="${INSTALL_DIR}/actual_jasomeimport.json"
  "${CCSH}" jasomeimport data/codecharta/jasome.xml > "${ACTUAL_JASOME_JSON}"
  validate "${ACTUAL_JASOME_JSON}"
}

check_scmlog() {
  echo " -- expect SCMLogParser gives valid cc.json"
  ACTUAL_SCMLOG_JSON="${INSTALL_DIR}/actual_scmlog.json"
  "${CCSH}" scmlogparser --input-format=SVN_LOG data/codecharta/SVNTestLog.txt --silent > "${ACTUAL_SCMLOG_JSON}"
  validate "${ACTUAL_SCMLOG_JSON}"
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
        | sh "${CCSH}" scmlogparser --input-format=SVN_LOG data/codecharta/SVNTestLog.txt \
        | sh "${CCSH}" modify --move-from=root/src --move-to=root/bar \
            -o ${INSTALL_DIR}/piped_out.json 2> ${INSTALL_DIR}/piped_out_log.json
    validate ${INSTALL_DIR}/piped_out.json
    if ! grep -q "Created Project with 9 leaves." ${INSTALL_DIR}/piped_out_log.json; then
      exit_with_err "ERR: Pipes broken."
    fi
}

run_tests() {
  echo
  echo "Running Tests..."
  echo

  check_sourcemonitor
  check_crococosmo
  check_understand
  check_jasome
  check_scmlog
  check_merge
  check_modify
  check_sourcecodeparser
  check_tokei

  check_pipe

  echo
  echo "... Testing finished."
  echo
}


install_codecharta "../build/distributions/${CC_TAR_NAME}"
run_tests
deinstall_codecharta
