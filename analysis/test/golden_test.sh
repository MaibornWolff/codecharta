#!/usr/bin/env bash
set -e

INSTALL_DIR="../build/tmp/golden test"

exit_with_err(){
  echo $1 >&2
  echo "You have to manually remove ${INSTALL_DIR}" >&2
  exit 1
}

if [[ -z $1 ]]; then
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
  if [[ $? -ne 0 ]]; then
    exit_with_err "$1 no valid cc.json"
  fi
}

check_sonar() {
  echo " -- expect SonarImporter gives valid cc.json"
  ACTUAL_SONAR_JSON="${INSTALL_DIR}/actual_sonarimport.json"
  "${CCSH}" sonarimport -l --old-api -o "${ACTUAL_SONAR_JSON}" data/codecharta/sonar.xml
  validate "${ACTUAL_SONAR_JSON}"
}

check_sourcemonitor() {
  echo " -- expect SourceMonitorImporter gives valid cc.json"
  ACTUAL_SOURCEMON_JSON="${INSTALL_DIR}/actual_sourcemonitorimporter.json"
  "${CCSH}" sourcemonitorimport data/codecharta/sourcemonitor.csv > "${ACTUAL_SOURCEMON_JSON}"
  validate "${ACTUAL_SOURCEMON_JSON}"
}

check_scmlog() {
  echo " -- expect SCMLogParser gives valid cc.json"
  ACTUAL_SCMLOG_JSON="${INSTALL_DIR}/actual_scmlog.json"
  "${CCSH}" scmlogparser --svn data/codecharta/SVNTestLog.txt > "${ACTUAL_SCMLOG_JSON}"
  validate "${ACTUAL_SCMLOG_JSON}"
}

check_merge() {
  echo " -- expect MergeFilter gives valid cc.json"
  ACTUAL_MERGE_JSON="${INSTALL_DIR}/actual_merge.json"
  "${CCSH}" merge data/codecharta/tomerge.json data/codecharta/tomerge2.json > "${ACTUAL_MERGE_JSON}"
  validate "${ACTUAL_MERGE_JSON}"
}

run_tests() {
  echo
  echo "Running Tests..."
  echo

  check_sonar
  check_sourcemonitor
  check_scmlog
  check_merge

  echo
  echo "... Testing finished."
  echo
}


install_codecharta "../build/distributions/${CC_TAR_NAME}"
run_tests
deinstall_codecharta
