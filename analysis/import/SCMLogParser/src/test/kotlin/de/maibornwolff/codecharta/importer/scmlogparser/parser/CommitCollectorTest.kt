package de.maibornwolff.codecharta.importer.scmlogparser.parser

import com.natpryce.hamkrest.assertion.assertThat
import com.natpryce.hamkrest.equalTo
import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import org.junit.Test
import java.time.OffsetDateTime
import java.util.stream.Stream
import org.junit.Assert.*

class CommitCollectorTest {

    private val metricsFactory = MetricsFactory()

    //@TODO to be removed (maybe)
    private fun modificationsByFilename(vararg filenames: String): List<Modification> {
        return filenames.map { Modification(it) }
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

    //    @Test
    //    @Suppress
    //    fun collectsCommits() {
    //        val commitDate = OffsetDateTime.now()
    //        val firstCommit = Commit("TheAuthor", modificationsByFilename("src/Main.java", "src/Util.java"), commitDate)
    //        val secondCommit = Commit("AnotherAuthor", modificationsByFilename("src/Util.java"), commitDate)
    //        val commits = Stream.of(firstCommit, secondCommit).collect(CommitCollector.create(metricsFactory))
    //        assertThat(commits)
    //                .extracting(Function<VersionControlledFile, Any> { it.filename },
    //                        Function<VersionControlledFile, Any> { f -> f.getMetricValue("number_of_commits") },
    //                        Function<VersionControlledFile, Any> { it.authors })
    //                .containsExactly(
    //                        tuple("src/Main.java", 1L, setOf("TheAuthor")),
    //                        tuple("src/Util.java", 2L, HashSet(asList("TheAuthor", "AnotherAuthor"))))
    //    }

    //    @Test
    //    @Suppress
    //    fun doesNotCollectEmptyFilenames() {
    //        val commit = Commit("TheAuthor", modificationsByFilename(""), OffsetDateTime.now())
    //        val commits = Stream.of(commit).collect(CommitCollector.create(metricsFactory))
    //        assertThat(commits).isEmpty()
    //    }

    //    @Test
    //    @Suppress
    //    fun collectsHalfEmptyFilelists() {
    //        val commit = Commit("TheAuthor", modificationsByFilename("", "src/Main.java"), OffsetDateTime.now())
    //        val commits = Stream.of(commit).collect(CommitCollector.create(metricsFactory))
    //        assertThat(commits)
    //                .extracting<String, RuntimeException>({ it.filename })
    //                .containsExactly("src/Main.java")
    //    }

    //    @Test
    //    fun doesNotSupportParallelStreams() {
    //        val commit =
    //                Commit("TheAuthor", modificationsByFilename("src/Main.java", "src/Util.java"), OffsetDateTime.now())
    //        val parallelCommitStream = Stream.of(commit, commit).parallel()
    //        assertThatThrownBy { parallelCommitStream.collect(CommitCollector.create(metricsFactory)) }.isInstanceOf(
    //                UnsupportedOperationException::class.java)
    //    }
}
