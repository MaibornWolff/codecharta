package de.maibornwolff.codecharta.importer.sourcecodeparser

import org.sonar.api.internal.apachecommons.io.FilenameUtils
import java.io.File
import java.nio.file.Paths
import java.util.ArrayList
import java.util.HashMap

class ProjectTraverser(var root: File) {
    private var fileList: MutableList<File> = mutableListOf()
    private val analyzerFileLists: MutableMap<String, MutableList<String>>? = HashMap()

    fun traverse() {
        root.walk().forEach {
            if(it.isFile) fileList.add(it)
        }

        adjustRootFolderIfRootIsFile()
        assignFilesToAnalyzers()
    }

    private fun assignFilesToAnalyzers() {
        for (file in this.fileList) {
            val fileName = getRelativeFileName(file.toString())
            val fileExtension = FilenameUtils.getExtension(fileName)

            if (!this.analyzerFileLists!!.containsKey(fileExtension)) {
                val fileListForType: MutableList<String> = mutableListOf()
                fileListForType.add(fileName)
                this.analyzerFileLists[fileExtension] = fileListForType
            } else {
                this.analyzerFileLists[fileExtension]!!.add(fileName)
            }
        }
    }

    fun getFileListByExtension(type: String): List<String> {
        return if (this.analyzerFileLists!!.containsKey(type)) {
            this.analyzerFileLists[type] ?: listOf()
        } else {
            ArrayList()
        }
    }

    private fun getRelativeFileName(fileName: String): String {

        return root.toPath()
                .relativize(Paths.get(fileName))
                .toString()
                .replace('\\', '/')
    }

    private fun adjustRootFolderIfRootIsFile() {
        if(fileList.size == 1 && fileList[0] == root){
            root = root.parentFile
        }
    }
}