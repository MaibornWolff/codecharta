package de.maibornwolff.codecharta.importer.scmlogparser.parser

import com.natpryce.hamkrest.assertion.assertThat
import com.natpryce.hamkrest.equalTo
import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import org.hamcrest.CoreMatchers.*
import org.junit.Test
import java.time.OffsetDateTime
import java.util.stream.Stream
import org.junit.Assert.*

class CommitCollectorTest {

    private val metricsFactory = MetricsFactory()

    private fun modificationsByFilename(vararg filenames: String): List<Modification> {
        return filenames.map { Modification(it, 0, 0, Modification.Type.ADD) }
    }

    private fun load_case_add_delete_modify_mutated(testFileName: String): Array<Commit> {
        val addModification = Modification(testFileName, Modification.Type.ADD)
        val deleteModification = Modification(testFileName, Modification.Type.DELETE)
        val modifyModification = Modification(testFileName, Modification.Type.MODIFY)

        val addCommit = Commit("Add $testFileName", listOf(addModification), OffsetDateTime.now())
        val deleteCommit = Commit("Delete $testFileName", listOf(deleteModification), OffsetDateTime.now())
        val modifyCommit = Commit("Modify $testFileName", listOf(modifyModification), OffsetDateTime.now())

        return arrayOf(addCommit, deleteCommit, modifyCommit)
    }

    private fun load_case_add_delete_rename_mutated(testFileName: String, newFileName: String): Array<Commit> {
        val addModification = Modification(testFileName, Modification.Type.ADD)
        val deleteModification = Modification(testFileName, Modification.Type.DELETE)
        val renameModification = Modification(newFileName, testFileName, Modification.Type.RENAME)

        val addCommit = Commit("Add $testFileName", listOf(addModification), OffsetDateTime.now())
        val deleteCommit = Commit("Delete $testFileName", listOf(deleteModification), OffsetDateTime.now())
        val renameCommit = Commit("Modify $testFileName", listOf(renameModification), OffsetDateTime.now())

        return arrayOf(addCommit, deleteCommit, renameCommit)
    }

    private fun load_case_add_add_mutated(testFileName: String): Array<Commit> {
        val addModification1 = Modification(testFileName, Modification.Type.ADD)

        // Optional modifications between the two adds
        val modifyModification = Modification(testFileName, Modification.Type.MODIFY)
        val addModification2 = Modification(testFileName, Modification.Type.ADD)

        val addCommit1 = Commit("Add $testFileName", listOf(addModification1), OffsetDateTime.now())
        val modifyCommit = Commit("Modify $testFileName", listOf(modifyModification), OffsetDateTime.now())
        val addCommit2 = Commit("Add again $testFileName", listOf(addModification2), OffsetDateTime.now())

        return arrayOf(addCommit1, modifyCommit, addCommit2)
    }

    @Test
    fun test_given_delete_modification_then_flag_file_as_deleted() {
        val testFileName = "src/Main.java";

        val addModification = Modification(testFileName, Modification.Type.ADD)
        val deleteModification = Modification(testFileName, Modification.Type.DELETE)

        val addCommit = Commit("Add $testFileName", listOf(addModification), OffsetDateTime.now())
        val deleteCommit = Commit("Delete $testFileName", listOf(deleteModification), OffsetDateTime.now())

        val versionControlledFilesList =
                Stream.of(addCommit, deleteCommit).collect(CommitCollector.create(metricsFactory))

        assertTrue(versionControlledFilesList.get(testFileName)!!.isDeleted())
    }

    @Test
    fun test_given_deleted_file_when_modified_then_flag_as_mutated() {
        val testFileName = "src/Main.java";

        val commits = load_case_add_delete_modify_mutated(testFileName)
        val versionControlledFilesList =
                Stream.of(*commits).collect(CommitCollector.create(metricsFactory))

        assertThat(versionControlledFilesList.get(testFileName)!!.isDeleted(), equalTo(true))
        assertThat(versionControlledFilesList.get(testFileName)!!.isMutated(), equalTo(true))
    }

