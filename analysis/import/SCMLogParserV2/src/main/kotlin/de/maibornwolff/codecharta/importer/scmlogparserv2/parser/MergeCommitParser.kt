package de.maibornwolff.codecharta.importer.scmlogparserv2.parser

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Commit

class MergeCommitParser : CommitParser {

    override fun canParse(commit: Commit): Boolean {
        return !commit.isEmpty && commit.isMergeCommit()
    }

    override fun parse(commit: Commit, versionControlledFilesList: VersionControlledFilesList) {
        commit.modifications.forEach {

            val file = versionControlledFilesList.get(it.getTrackName())
            if (file == null || !file.isMutated()) {
                // Handle mutated files only when a merge commit occurs
                return
            }

            if (file.isDeleted() && it.isTypeAdd()) {
                file.unmarkDeleted()
                file.resetMutation()
            } else if (it.isTypeAdd()) {
                // Do not handle redundant Add modifications for the same file.
                // Why is this happening?
            } else if (it.isTypeDelete() || it.isTypeModify()) {
                file.resetMutation()
            } else {
                System.err.println(
                    "\nUnhandled Edge Case in MergeCommit: deleted: %s, mutated: %s, modification type: %s, initalAdd: %s, file: %s"
                        .format(file.isDeleted(), file.isMutated(), it.type, it.isInitialAdd(), file.filename)
                )
            }
        }
    }
}
