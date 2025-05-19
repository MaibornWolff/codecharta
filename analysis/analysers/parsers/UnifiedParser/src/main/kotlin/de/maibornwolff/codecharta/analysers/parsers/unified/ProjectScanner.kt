package de.maibornwolff.codecharta.analysers.parsers.unified

import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.TypescriptCollector
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.util.Logger
import java.io.File
import java.nio.file.Paths

class ProjectScanner(
    val root: File,
    val projectBuilder: ProjectBuilder,
    val exclude: List<String> = listOf()
) {

    fun traverseInputProject() {
        val files = root.walk().filter { it.isFile }.toList()

        val excludePatterns = exclude.joinToString(separator = "|", prefix = "(", postfix = ")").toRegex()

        //TODO: sollten wir das launch einbauen wie beim rawTextParser? -> großes projekt testen und laufzeit vergleichen
        files.forEach { file ->
            val relativeFilePath = getRelativeFileName(file.name)
            if (file.isFile && !(exclude.isNotEmpty() && excludePatterns.containsMatchIn(relativeFilePath))) {
                applyCorrectCollector(file, projectBuilder)
            }
        }
    }

    private fun getRelativeFileName(fileName: String): String {
        return root.toPath().toAbsolutePath()
            .relativize(Paths.get(fileName).toAbsolutePath())
            .toString()
            .replace('\\', '/')
    }

    private fun applyCorrectCollector(file: File, projectBuilder: ProjectBuilder) {
        val tsCollector = TypescriptCollector()

        when (file.extension) {
            "ts" -> tsCollector.collectMetricsForFile(file, projectBuilder)
            //TODO: maybe add something which file types were skipped
        }
    }
}
