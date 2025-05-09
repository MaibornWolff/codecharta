package de.maibornwolff.codecharta.analysers.parsers.sourcecode

import org.sonar.api.internal.apachecommons.io.FilenameUtils
import java.io.File
import java.nio.file.Paths

class ProjectTraverser(var root: File, private val exclude: Array<String> = arrayOf()) {
    private var fileList: MutableList<File> = mutableListOf()
    private val analyzerFileLists: MutableMap<String, MutableList<String>> = HashMap()

    fun traverse() {
        val excludePatterns = exclude.joinToString(separator = "|", prefix = "(", postfix = ")").toRegex()

        root.walk().forEach {
            val standardizedPath = "/" + getRelativeFileName(it.toString())
            if (it.isFile && !(exclude.isNotEmpty() && excludePatterns.containsMatchIn(standardizedPath))) {
                fileList.add(it)
            }
        }

        adjustRootFolderIfRootIsFile()
        assignFilesToAnalyzers()
    }

    private fun assignFilesToAnalyzers() {
        for (file in this.fileList) {
            val fileName = getRelativeFileName(file.toString())
            val fileExtension = FilenameUtils.getExtension(fileName)

            val fileExtensionEntry = analyzerFileLists[fileExtension]
            if (fileExtensionEntry != null) {
                fileExtensionEntry.add(fileName)
            } else {
                val fileListForType: MutableList<String> = mutableListOf()
                fileListForType.add(fileName)
                this.analyzerFileLists[fileExtension] = fileListForType
            }
        }
    }

    fun getFileListByExtension(type: String): List<String> {
        return if (this.analyzerFileLists.containsKey(type)) {
            this.analyzerFileLists[type] ?: listOf()
        } else {
            ArrayList()
        }
    }

    private fun getRelativeFileName(fileName: String): String {
        return root.toPath().toAbsolutePath()
            .relativize(Paths.get(fileName).toAbsolutePath())
            .toString()
            .replace('\\', '/')
    }

    private fun adjustRootFolderIfRootIsFile() {
        if (root.isFile) {
            root = root.absoluteFile.parentFile
        }
    }
}
