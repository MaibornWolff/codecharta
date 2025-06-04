package de.maibornwolff.codecharta.dialogProvider

import de.maibornwolff.codecharta.serialization.FileExtension
import java.io.File
import java.nio.file.Path
import java.nio.file.Paths
import kotlin.io.path.isDirectory
import kotlin.io.path.listDirectoryEntries
import kotlin.math.max

class DialogDirectoryProvider(
    val inputType: InputType,
    private val fileExtensions: List<FileExtension>
) {
    private val systemSeparator = File.separatorChar
    private var filesAllowed = true
    private var currentDirectory: Path = Paths.get("")
    private var currentDirectoryContent = listOf<Path>()
    private var possibleDirectories = listOf<Path>()
    private var possibleFiles = listOf<Path>()
    private val targetLineLength = 120

    init {
        this.prepareMatches("")
        this.filesAllowed = inputType == InputType.FILE || inputType == InputType.FOLDER_AND_FILE
    }

    private fun updateCurrentFolder(currentInput: String) {
        val unifiedInput = currentInput.replace("\\", "/").replaceAfterLast("/", "", "")
        val folder = Paths.get(unifiedInput)
        currentDirectory = if (folder.isDirectory()) folder else currentDirectory
    }

    fun prepareMatches(currentInput: String) {
        updateCurrentFolder(currentInput)
        currentDirectoryContent = currentDirectory.listDirectoryEntries()
        possibleDirectories = currentDirectoryContent.filter { it.isDirectory() }.filter { it.toString().startsWith(currentInput) }
        if (filesAllowed) {
            possibleFiles = currentDirectoryContent.filter {
                InputValidator.verifyFile(it.toFile(), fileExtensions)
            }.filter { it.toString().startsWith(currentInput) }
        }
    }

    fun getHints(): Array<String> {
        val possibleMatches = currentDirectoryContent.filter { path ->
            (path.isDirectory() ||
                ( filesAllowed && InputValidator.verifyFile(path.toFile(), fileExtensions)) )
        }.map { if (it.isDirectory()) it.toString() + systemSeparator else it.toString() }

        return possibleMatches.toTypedArray()
    }

    fun getMatches(): String {
        val currentMatches = mutableListOf<String>()
        var paddedSize = 0

        val totalMatches = possibleDirectories.size + possibleFiles.size

        possibleDirectories.forEach {
            val dirName = it.toFile().name
            val nameLength = dirName.length + 1
            if (!checkPossibleEntry(currentMatches.size, paddedSize, nameLength)) {
                currentMatches.add("(${currentMatches.size}/$totalMatches)")
                return finalizeOutputString(currentMatches, paddedSize)
            }
            currentMatches.add(dirName + systemSeparator)
            paddedSize = max(nameLength, paddedSize)
        }

        possibleFiles.forEach {
            val fileName = it.toFile().name
            val nameLength = fileName.length
            if (!checkPossibleEntry(currentMatches.size, paddedSize, nameLength)) {
                currentMatches.add("(${currentMatches.size}/$totalMatches)")
                return finalizeOutputString(currentMatches, paddedSize)
            }
            currentMatches.add(fileName)
            paddedSize = max(nameLength, paddedSize)
        }

        return finalizeOutputString(currentMatches, paddedSize)
    }

    private fun checkPossibleEntry(entryCount: Int, entrySize: Int, newEntrySize: Int): Boolean {
        return (entryCount + 1) * max(entrySize, newEntrySize) < targetLineLength * 2
    }

    private fun finalizeOutputString(entries: List<String>, minimumSize: Int): String {
        val paddedEntries = entries.map { it.padEnd(minimumSize) }
        var outputString = ""
        var secondLine = false
        paddedEntries.forEach {
            if (!secondLine && it.length + outputString.length > targetLineLength) {
                outputString += "${it.trimEnd()}\n"
                secondLine = true
            } else {
                outputString += "$it "
            }
        }
        return outputString.trimEnd()
    }
}
