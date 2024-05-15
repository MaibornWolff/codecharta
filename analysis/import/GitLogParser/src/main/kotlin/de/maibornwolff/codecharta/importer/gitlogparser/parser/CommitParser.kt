package de.maibornwolff.codecharta.importer.gitlogparser.parser

import de.maibornwolff.codecharta.importer.gitlogparser.input.Commit

interface CommitParser {
    fun canParse(commit: Commit): Boolean

    fun parse(commit: Commit, versionControlledFilesList: VersionControlledFilesList)
}
