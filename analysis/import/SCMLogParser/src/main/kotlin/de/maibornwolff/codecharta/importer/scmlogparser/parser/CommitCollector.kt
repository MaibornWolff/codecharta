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

    private var renamesMap: MutableMap<String, String> = mutableMapOf() // Map<CurrentName, OldestName>
    private var nameConflictsMap: MutableMap<String, Int> = mutableMapOf() //Map <CurrentName, NumberOfConflicts>

    // Map<String, VersionControlledFile> = [filename, versionControlledFiles.get(filename)]

    private fun collectCommit(versionControlledFiles: MutableMap<String, VersionControlledFile>, commit: Commit) {
        if (commit.isEmpty) {
            return
        }

        val renamedFilenames = commit.modifications.map {
            var possibleConflictName: String = if (nameConflictsMap.containsKey(it.currentFilename)) {
                it.currentFilename + "_\\0_" + nameConflictsMap[it.currentFilename] //if conflict[it.currentFilename] ==> tmp = conflict.key_\0_conflict.value
            } else {
                it.currentFilename //else tmp = it.currentFilename
            }
            when (it.type) {
                Modification.Type.ADD -> {
                    val file: VersionControlledFile? =
                        versionControlledFiles[possibleConflictName] //does the file exist?
                    if (file == null) {
                        val missingVersionControlledFile =
                            VersionControlledFile(possibleConflictName, metricsFactory) // if not create a file
                        versionControlledFiles[possibleConflictName] =
                            missingVersionControlledFile // and add it to the list
                    }
                    possibleConflictName
                }
                Modification.Type.DELETE -> {
                    val filename = renamesMap[possibleConflictName]
                    versionControlledFiles.remove(if (filename == null) possibleConflictName else filename) //remove a deleted file from list
                    renamesMap.remove(possibleConflictName) // and remove its references in renames
                    null // we have no corresponding element, as it has been removed
                }
                Modification.Type.RENAME -> {
                    // RENAME, oldFilename, currentFilename
                    // renames: key(current), value(oldest)
                    // remember the oldest name to hang commits onto it, key for a version controlled files
                    val tmp: String? = renamesMap[it.oldFilename] //do we have an entry?

                    //*1 RENAME recognizes key is already in vCF
                    //create map: conflicting key, Integer Conflict<String, Int>
                    //file is in vCF -> conflict<file.currentName, marker>
                    //conflict<file.currentName, marker> taken => conflict<file.currentName, marker+1>
                    //vcF <conflict.key_conflict.value, newFile>

                    if (versionControlledFiles.containsKey(possibleConflictName)) {//is the filename contained in vCF
                        val marker: Int? =
                            nameConflictsMap[possibleConflictName] //check if the file is already contained with a marker
                        val newMarker: Int =
                            if (marker != null) marker + 1 else 0 //increment the marker for additional tracking

                        val newVCFFileName =
                            it.currentFilename + "_\\0_" + newMarker // generate new vCF entry we work with it.currentFilename to preserve the string structure
                        val newFile = VersionControlledFile(newVCFFileName, metricsFactory)
                        versionControlledFiles[newVCFFileName] = newFile
                    }

                    if (tmp != null) {
                        //*1 used to be here, but I think we need to account for it in both cases
                        preserveOrder(tmp, versionControlledFiles, true) //preserve order of versionControlledFiles
                        renamesMap.remove(it.oldFilename) //remove old entry
                        renamesMap[possibleConflictName] = tmp // insert new entry, tracking the current name
                        tmp
                    } else {
                        preserveOrder(it.oldFilename, versionControlledFiles, true) //preserve order of versionControlledFiles
                        renamesMap[possibleConflictName] = it.oldFilename //add new entry
                        it.oldFilename
                    }
                }

                else -> possibleConflictName
            }

        }
        renamedFilenames
            .forEach {
                try {
                    versionControlledFiles[it]?.registerCommit(commit) // try registering commit
                } catch (e: IllegalStateException) {
                    println("File$it") // we catch exception, in case a sanity check fails
                }
            }
    }

    private fun preserveOrder(
        filename: String,
        versionControlledFiles: MutableMap<String, VersionControlledFile>,
        rename: Boolean
    ) {
        var removeIDList = mutableListOf<String>() //tracks removes
        if (versionControlledFiles.containsKey(filename)) {
            var startRemoving: Boolean = false
            for (key in versionControlledFiles.keys) { //iterate file list
                if (startRemoving) {
                    val tmp = versionControlledFiles[key]

                    if (tmp != null) {
                        versionControlledFiles[key] = tmp
                        removeIDList.add(key)
                    }


                    if (tmp == null) { //tmp !=null
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
                renamesMap.remove(filename)
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
