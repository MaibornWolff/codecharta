package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common

import java.io.File
import java.util.concurrent.ConcurrentHashMap

/**
 * The files and folders below an analysis root that name resolution looks at, each as its path below the root in
 * segments and in path order; the root itself is the folder of no segments. A run registers what its scan let through,
 * so every lookup sees what `.gitignore` and the exclude patterns leave; a root nothing registered is walked instead.
 */
internal class ProjectListing private constructor(
    private val analysisRoot: File,
    private val files: List<List<String>>,
    private val folders: List<List<String>>
) {
    /** The files below no folder [isSkippedFolder] names. */
    fun filesOutside(isSkippedFolder: (String) -> Boolean): List<List<String>> =
        files.filter { file -> file.dropLast(1).none(isSkippedFolder) }

    /** The folders, the root among them, that are no folder [isSkippedFolder] names nor below one. */
    fun foldersOutside(isSkippedFolder: (String) -> Boolean): List<List<String>> = folders.filter { folder -> folder.none(isSkippedFolder) }

    /** The paths below the root, in the platform's separators, of the files below no folder [isSkippedFolder] names. */
    fun filePathsOutside(isSkippedFolder: (String) -> Boolean): Set<String> =
        filesOutside(isSkippedFolder).mapTo(HashSet()) { it.joinToString(File.separator) }

    fun fileAt(path: List<String>): File = analysisRoot.resolve(path.joinToString(File.separator))

    companion object {
        private const val SEPARATOR = "/"
        private const val HIDDEN_PREFIX = "."
        private val listingsByRoot = ConcurrentHashMap<String, ProjectListing>()

        /** Makes [entries], the files and folders a scan of [analysisRoot] let through, what lookups below it see. */
        fun register(analysisRoot: File, entries: List<File>) {
            listingsByRoot[analysisRoot.absolutePath] = from(analysisRoot, entries)
        }

        fun of(analysisRoot: File): ProjectListing = listingsByRoot.computeIfAbsent(analysisRoot.absolutePath) {
            from(analysisRoot, walk(analysisRoot))
        }

        // Every lookup skips hidden folders, so a walk need not enter them, the .git folder among them
        private fun walk(analysisRoot: File): List<File> = analysisRoot
            .walkTopDown()
            .onEnter { folder -> folder == analysisRoot || !folder.name.startsWith(HIDDEN_PREFIX) }
            .drop(1)
            .toList()

        private fun from(analysisRoot: File, entries: List<File>): ProjectListing {
            val (folders, files) = entries.partition { it.isDirectory }
            return ProjectListing(
                analysisRoot,
                pathsInOrder(analysisRoot, files),
                listOf(emptyList<String>()) + pathsInOrder(analysisRoot, folders)
            )
        }

        private fun pathsInOrder(analysisRoot: File, entries: List<File>): List<List<String>> = entries
            .map { entry -> entry.relativeTo(analysisRoot).invariantSeparatorsPath.split(SEPARATOR).filter { it.isNotEmpty() } }
            .sortedBy { it.joinToString(SEPARATOR) }
    }
}
