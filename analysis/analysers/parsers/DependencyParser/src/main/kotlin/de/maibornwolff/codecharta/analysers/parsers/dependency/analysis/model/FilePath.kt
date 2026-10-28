package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.splitNameToParts

/**
 * A source file, in both the form the graph addresses it by ([escapedPath], whose segments have their
 * dots escaped so a graph id splits cleanly) and the form the file tree uses ([segments]).
 */
data class FilePath(val segments: List<String>) {
    val escapedPath: Path = Path(segments)
    val graphId: String = escapedPath.withDots()

    companion object {
        private const val CURRENT_DIRECTORY = "."

        fun of(node: Node): FilePath = FilePath(splitNameToParts(node.physicalPath).filter { it != CURRENT_DIRECTORY })
    }
}
