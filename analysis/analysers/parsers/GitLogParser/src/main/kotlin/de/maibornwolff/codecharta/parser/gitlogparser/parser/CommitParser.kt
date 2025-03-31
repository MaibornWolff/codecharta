package de.maibornwolff.codecharta.parser.gitlogparser.parser

import de.maibornwolff.codecharta.parser.gitlogparser.input.Commit

interface CommitParser {
    fun canParse(commit: Commit): Boolean

    fun parse(commit: Commit, versionControlledFilesList: VersionControlledFilesList)
}
