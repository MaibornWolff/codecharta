package de.maibornwolff.codecharta.importer.scmlogparser.parser

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import java.util.function.BiConsumer
import java.util.function.BinaryOperator
import java.util.function.Supplier
import java.util.stream.Collector

internal class CommitCollector private constructor(private val metricsFactory: MetricsFactory) {

    //remember concrete history
    // is a file always added before it is modified? Modification.Type.ADD

    private var renames: MutableMap<String, String> = mutableMapOf() // Map<CurrentName, OldestName>

    // Map<String, VersionControlledFile> = [filename, versionControlledFiles.get(filename)]

    private fun collectCommit(versionControlledFiles: MutableMap<String, VersionControlledFile>, commit: Commit) {
        if (commit.isEmpty) {
            return
        }

        val renamedFilenames = commit.modifications.map {
            when (it.type) {
                Modification.Type.ADD -> {
                    val file: VersionControlledFile? = versionControlledFiles[it.currentFilename] //does the file exist?
                    if (file == null) {
                        val missingVersionControlledFile = VersionControlledFile(it.currentFilename, metricsFactory) // if not create a file
                        versionControlledFiles[it.currentFilename] = missingVersionControlledFile // and add it to the list
                    }
                    it.currentFilename
                }
                Modification.Type.DELETE -> {
                    versionControlledFiles.remove(it.currentFilename) //remove a deleted file from list
                    renames.remove(it.currentFilename) // and remove its references in renames
                    null // we have no corresponding element, as it has been removed
                }
                Modification.Type.RENAME -> {
                    val tmp: String? = renames[it.oldFilename] //do we have an entry?
                    if (tmp != null) {
                        preserveOrder(tmp, versionControlledFiles, true) //preserve order of versionControlledFiles
                        renames.remove(it.oldFilename) //remove old entry
                        renames[it.currentFilename] = tmp // insert new entry, tracking the current name
                        tmp
                    } else {
                        preserveOrder(it.oldFilename, versionControlledFiles, true) //preserve order of versionControlledFiles
                        renames[it.currentFilename] = it.oldFilename //add new entry
                        it.oldFilename
                    }
                }

                else -> it.currentFilename
            }

        }
        renamedFilenames
            .forEach {
                try {
                    versionControlledFiles[it]?.registerCommit(commit) // try registering commit
                }
                catch (e: IllegalStateException){
                    println("File$it") // we catch exception, in case a sanity check fails
                }
            }
    }

    private fun preserveOrder(
        filename: String,
        versionControlledFiles: MutableMap<String, VersionControlledFile>,
        rename: Boolean
    ) {
        var removeIDList = mutableListOf<String>()
        if (versionControlledFiles.containsKey(filename)) {
            var startRemoving: Boolean = false
            for (key in versionControlledFiles.keys) { //iterate file list
                if (startRemoving) {
                    val tmp = versionControlledFiles[key]
                    if (tmp == null) { //tmp !=null
                        removeIDList.add(key)
                        //versionControlledFiles[key] = tmp
                    }
                } else if (key == filename) {
                    startRemoving = true
                    val tmp = versionControlledFiles[key]
                    removeIDList.add(key)
                    if (tmp != null) {
                        versionControlledFiles[tmp.filename] = tmp
                    }
                }
            }

            for (id in removeIDList) {
                versionControlledFiles.remove(id)
            }

            if (rename) {
                renames.remove(filename)
                //renames[]
            }
        }
    }

    private fun combineForParallelExecution(
        firstCommits: MutableMap<String, VersionControlledFile>,
        secondCommits: MutableMap<String, VersionControlledFile>
    ): MutableMap<String, VersionControlledFile> {
        throw UnsupportedOperationException("parallel collection of commits not supported")
    }

    companion object {

        fun create(metricsFactory: MetricsFactory): Collector<Commit, *, MutableMap<String, VersionControlledFile>> {
            val collector = CommitCollector(metricsFactory)
            return Collector.of(Supplier<MutableMap<String, VersionControlledFile>> { mutableMapOf() },
                BiConsumer<MutableMap<String, VersionControlledFile>, Commit> { versionControlledFiles, commit ->
                    collector.collectCommit(versionControlledFiles, commit)
                }, BinaryOperator<MutableMap<String, VersionControlledFile>> { firstCommits, secondCommits ->
                    collector.combineForParallelExecution(firstCommits, secondCommits)
                })
        }
    }
}
