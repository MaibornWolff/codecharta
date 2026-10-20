package de.maibornwolff.codecharta.analysers.analyserinterface.commit

import java.io.File

data class CommitAnalysisContext(val inputDir: File, val worktreeManager: GitWorktreeManager?, val shortHash: String?) {
    fun resolveOutputFile(outputFile: String?): String? {
        if (outputFile.isNullOrEmpty() || shortHash == null) return outputFile
        val file = File(outputFile)
        val prefixedName = "$shortHash.${file.name}"
        return if (file.parent != null) File(file.parent, prefixedName).path else prefixedName
    }

    companion object {
        fun at(inputFile: File, commitRef: String?): CommitAnalysisContext {
            if (commitRef == null) return CommitAnalysisContext(inputFile, null, null)

            val repoRootPath = findGitRoot(inputFile).absoluteFile.toPath().normalize()
            val inputPath = inputFile.absoluteFile.toPath().normalize()
            require(inputPath.startsWith(repoRootPath)) {
                "Input path must be inside the git repository: $inputPath"
            }
            val relativePath = repoRootPath.relativize(inputPath)
            val manager = GitWorktreeManager(repoRootPath.toFile())
            val resolvedCommit = manager.resolveCommitHash(commitRef)
            val shortHash = manager.shortCommitHash(resolvedCommit)
            val worktreeDir = manager.createWorktree(resolvedCommit)
            val effectiveInput = File(worktreeDir, relativePath.toString())
            return CommitAnalysisContext(effectiveInput, manager, shortHash)
        }

        private fun findGitRoot(startDir: File): File {
            val absoluteStart = startDir.absoluteFile
            var dir = if (absoluteStart.isFile) absoluteStart.parentFile else absoluteStart
            while (dir != null) {
                if (File(dir, ".git").exists()) return dir
                dir = dir.parentFile
            }
            throw IllegalArgumentException("Not a git repository: ${absoluteStart.path}")
        }
    }
}
