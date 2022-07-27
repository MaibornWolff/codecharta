package de.maibornwolff.codecharta.serialization

object FileExtensionHandler {

    fun checkAndFixFileExtension(outputName: String): String {
        if (outputName.isEmpty()) return "default.cc.json"
        val delimiter = extractDelimiter(outputName)
        if (delimiter.isEmpty()) {
            return outputName.substringBefore(".") + ".cc.json"
                }
        return extractPath(outputName, delimiter) +
               extractFileName(outputName, delimiter)
    }

    private fun extractPath(outputName: String, delimiter: String): String {
        return outputName.split(delimiter).dropLast(1).joinToString(delimiter) + delimiter
    }

    private fun extractFileName(outputName: String, delimiter: String): String {
        val fileName = outputName.split(delimiter).reversed().get(0)
        if (fileName.isEmpty()) {
            return "default.cc.json"
        }
        return fileName.substringBefore(".") + ".cc.json"
    }

    private fun extractDelimiter(outputName: String): String {
       if (outputName.contains("//")) return "//"
        if (outputName.contains("\\")) return "\\"
        return ""
    }
}
