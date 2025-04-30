package de.maibornwolff.codecharta.dialogProvider

import de.maibornwolff.codecharta.serialization.FileExtension
import java.io.File
import java.nio.file.Path
import java.nio.file.Paths
import kotlin.io.path.isDirectory
import kotlin.io.path.listDirectoryEntries

class DialogDirectoryProvider(
    val inputType: InputType,
    private val fileExtensions: List<FileExtension>
) {
    private val systemSeparator = File.separatorChar
    private var currentDirectory: Path = Paths.get("")
    private var currentDirectoryContent = listOf<Path>()
    private var possibleDirectories = listOf<Path>()
    private var possibleFiles = listOf<Path>()

    init {
        this.prepareMatches("")
    }

    private fun updateCurrentFolder(currentInput: String) {
        if (currentInput.isEmpty()) {
            currentDirectory = Paths.get("")
            return
        }
        val unifiedInput = currentInput.replace("\\","/").replaceAfterLast("/", "", "")
        if (unifiedInput.isNotEmpty()) {
            val folder = Paths.get(currentInput)
            currentDirectory = if (folder.isDirectory()) folder else currentDirectory
            return
        }
    }

    fun prepareMatches(currentInput: String) {
        updateCurrentFolder(currentInput)
        currentDirectoryContent = currentDirectory.listDirectoryEntries()
        possibleDirectories = currentDirectoryContent.filter { it.isDirectory() }.filter { it.toString().startsWith(currentInput) }
        possibleFiles = currentDirectoryContent.filter {
            InputValidator.verifyFile(it.toFile(), fileExtensions)
        }.filter { it.toString().startsWith(currentInput) }
    }

    fun getHint(currentInput: String): String {
        val possibleMatches = currentDirectoryContent.filter { path ->
            path.toString().startsWith(currentInput) &&
                (path.isDirectory() || (InputValidator.verifyFile(path.toFile(), fileExtensions)))
        }
        return if (possibleMatches.size == 1) {
            val match = possibleMatches.first()
            if (possibleMatches.first().isDirectory()) {
                match.toString() + systemSeparator
            } else {
                match.toString()
            }
        } else {
            ""
        }
    }

    fun getMatches(): String {
        var currentCharSize = 0
        val maximumCharSize = 120
        var secondLine = false
        var outputString = ""
        val totalMatches = possibleDirectories.size + possibleFiles.size
        var addedMatches = 0
        possibleDirectories.forEach {
            val dirName = it.toFile().name
            if (secondLine && currentCharSize > maximumCharSize * 2) {
                outputString += "($addedMatches/$totalMatches)"
                return outputString
            } else if (!secondLine && currentCharSize + dirName.length > maximumCharSize) {
                secondLine = true
                outputString += "\n"
            }
            outputString = outputString + dirName + systemSeparator + "\t"
            currentCharSize += dirName.length
            addedMatches += 1
        }
        possibleFiles.forEach {
            val fileName = it.toFile().name
            if (secondLine && currentCharSize > maximumCharSize * 2) {
                outputString += "($addedMatches/$totalMatches)"
                return outputString
            } else if (!secondLine && currentCharSize + fileName.length > maximumCharSize) {
                secondLine = true
                outputString += "\n"
            }
            outputString = outputString + fileName + "\t"
            currentCharSize += fileName.length
            addedMatches += 1
        }
        return outputString
    }
}