    @Test
    fun test_given_deleted_file_when_renamed_then_flag_as_mutated() {
        val testFileName = "src/RenameMe.java";
        val newFileName = "src/RenamedNewFileName.java"

        val commits = load_case_add_delete_rename_mutated(testFileName, newFileName)
        val versionControlledFilesList =
                Stream.of(*commits).collect(CommitCollector.create(metricsFactory))

        assertThat(versionControlledFilesList.get(testFileName)!!.isDeleted(), equalTo(true))
        assertThat(versionControlledFilesList.get(testFileName)!!.isMutated(), equalTo(true))
    }

    @Test
    fun test_given_added_file_when_add_again_then_flag_as_mutated() {
        val testFileName = "src/Add.java";

        val commits = load_case_add_add_mutated(testFileName)
        val versionControlledFilesList =
                Stream.of(*commits).collect(CommitCollector.create(metricsFactory))

        assertThat(versionControlledFilesList.get(testFileName)!!.isDeleted(), equalTo(false))
        assertThat(versionControlledFilesList.get(testFileName)!!.isMutated(), equalTo(true))
    }

    @Test
    fun test_given_added_mutated_file_when_merge_commit_then_modify_and_resolve_mutated_file() {
        val testFileName = "src/AddCase.java";

        val commits = load_case_add_add_mutated(testFileName)
        val versionControlledFilesList =
                Stream.of(*commits).collect(CommitCollector.create(metricsFactory))

        assertThat(versionControlledFilesList.get(testFileName)!!.isDeleted(), equalTo(false))
        assertThat(versionControlledFilesList.get(testFileName)!!.isMutated(), equalTo(true))

        val modifyModification = Modification(testFileName, Modification.Type.MODIFY)
        val mergeCommitModify =
                Commit("Modify by Merge $testFileName", listOf(modifyModification), OffsetDateTime.now(), true)

        val arrayOfCommits = commits + arrayOf(mergeCommitModify)
        val versionControlledFilesList2 =
                Stream.of(*arrayOfCommits).collect(CommitCollector.create(metricsFactory))

        assertThat(versionControlledFilesList2.get(testFileName)!!.isDeleted(), equalTo(false))
        assertThat(versionControlledFilesList2.get(testFileName)!!.isMutated(), equalTo(false))
    }

    @Test
    fun test_given_deleted_mutated_file_when_merge_commit_then_add_and_resolve_mutated_file() {
        val testFileName = "src/Main.java";

        val commits = load_case_add_delete_modify_mutated(testFileName)
        val versionControlledFilesList =
                Stream.of(*commits).collect(CommitCollector.create(metricsFactory))

        assertThat(versionControlledFilesList.get(testFileName)!!.isDeleted(), equalTo(true))
        assertThat(versionControlledFilesList.get(testFileName)!!.isMutated(), equalTo(true))

        val addModification = Modification(testFileName, Modification.Type.ADD)
        val mergeCommitAdd = Commit("Add by Merge $testFileName", listOf(addModification), OffsetDateTime.now(), true)

        val arrayOfCommits = commits + arrayOf(mergeCommitAdd)
        val versionControlledFilesList2 =
                Stream.of(*arrayOfCommits).collect(CommitCollector.create(metricsFactory))

        assertThat(versionControlledFilesList2.get(testFileName)!!.isDeleted(), equalTo(false))
        assertThat(versionControlledFilesList2.get(testFileName)!!.isMutated(), equalTo(false))
    }

    @Test
    fun test_given_deleted_mutated_file_when_merge_commit_then_delete_and_resolve_mutated_file() {
        val testFileName = "src/DeleteMeAtTheEnd.java";

        val commits = load_case_add_delete_modify_mutated(testFileName)

        val deleteModification = Modification(testFileName, Modification.Type.DELETE)
        val mergeCommitDelete =
                Commit("Delete by Merge $testFileName", listOf(deleteModification), OffsetDateTime.now(), true)

        val arrayOfCommits = commits + arrayOf(mergeCommitDelete)
        val versionControlledFilesList =
                Stream.of(*arrayOfCommits).collect(CommitCollector.create(metricsFactory))

        assertThat(versionControlledFilesList.get(testFileName)!!.isDeleted(), equalTo(true))
        assertThat(versionControlledFilesList.get(testFileName)!!.isMutated(), equalTo(false))
    }

