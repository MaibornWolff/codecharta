package de.maibornwolff.codecharta.serialization

object FileExtensionHandler {

    fun checkAndFixFileExtension(outputFilenameWithoutPath: String): String {
        var fileNameWithCorrectExtension :String
        if (outputFilenameWithoutPath.isEmpty()) {
            fileNameWithCorrectExtension = "output"
        } else {
            fileNameWithCorrectExtension = outputFilenameWithoutPath.substringBefore(".")
        }
        return fileNameWithCorrectExtension + ".cc.json"
    }
}
