package de.maibornwolff.codecharta.analysers.analyserinterface.commit

import java.io.File

data class CommitAnalysisContext(val inputDir: File, val worktreeManager: GitWorktreeManager?, val shortHash: String?) {
    fun resolveOutputFile(outputFile: String?): String? {
        if (outputFile.isNullOrEmpty() || shortHash == null) return outputFile
        val file = File(outputFile)
        val prefixedName = "$shortHash.${file.name}"
        return if (file.parent != null) File(file.parent, prefixedName).path else prefixedName
    }
}
