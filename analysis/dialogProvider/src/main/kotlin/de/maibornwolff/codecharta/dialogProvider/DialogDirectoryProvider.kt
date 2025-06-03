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
    var currentDirectory: Path = Paths.get("")
    var currentDirectoryContent = listOf<Path>()
    private var possibleDirectories = listOf<Path>()
    private var possibleFiles = listOf<Path>()
    private val TARGET_LINE_LENGTH = 120

    init {
        this.prepareMatches("")
    }

    private fun updateCurrentFolder(currentInput: String) {
        if (currentInput.isEmpty()) {
            currentDirectory = Paths.get("")
            return
        }

        val unifiedInput = currentInput.replace("\\", "/").replaceAfterLast("/", "", "")
        val folder = Paths.get(unifiedInput)
        currentDirectory = if (folder.isDirectory()) folder else currentDirectory
    }

    fun prepareMatches(currentInput: String) {
        updateCurrentFolder(currentInput)
        currentDirectoryContent = currentDirectory.listDirectoryEntries()
        possibleDirectories = currentDirectoryContent.filter { it.isDirectory() }.filter { it.toString().startsWith(currentInput) }
        possibleFiles = currentDirectoryContent.filter {
            InputValidator.verifyFile(it.toFile(), fileExtensions)
        }.filter { it.toString().startsWith(currentInput) }
    }

    fun getHints(): Array<String> {
        val possibleMatches = currentDirectoryContent.filter { path ->
            (path.isDirectory() || (InputValidator.verifyFile(path.toFile(), fileExtensions)))
        }.map { if (it.isDirectory()) it.toString() + systemSeparator else it.toString() }

        return possibleMatches.toTypedArray()
    }

    fun getMatches(): String {
        val currentEntries = mutableListOf<String>()
        var minimumSize = 0

        val totalMatches = possibleDirectories.size + possibleFiles.size

        possibleDirectories.forEach {
            val dirName = it.toFile().name
            val nameLength = dirName.length + 1
            if (!checkPossibleEntry(currentEntries.size, minimumSize, nameLength, TARGET_LINE_LENGTH*2)) {
                currentEntries.add("(${currentEntries.size}/$totalMatches)")
                return finalizeOutputString(currentEntries, minimumSize )
            }
            currentEntries.add(dirName + systemSeparator)
            minimumSize = max(nameLength, minimumSize)
        }

        possibleFiles.forEach {
            val fileName = it.toFile().name
            val nameLength = fileName.length
            if (!checkPossibleEntry(currentEntries.size, minimumSize, nameLength, TARGET_LINE_LENGTH*2)) {
                currentEntries.add("(${currentEntries.size}/$totalMatches)")
                return finalizeOutputString(currentEntries, minimumSize)
            }
            currentEntries.add(fileName)
            minimumSize = max(nameLength, minimumSize)
        }

        return finalizeOutputString(currentEntries, minimumSize)
    }

    fun checkPossibleEntry(entryCount: Int, entrySize: Int, newEntrySize: Int, maxLineLength: Int): Boolean {
        return (entryCount + 1) * max(entrySize, newEntrySize) < maxLineLength
    }

    fun finalizeOutputString(folders: List<String>, minimumSize: Int): String {
        val paddedEntries = folders.map { it.padEnd(minimumSize) }
        var outputString = ""
        var secondLine = false
        paddedEntries.forEach {
            if (!secondLine && it.length + outputString.length > TARGET_LINE_LENGTH) {
                outputString += "${it.trimEnd()}\n"
                secondLine = true
            } else {
                outputString += "$it "
            }
        }
        return outputString.trimEnd()
    }
}
