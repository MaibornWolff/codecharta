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

commit_ownership_fixture_file() {
  local author="$1"
  local content="$2"
  local message
  message="$(printf "%b" "${3:-change}")"
  printf "%b" "$content" >"${OWNERSHIP_REPO}/app.kt"
  git -C "${OWNERSHIP_REPO}" add -A
  GIT_AUTHOR_NAME="$author" GIT_AUTHOR_EMAIL="$author@example.org" GIT_AUTHOR_DATE="2024-01-01T12:00:00Z" \
    GIT_COMMITTER_NAME="$author" GIT_COMMITTER_EMAIL="$author@example.org" GIT_COMMITTER_DATE="2024-01-01T12:00:00Z" \
    git -C "${OWNERSHIP_REPO}" -c commit.gpgsign=false commit -q -m "$message"
}

check_gitlogparser_author_ownership() {
  echo " -- expect GitLogParser repo-scan to write the same pseudonymous author ownership on every run"
  OWNERSHIP_REPO="$(mktemp -d "${TEMP_DIR}/author_ownership_repo.XXXXXX")"
  ACTUAL_OWNERSHIP_FIRST="${TEMP_DIR}/actual_author_ownership_first.cc.json"
  ACTUAL_OWNERSHIP_SECOND="${TEMP_DIR}/actual_author_ownership_second.cc.json"
  git -C "${OWNERSHIP_REPO}" init -q
  commit_ownership_fixture_file "Golden First" "1\n2\n3\n4\n"
  commit_ownership_fixture_file "Golden Second" "1\n2\n3\nfour\n"

  "${CCSH}" gitlogparser repo-scan --repo-path "${OWNERSHIP_REPO}" --author-ownership -o "${ACTUAL_OWNERSHIP_FIRST}" --silent=true -nc
  "${CCSH}" gitlogparser repo-scan --repo-path "${OWNERSHIP_REPO}" --author-ownership -o "${ACTUAL_OWNERSHIP_SECOND}" --silent=true -nc
  validate "${ACTUAL_OWNERSHIP_FIRST}"
  if ! diff -q -- "${ACTUAL_OWNERSHIP_FIRST}" "${ACTUAL_OWNERSHIP_SECOND}"; then
    exit_with_err "Two runs of the author ownership differ"
  fi
  if grep -q "Golden" "${ACTUAL_OWNERSHIP_FIRST}"; then
    exit_with_err "The author ownership wrote a name"
  fi
  ACTUAL_OWNERSHIP_NAMES="${TEMP_DIR}/actual_author_ownership_names.cc.json"
  "${CCSH}" gitlogparser repo-scan --repo-path "${OWNERSHIP_REPO}" --author-ownership --with-author-names -o "${ACTUAL_OWNERSHIP_NAMES}" --silent=true -nc
  validate "${ACTUAL_OWNERSHIP_NAMES}"
  if ! grep -q "Golden First" "${ACTUAL_OWNERSHIP_NAMES}"; then
    exit_with_err "--with-author-names wrote no name"
  fi
  for expected in \
    '"id":"154c603-author-magenta-rabbit","name":"Magenta Rabbit","members":[{"nodeId":"ed41804914e906d4","weight":0.75}]' \
    '"id":"154c603-author-ochre-elk","name":"Ochre Elk","members":[{"nodeId":"ed41804914e906d4","weight":0.25}]'; do
    if ! grep -qF -- "$expected" "${ACTUAL_OWNERSHIP_FIRST}"; then
      exit_with_err "The author ownership is missing $expected"
    fi
  done
}

