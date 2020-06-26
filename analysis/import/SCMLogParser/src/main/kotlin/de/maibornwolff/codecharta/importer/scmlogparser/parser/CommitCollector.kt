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

    private var renames : MutableMap<String, String> = mutableMapOf() // Map<CurrentName, OldestName>

    // Map<String, VersionControlledFile> = [filename, versionControlledFiles.get(filename)]

    private fun collectCommit(versionControlledFiles: MutableMap<String, VersionControlledFile>, commit: Commit) {
        if (commit.isEmpty) {
            return
        }

        val renamedFilenames =  commit.modifications.map {
            if(it.type == Modification.Type.ADD){
                val file: VersionControlledFile? = versionControlledFiles[it.filename]
                if(file == null || file.markedDeleted()) {
                    val missingVersionControlledFile = VersionControlledFile(it.filename, metricsFactory)
                    versionControlledFiles[it.filename] = missingVersionControlledFile
                }
                it.filename
            }
            else if (it.type == Modification.Type.RENAME) {
                val tmp: String? = renames[it.oldFilename]
                if (tmp != null) {
                    removeLogic(tmp, versionControlledFiles, true)
                    renames.remove(it.oldFilename)
                    renames[it.filename] = tmp
                tmp
                } else {
                    removeLogic(it.oldFilename, versionControlledFiles, true)
                    renames[it.filename] = it.oldFilename
                    it.oldFilename
                }
            }
            else{
                it.filename
            }
        }

        renamedFilenames
            .forEach {
                versionControlledFiles[it]?.registerCommit(commit)
            }
    }

    private fun removeLogic(filename: String, versionControlledFiles: MutableMap<String, VersionControlledFile>, rename: Boolean){
        if(versionControlledFiles.containsKey(filename)){
            var startRemoving: Boolean = false
            for (key in versionControlledFiles.keys) {
                if(startRemoving){
                    val tmp = versionControlledFiles[key]
                    versionControlledFiles.remove(key)
                    if (tmp != null) {
                        versionControlledFiles[key] = tmp
                    }
                }
                else if (key == filename){
                    startRemoving = true
                    val tmp = versionControlledFiles[key]
                    versionControlledFiles.remove(key)
                    if (tmp != null) {
                        versionControlledFiles[tmp.filename] = tmp
                    }
                }
            }
            if(rename){
                renames.remove(filename)
                //renames[]
            }
        }
    }

    private fun combineForParallelExecution(firstCommits: MutableMap<String, VersionControlledFile>,
                                            secondCommits: MutableMap<String, VersionControlledFile>): MutableMap<String, VersionControlledFile> {
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
