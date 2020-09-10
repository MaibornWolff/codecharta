package de.maibornwolff.codecharta.importer.scmlogparser

import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import java.io.File
import java.io.IOException
import java.util.concurrent.TimeUnit

class IntegrationTest {
    private var filenamesInGitRepo = mutableListOf<String>()

    // TODO get directory of the project, right now workingDir is one step to deep, stepping up will make it CC specific
    // TODO right now I left it as CC specific, look into Gradle Project configuration to get main Project Path

    @BeforeAll
    fun setup(){

        val path = convertPathCodeCharta()
        buildFileTree("git ls-files ",File(path))

    }

    fun convertPathCodeCharta():String {
        val path = System.getProperty("user.dir")
        val separator = System.getProperty("file.separator")

       return path.substringBefore("$separator analysis")
    }

    fun buildFileTree(gitCommand: String, workingDir: File) {
        try {
            val commands = gitCommand.split("\\s".toRegex())
            val proc = ProcessBuilder(*commands.toTypedArray())
                .directory(workingDir)
                .redirectOutput(ProcessBuilder.Redirect.PIPE)
                .redirectError(ProcessBuilder.Redirect.PIPE)
                .start()

            proc.waitFor(60, TimeUnit.SECONDS)
            return proc.inputStream.bufferedReader().useLines { lines ->
                lines.forEach {
                    filenamesInGitRepo.add(it)
                }
            }
        } catch (e: IOException) {
            error("Invalid git command.")
        }
    }

    @Test
    fun test_given_list_of_all_files_in_project_when_parsing_corresponding_git_log_then_both_list_contents_are_equal(){
        //TODO call parser with log, need to generate log, maybe in place using gitCommand or directly via posix if we write to file
        //Runtime.getRuntime().exec("git log -m --topo-order --raw --reverse > git.log")
        //TODO remove unnecessary files that are not part of the project according to our logic
        //versionControlledFiles.filter{!isMutated() && !isDeleted()}
        //TODO map files to current names, resulting in a list of strings
        //val versionControlledFileNames= versionControlledFiles.values.map{file -> file.filename}
        //TODO compare the two lists, should be equal
        //assertThat("both lists contain the same filenames", filenamesInGitRepo, containsInAnyOrder(versionControlledFileNames))
    }
}