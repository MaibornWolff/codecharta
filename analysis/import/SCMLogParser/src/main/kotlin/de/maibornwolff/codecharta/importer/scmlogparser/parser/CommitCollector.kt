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


    private var renames : MutableMap<String, String> = mutableMapOf() // Map<CurrentName, OldestName>

    // Map<String, VersionControlledFile> = [filename, versionControlledFiles.get(filename)]



    private fun collectCommit(versionControlledFiles: MutableMap<String, VersionControlledFile>, commit: Commit) {
        if (commit.isEmpty) {
            return
        }

        val renamedFilenames =  commit.modifications.map {
            if(it.type == Modification.Type.ADD){
                val file: VersionControlledFile? = versionControlledFiles[it.currentFilename]
                if(file == null || file.markedDeleted()) {
                    val missingVersionControlledFile = VersionControlledFile(it.currentFilename, metricsFactory)
                    versionControlledFiles[it.currentFilename] = missingVersionControlledFile
                }
                it.currentFilename
            }
            // Modification.Type.DELETE delete a file from map, saves logic
            else if (it.type == Modification.Type.RENAME) {
                println(it)
                val tmp: String? = renames[it.oldFilename]
                if (tmp != null) {
                    removeLogic(tmp, versionControlledFiles, true)
                    renames.remove(it.oldFilename)
                    renames[it.currentFilename] = tmp
                tmp
                } else {
                    removeLogic(it.oldFilename, versionControlledFiles, true)
                    renames[it.currentFilename] = it.oldFilename
                    it.oldFilename
                }
            }
            else{
                it.currentFilename
            }
        }

        renamedFilenames
            .forEach {
                try {
                    versionControlledFiles[it]?.registerCommit(commit)
                }
                catch (e: IllegalStateException){
                    println("File$it")
                }
            }
    }

    private fun removeLogic(filename: String, versionControlledFiles: MutableMap<String, VersionControlledFile>, rename: Boolean){
        var removeIDList = mutableListOf<String>()
        if(versionControlledFiles.containsKey(filename)){
            var startRemoving: Boolean = false
            for (key in versionControlledFiles.keys) {
                if(startRemoving){
                    val tmp = versionControlledFiles[key]
                    //versionControlledFiles.remove(key) //can't remove during iteration, write access is blocked
                    if (tmp == null) { //tmp !=null
                        removeIDList.add(key)
                        //versionControlledFiles[key] = tmp
                    }
                }
                else if (key == filename){
                    startRemoving = true
                    val tmp = versionControlledFiles[key]
                    removeIDList.add(key)
                    // versionControlledFiles.remove(key)
                    if (tmp != null) {
                        versionControlledFiles[tmp.filename] = tmp
                    }
                }
            }

            for(id in removeIDList){
                versionControlledFiles.remove(id)
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
