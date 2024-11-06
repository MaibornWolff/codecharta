const Configuration = {
    extends: ["@commitlint/config-conventional"],
    formatter: "@commitlint/format",
    rules: {
        "scope-enum": [2, "always", ["analysis", "visualization", "docker", "gh-pages", "docs", "readme", "stg", "config"]],
        "body-case": [0, "always", [""]],
        "body-max-line-length": [0, "always", 100]
    },
    /*
     * Array of functions that return true if commitlint should ignore the given message.
     * Given array is merged with predefined functions, which consist of matchers like:
     *
     * - 'Merge pull request', 'Merge X into Y' or 'Merge branch X'
     * - 'Revert X'
     * - 'v1.2.3' (ie semver matcher)
     * - 'Automatic merge X' or 'Auto-merged X into Y'
     *
     * To see full list, check https://github.com/conventional-changelog/commitlint/blob/master/%40commitlint/is-ignored/src/defaults.ts.
     * To disable those ignores and run rules always, set `defaultIgnores: false` as shown below.
     */
    ignores: [commit => /^Releasing (ana|vis)-/.test(commit)],
    /*
     * Whether commitlint uses the default ignore rules, see the description above.
     */
    defaultIgnores: true,
    /*
     * Custom URL to show upon failure
     */
    helpUrl: "https://github.com/conventional-changelog/commitlint/#what-is-commitlint"
}

module.exports = Configuration
