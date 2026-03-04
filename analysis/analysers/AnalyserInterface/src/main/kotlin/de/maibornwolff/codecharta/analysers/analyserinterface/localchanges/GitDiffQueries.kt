package de.maibornwolff.codecharta.analysers.analyserinterface.localchanges

class GitDiffQueries(private val git: GitCommandRunner) {
    companion object {
        private const val DIFF = "diff"
        private const val REV_PARSE = "rev-parse"
        private const val NAME_ONLY = "--name-only"
        private const val CACHED = "--cached"
        private const val DIFF_FILTER_CHANGED = "--diff-filter=ACMR"
        private const val DIFF_FILTER_DELETED = "--diff-filter=D"
        private const val IS_INSIDE_WORK_TREE = "--is-inside-work-tree"
        private const val ABBREV_REF = "--abbrev-ref"
        private const val UPSTREAM_REF = "@{upstream}"
        private const val LS_FILES = "ls-files"
        private const val OTHERS = "--others"
        private const val EXCLUDE_STANDARD = "--exclude-standard"
    }

    fun isInsideWorkTree(): String = git.run(REV_PARSE, IS_INSIDE_WORK_TREE)

    fun upstreamBranchName(): String = git.run(REV_PARSE, ABBREV_REF, UPSTREAM_REF)

    fun changedFilesSince(ref: String): Set<String> = git.runAndParseFileList(DIFF, NAME_ONLY, DIFF_FILTER_CHANGED, "$ref...HEAD")

    fun stagedChangedFiles(): Set<String> = git.runAndParseFileList(DIFF, NAME_ONLY, DIFF_FILTER_CHANGED, CACHED)

    fun unstagedChangedFiles(): Set<String> = git.runAndParseFileList(DIFF, NAME_ONLY, DIFF_FILTER_CHANGED)

    fun deletedFilesSince(ref: String): Set<String> = git.runAndParseFileList(DIFF, NAME_ONLY, DIFF_FILTER_DELETED, "$ref...HEAD")

    fun stagedDeletedFiles(): Set<String> = git.runAndParseFileList(DIFF, NAME_ONLY, DIFF_FILTER_DELETED, CACHED)

    fun unstagedDeletedFiles(): Set<String> = git.runAndParseFileList(DIFF, NAME_ONLY, DIFF_FILTER_DELETED)

    fun untrackedFiles(): Set<String> = git.runAndParseFileList(LS_FILES, OTHERS, EXCLUDE_STANDARD)
}
