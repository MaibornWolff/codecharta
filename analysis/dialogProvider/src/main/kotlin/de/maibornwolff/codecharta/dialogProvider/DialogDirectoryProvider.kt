package de.maibornwolff.codecharta.dialogProvider

import de.maibornwolff.codecharta.serialization.FileExtension
import java.io.File
import java.nio.file.Path
import java.nio.file.Paths

class DialogDirectoryProvider(
    val inputType: InputType,
    val fileExtensions: List<FileExtension>
    ) {

    val systemSeparator = File.separatorChar
    var currentFolder = Paths.get("")



    fun updateMatches(): List<Path> {


    // return list of possible matches, specifically folders and files with fitting extension
    }

    fun formatMatches(validMatches: List<Path>): String {
        // return up to two lines of results, with (x more) at the end. To be displayed below the input
    }

}
