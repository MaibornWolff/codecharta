package de.maibornwolff.codecharta.analysers.parsers.gitlog.parser

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit

interface CommitParser {
    fun canParse(commit: Commit): Boolean

    fun parse(commit: Commit, versionControlledFilesList: VersionControlledFilesList)
}
