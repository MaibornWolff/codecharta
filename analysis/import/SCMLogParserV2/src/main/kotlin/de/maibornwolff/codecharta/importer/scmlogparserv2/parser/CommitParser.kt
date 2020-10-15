package de.maibornwolff.codecharta.importer.scmlogparserv2.parser

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Commit

interface CommitParser {

    fun canParse(commit: Commit): Boolean

    fun parse(commit: Commit, versionControlledFilesList: VersionControlledFilesList)
}