    @Test
    fun test_given_not_already_added_file_when_modify_then_add_file_first_and_do_not_crash() {
        val testFileName = "src/NonExistingFileYet.java";

        val modifyModification = Modification(testFileName, Modification.Type.MODIFY)
        val modifyCommit =
                Commit("Modify $testFileName", listOf(modifyModification), OffsetDateTime.now(), false)

        val arrayOfCommits = arrayOf(modifyCommit)
        val versionControlledFilesList =
                Stream.of(*arrayOfCommits).collect(CommitCollector.create(metricsFactory))

        assertThat(versionControlledFilesList.get(testFileName), `is`(instanceOf(VersionControlledFile::class.java)))
        assertThat(versionControlledFilesList.get(testFileName)!!.isDeleted(), equalTo(false))
    }

    @Test
    fun test_given_empty_vcf_list_when_multiple_commits_then_collect_them() {
        val firstModifications = listOf(
                Modification("File1.kt", Modification.Type.ADD),
                Modification("File2.kt", Modification.Type.ADD),
                Modification("File3.kt", Modification.Type.ADD),
                Modification("File4.kt", Modification.Type.ADD)
                                       )
        val nextModifications = listOf(
                Modification("File3.kt", Modification.Type.MODIFY),
                Modification("File4.kt", Modification.Type.MODIFY),
                Modification("File5.kt", Modification.Type.ADD)
                                      )
        val lastModifications = listOf(
                Modification("File3.kt", Modification.Type.DELETE),
                Modification("File5_newName.kt", "File5.kt", Modification.Type.RENAME)
                                      )

        val firstCommit = Commit("First Commit", firstModifications, OffsetDateTime.now())
        val secondCommit = Commit("Next Commit", nextModifications, OffsetDateTime.now())
        val lastCommit = Commit("Last Commit", lastModifications, OffsetDateTime.now())

        val versionControlledFilesList =
                Stream.of(*arrayOf(firstCommit, secondCommit, lastCommit))
                        .collect(CommitCollector.create(metricsFactory))

        assertThat(versionControlledFilesList.get("File1.kt"), `is`(instanceOf(VersionControlledFile::class.java)))
        assertThat(versionControlledFilesList.get("File1.kt")!!.isDeleted(), equalTo(false))
        assertThat(versionControlledFilesList.get("File1.kt")!!.isMutated(), equalTo(false))

        assertThat(versionControlledFilesList.get("File2.kt"), `is`(instanceOf(VersionControlledFile::class.java)))
        assertThat(versionControlledFilesList.get("File2.kt")!!.isDeleted(), equalTo(false))
        assertThat(versionControlledFilesList.get("File2.kt")!!.isMutated(), equalTo(false))

        assertThat(versionControlledFilesList.get("File3.kt"), `is`(instanceOf(VersionControlledFile::class.java)))
        assertThat(versionControlledFilesList.get("File3.kt")!!.isDeleted(), equalTo(true))
        assertThat(versionControlledFilesList.get("File3.kt")!!.isMutated(), equalTo(false))

        assertThat(versionControlledFilesList.get("File4.kt"), `is`(instanceOf(VersionControlledFile::class.java)))
        assertThat(versionControlledFilesList.get("File4.kt")!!.isDeleted(), equalTo(false))
        assertThat(versionControlledFilesList.get("File4.kt")!!.isMutated(), equalTo(false))

        assertThat(versionControlledFilesList.get("File5_newName.kt"),
                `is`(instanceOf(VersionControlledFile::class.java)))
        assertThat(versionControlledFilesList.get("File5_newName.kt")!!.containsRename("File5.kt"), equalTo(true))
    }

    @Test
    fun test_given_modifications_when_empty_file_name_then_skip_modification() {
        val commit = Commit("TheAuthor", modificationsByFilename("", "src/Main.java"), OffsetDateTime.now())
        val vcfList = Stream.of(commit).collect(CommitCollector.create(metricsFactory))

        assertThat(vcfList.getList().containsKey(""), equalTo(false))
        assertThat(vcfList.getList().containsKey("src/Main.java"), equalTo(true))
    }

    @Test(expected = UnsupportedOperationException::class)
    fun test_given_parallel_commit_stream_when_should_be_parsed_then_break_with_exception() {
        val commit =
                Commit("TheAuthor", modificationsByFilename("src/Main.java", "src/Util.java"), OffsetDateTime.now())

        val parallelCommitStream = Stream.of(commit, commit).parallel()
        parallelCommitStream.collect(CommitCollector.create(metricsFactory))
    }
}
