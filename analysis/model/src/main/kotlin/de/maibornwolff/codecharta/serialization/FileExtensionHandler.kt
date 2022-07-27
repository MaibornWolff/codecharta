package de.maibornwolff.codecharta.serialization

object FileExtensionHandler {

    fun checkAndFixFileExtension(outputName: String): String {
        if (outputName.isEmpty()) return "output.cc.json"
        val delimiter = extractDelimiter(outputName)
        if (delimiter.isEmpty()) {
            return outputName.substringBefore(".") + ".cc.json"
                }
        return extractPath(outputName, delimiter) +
               extractFileName(outputName, delimiter).substringBefore(".") + ".cc.json"
    }

    private fun extractPath(outputName: String, delimiter: String): String {
        return outputName.split(delimiter).dropLast(1).joinToString(delimiter) + delimiter
    }

    private fun extractFileName(outputName: String, delimiter: String): String {
        return outputName.split(delimiter).reversed().get(0)
    }

    private fun extractDelimiter(outputName: String): String {
       if (outputName.contains("//")) return "//"
        if (outputName.contains("\\")) return "\\"
        return ""
    }
}