check_gitlogparser_commit_changes() {
  echo " -- expect GitLogParser repo-scan to write the same commit changes on every run, and modify to keep them"
  COMMIT_CHANGES_REPO="$(mktemp -d "${TEMP_DIR}/commit_changes_repo.XXXXXX")"
  ACTUAL_COMMIT_CHANGES_FIRST="${TEMP_DIR}/actual_commit_changes_first.cc.json"
  ACTUAL_COMMIT_CHANGES_SECOND="${TEMP_DIR}/actual_commit_changes_second.cc.json"
  ACTUAL_COMMIT_CHANGES_MOVED="${TEMP_DIR}/actual_commit_changes_moved.cc.json"
  git -C "${COMMIT_CHANGES_REPO}" init -q
  OWNERSHIP_REPO="${COMMIT_CHANGES_REPO}"
  commit_ownership_fixture_file "Golden First" "1\n2\n3\n4\n"
  mkdir "${COMMIT_CHANGES_REPO}/src"
  printf "1\n" >"${COMMIT_CHANGES_REPO}/src/util.kt"
  commit_ownership_fixture_file "Golden Second" "1\n2\n3\nfour\n" "change\n\nCo-authored-by: Golden Third <third@example.org>"

  "${CCSH}" gitlogparser repo-scan --repo-path "${COMMIT_CHANGES_REPO}" --commit-changes-since=2000-01-01 -o "${ACTUAL_COMMIT_CHANGES_FIRST}" --silent=true -nc
  "${CCSH}" gitlogparser repo-scan --repo-path "${COMMIT_CHANGES_REPO}" --commit-changes-since=2000-01-01 -o "${ACTUAL_COMMIT_CHANGES_SECOND}" --silent=true -nc
  validate "${ACTUAL_COMMIT_CHANGES_FIRST}"
  if ! diff -q -- "${ACTUAL_COMMIT_CHANGES_FIRST}" "${ACTUAL_COMMIT_CHANGES_SECOND}"; then
    exit_with_err "Two runs of the commit changes differ"
  fi
  if grep -q "Golden" "${ACTUAL_COMMIT_CHANGES_FIRST}"; then
    exit_with_err "The commit changes wrote a name"
  fi
  "${CCSH}" modify "${ACTUAL_COMMIT_CHANGES_FIRST}" --move-from=root/src --move-to=root/moved -o "${ACTUAL_COMMIT_CHANGES_MOVED}"
  validate "${ACTUAL_COMMIT_CHANGES_MOVED}"
  for actual in "${ACTUAL_COMMIT_CHANGES_FIRST}" "${ACTUAL_COMMIT_CHANGES_MOVED}"; do
    if ! grep -qF -- '"author":"Ochre Elk","co_authors":"Lime Wolf","changed_files":2,"changed_lines":3' "${actual}"; then
      exit_with_err "${actual} lost the attributes of a commit"
    fi
  done
  ACTUAL_COMMIT_CHANGES_NAMES="${TEMP_DIR}/actual_commit_changes_names.cc.json"
  "${CCSH}" gitlogparser repo-scan --repo-path "${COMMIT_CHANGES_REPO}" --author-ownership --with-author-names --commit-changes-since=2000-01-01 -o "${ACTUAL_COMMIT_CHANGES_NAMES}" --silent=true -nc
  validate "${ACTUAL_COMMIT_CHANGES_NAMES}"
  if ! grep -qF -- '"author":"Golden Second","co_authors":"Golden Third","changed_files":2' "${ACTUAL_COMMIT_CHANGES_NAMES}"; then
    exit_with_err "--with-author-names wrote no real author into the commit changes"
  fi
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

check_coverageimporter_javascript() {
    echo " ---- expect CoverageImporter to produce valid cc.json file for lcov"
    ACTUAL_LCOV_COVERAGE_JSON="${TEMP_DIR}/actual_coverageimporter_lcov.cc.json"
    "${CCSH}" coverageimport "${DATA}/coverageReports/lcov.info" --format=lcov -o "${ACTUAL_LCOV_COVERAGE_JSON}" -nc
    validate "${ACTUAL_LCOV_COVERAGE_JSON}"
}

check_coverageimporter_java() {
    echo " ---- expect CoverageImporter to produce valid cc.json file for jacoco"
    ACTUAL_JACOCO_COVERAGE_JSON="${TEMP_DIR}/actual_coverageimporter_jacoco.cc.json"
    "${CCSH}" coverageimport "${DATA}/coverageReports/jacoco.xml" --format=jacoco -o "${ACTUAL_JACOCO_COVERAGE_JSON}" -nc
    validate "${ACTUAL_JACOCO_COVERAGE_JSON}"
}

check_coverageimporter_clover() {
    echo " ---- expect CoverageImporter to produce valid cc.json file for clover"
    ACTUAL_CLOVER_COVERAGE_JSON="${TEMP_DIR}/actual_coverageimporter_clover.cc.json"
    "${CCSH}" coverageimport "${DATA}/coverageReports/clover.xml" --format=clover -o "${ACTUAL_CLOVER_COVERAGE_JSON}" -nc
    validate "${ACTUAL_CLOVER_COVERAGE_JSON}"
}

check_coverageimporter_cobertura() {
    echo " ---- expect CoverageImporter to produce valid cc.json file for cobertura"
    ACTUAL_COBERTURA_COVERAGE_JSON="${TEMP_DIR}/actual_coverageimporter_cobertura.cc.json"
    "${CCSH}" coverageimport "${DATA}/coverageReports/coverage.cobertura.xml" --format=cobertura -o "${ACTUAL_COBERTURA_COVERAGE_JSON}" -nc
    validate "${ACTUAL_COBERTURA_COVERAGE_JSON}"
}

check_codemaatimporter_phpunit() {
    echo " ---- expect CoverageImporter to produce valid cc.json file for phpunit"
    ACTUAL_PHPUNIT_COVERAGE_JSON="${TEMP_DIR}/actual_coverageimporter_phpunit.cc.json"
    "${CCSH}" coverageimport "${DATA}/coverageReports/phpunit.xml" --format=phpunit -o "${ACTUAL_PHPUNIT_COVERAGE_JSON}" -nc
    validate "${ACTUAL_PHPUNIT_COVERAGE_JSON}"
}

check_coverageimporter() {
    echo " -- expect CoverageImporter to produce valid cc.json files for all supported languages"
    check_coverageimporter_javascript
    check_coverageimporter_java
    check_coverageimporter_clover
    check_coverageimporter_cobertura
    check_codemaatimporter_phpunit
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

check_unifiedparser() {
  echo " -- expect UnifiedParser to produce valid cc.json file"
  ACTUAL_UNIFIED_JSON="${TEMP_DIR}/actual_unifiedparser.cc.json"
  "${CCSH}" unifiedparser "${DATA}/sourcecode.java" -o "${ACTUAL_UNIFIED_JSON}" -nc
  validate "${ACTUAL_UNIFIED_JSON}"
}

check_domainlanguage() {
  echo " -- expect DomainLanguageParser to produce valid cc.json file"
  ACTUAL_DOMAINLANGUAGE_JSON="${TEMP_DIR}/actual_domainlanguageparser.cc.json"
  # The parser scans a directory, not a single file: pointing it at a file processes 0 files and yields an
  # empty lens, which `validate` happily accepts — so the check has to start from the data directory.
  "${CCSH}" domainlanguageparser "${DATA}" -o "${ACTUAL_DOMAINLANGUAGE_JSON}" -nc
  validate "${ACTUAL_DOMAINLANGUAGE_JSON}"
  # An empty domain lens is also legal, so assert the lens really wraps its node ids in the `nodes`
  # envelope and that each node carries a word bank.
  if ! grep -q '"domain":{"nodes":{' "${ACTUAL_DOMAINLANGUAGE_JSON}" ||
    ! grep -q '"words":\[{"text"' "${ACTUAL_DOMAINLANGUAGE_JSON}"; then
    exit_with_err "${ACTUAL_DOMAINLANGUAGE_JSON} does not carry an enveloped domain lens"
  fi
}

check_domainlanguage_merge() {
  echo " -- expect two domain maps of the same tree to merge into one"
  # Two scans of the same code that disagree on the word banks: the same node ids on both sides, with
  # different words under them. Before the lens could be merged this combination failed outright.
  MODERATE_DOMAIN_JSON="${TEMP_DIR}/domain_moderate.cc.json"
  MINIMAL_DOMAIN_JSON="${TEMP_DIR}/domain_minimal.cc.json"
  MERGED_DOMAIN_JSON="${TEMP_DIR}/actual_domain_merged.cc.json"
  "${CCSH}" domainlanguageparser "${DATA}" -o "${MODERATE_DOMAIN_JSON}" -nc
  "${CCSH}" domainlanguageparser "${DATA}" --stop-word-level=MINIMAL -o "${MINIMAL_DOMAIN_JSON}" -nc
  "${CCSH}" merge "${MODERATE_DOMAIN_JSON}" "${MINIMAL_DOMAIN_JSON}" -o "${MERGED_DOMAIN_JSON}" -nc
  validate "${MERGED_DOMAIN_JSON}"
  if ! grep -q '"domain":{"nodes":{' "${MERGED_DOMAIN_JSON}"; then
    exit_with_err "${MERGED_DOMAIN_JSON} lost its domain lens in the merge"
  fi
}

check_dependacharta() {
  echo " -- expect DependaChartaImporter to produce valid cc.json file"
  ACTUAL_DEPENDACHARTA_JSON="${TEMP_DIR}/actual_dependacharta.cc.json"
  "${CCSH}" dependachartaimport "${DATA}/dependacharta.dc.json" -o "${ACTUAL_DEPENDACHARTA_JSON}" -nc
  validate "${ACTUAL_DEPENDACHARTA_JSON}"
}

check_dependencyparser() {
  echo " -- expect DependencyParser to produce a valid cc.json carrying the whole dependency graph"
  ACTUAL_DEPENDENCYPARSER_JSON="${TEMP_DIR}/actual_dependencyparser.cc.json"
  "${CCSH}" dependencyparser "${DATA}/dependencyproject" -o "${ACTUAL_DEPENDENCYPARSER_JSON}" -nc
  validate "${ACTUAL_DEPENDENCYPARSER_JSON}"
  # An empty dependency lens is also legal, so assert the sample really produced edges, per-node levels
  # and all four edge types: regular (neither flag), cyclic, container-level feedback (upward only) and
  # leaf-level feedback (both).
  if ! grep -q '"edges":\[{"fromId"' "${ACTUAL_DEPENDENCYPARSER_JSON}" ||
    ! grep -q '"nodes":{' "${ACTUAL_DEPENDENCYPARSER_JSON}" ||
    ! grep -q '"isCyclic":true' "${ACTUAL_DEPENDENCYPARSER_JSON}" ||
    ! grep -q '"isPointingUpwards":true' "${ACTUAL_DEPENDENCYPARSER_JSON}"; then
    exit_with_err "${ACTUAL_DEPENDENCYPARSER_JSON} does not carry a levelized dependency graph"
  fi
  if ! grep -q '"outgoing_dependencies"' "${ACTUAL_DEPENDENCYPARSER_JSON}"; then
    exit_with_err "${ACTUAL_DEPENDENCYPARSER_JSON} does not carry the per-file dependency counts"
  fi
  # The same analysis is emitted a second time at declaration level, so assert the logical tables are
  # there alongside the physical ones: the namespaces with their parents, the declarations of each file
  # with their kind, and the declaration-level edges with the way each dependency is used.
  if ! grep -q '"namespaces":{' "${ACTUAL_DEPENDENCYPARSER_JSON}" ||
    ! grep -q '"parent":"' "${ACTUAL_DEPENDENCYPARSER_JSON}" ||
    ! grep -q '"leaves":{' "${ACTUAL_DEPENDENCYPARSER_JSON}" ||
    ! grep -q '"leafEdges":\[{"fromId":"[^"]*","fromLeaf":"[^"]*","toId"' "${ACTUAL_DEPENDENCYPARSER_JSON}" ||
    ! grep -q '"kind":"class"' "${ACTUAL_DEPENDENCYPARSER_JSON}" ||
    ! grep -q '"usage":\["' "${ACTUAL_DEPENDENCYPARSER_JSON}"; then
    exit_with_err "${ACTUAL_DEPENDENCYPARSER_JSON} does not carry the logical package/declaration layer"
  fi
}

check_convert() {
  echo " -- expect convert to upgrade a legacy 1.x file to a valid 2.x cc.json file"
  ACTUAL_CONVERT_JSON="${TEMP_DIR}/actual_convert.cc.json"
  CONVERT_LOG="${TEMP_DIR}/actual_convert_log.txt"
  "${CCSH}" convert "${DATA}/legacy_1_5.cc.json" -o "${ACTUAL_CONVERT_JSON}" -nc 2>"${CONVERT_LOG}"
  validate "${ACTUAL_CONVERT_JSON}"
  # `validate` (ccsh check) alone is blind to a wrong output format, so assert the output is genuine 2.x
  # (meta/lenses envelope, edge carried through as fromId) and not the un-converted legacy 1.x shape.
  if ! grep -q '"apiVersion":"2.1"' "${ACTUAL_CONVERT_JSON}" ||
    ! grep -q '"lenses"' "${ACTUAL_CONVERT_JSON}" ||
    ! grep -q '"fromId"' "${ACTUAL_CONVERT_JSON}"; then
    exit_with_err "${ACTUAL_CONVERT_JSON} is not a 2.x file carrying its edges"
  fi
  if grep -q '"nodes":' "${ACTUAL_CONVERT_JSON}" || grep -q '"data":' "${ACTUAL_CONVERT_JSON}"; then
    exit_with_err "${ACTUAL_CONVERT_JSON} still carries the legacy 1.x shape"
  fi
  # convert drops 1.x-only blacklist/markedPackages; it must say so on stderr (#12).
  if ! grep -q "does not carry blacklist or markedPackages" "${CONVERT_LOG}"; then
    exit_with_err "convert did not warn about dropped blacklist/markedPackages"
  fi
}

check_pipe() {
  echo " -- expect pipe chain from tokei, svnlogparser and modify to work"
  sh "${CCSH}" tokeiimporter "${DATA}/tokei_results.json" --path-separator \\ |
    sh "${CCSH}" svnlogparser "${DATA}/SVNTestLog.txt" |
    sh "${CCSH}" modify --move-from=root/src --move-to=root/bar \
      -o ${TEMP_DIR}/piped_out.json 2>${TEMP_DIR}/piped_out_log.json
  validate ${TEMP_DIR}/piped_out.cc.json
  if ! grep -q "Created Project with 8 leaves." ${TEMP_DIR}/piped_out_log.json; then
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
  check_gitlogparser_author_ownership
  check_gitlogparser_commit_changes
  check_csvexporter
  check_edgefilter
  check_mergefilter
  check_codemaatimporter
  check_csvimporter
  check_sourcemonitor
  check_sonar
  check_coverageimporter
  check_svnlog
  check_tokei
  check_rawtext
  check_unifiedparser
  check_domainlanguage
  check_domainlanguage_merge
  check_dependacharta
  check_dependencyparser
  check_convert

  check_pipe

  check_help
  check_version "$1"

  echo
  echo "... Testing finished."
  echo
}

run_tests "$1"
deinstall_codecharta


