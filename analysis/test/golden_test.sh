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
CC_TAR_NAME="codecharta-${CC_VERSION}.tar"
CCSH="${INSTALL_DIR}/codecharta-${CC_VERSION}/ccsh"

install_codecharta() {
    echo
    echo "Installing CodeCharta analysis to ${INSTALL_DIR}"
    echo
    mkdir -p "${INSTALL_DIR}"
    cp "$1" "${INSTALL_DIR}"
    tar xf "${INSTALL_DIR}/${CC_TAR_NAME}" -C "${INSTALL_DIR}"
    "${CCSH}" install
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
  "${CCSH}" sonarimport data/codecharta/sonar.xml -l --old-api -o "${ACTUAL_SONAR_JSON}"
  validate "${ACTUAL_SONAR_JSON}"
}

check_sourcemonitor() {
  echo " -- expect SourceMonitorImporter gives valid cc.json"
  ACTUAL_SOURCEMON_JSON="${INSTALL_DIR}/actual_sourcemonitorimporter.json"
  echo "${CCSH}" sourcemonitorimport data/codecharta/sourcemonitor.csv > "${ACTUAL_SOURCEMON_JSON}"
  "${CCSH}" sourcemonitorimport data/codecharta/sourcemonitor.csv > "${ACTUAL_SOURCEMON_JSON}"
  validate "${ACTUAL_SOURCEMON_JSON}"
}

run_tests() {
  echo
  echo "Running Tests..."
  echo

  check_sonar
  check_sourcemonitor

  echo
  echo "... Testing finished."
  echo
}


install_codecharta "../build/distributions/${CC_TAR_NAME}"
run_tests
deinstall_codecharta
