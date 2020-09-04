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

    @Test
    fun test_given_deleted_file_when_modified_then_flag_as_mutated() {
        val testFileName = "src/Main.java";

        val addModification = Modification(testFileName, Modification.Type.ADD)
        val deleteModification = Modification(testFileName, Modification.Type.DELETE)
        val modifyModification = Modification(testFileName, Modification.Type.MODIFY)

        val addCommit = Commit("Add $testFileName", listOf(addModification), OffsetDateTime.now())
        val deleteCommit = Commit("Delete $testFileName", listOf(deleteModification), OffsetDateTime.now())
        val modifyCommit = Commit("Modify $testFileName", listOf(modifyModification), OffsetDateTime.now())

        val versionControlledFilesList =
                Stream.of(addCommit, deleteCommit, modifyCommit).collect(CommitCollector.create(metricsFactory))

        assertThat(versionControlledFilesList.get(testFileName)!!.isDeleted(), equalTo(true))
        assertThat(versionControlledFilesList.get(testFileName)!!.isMutated(), equalTo(true))
    }

    @Test
    fun test_given_mutated_file_when_merge_commit_then_resolve_mutated_files() {
        val testFileName = "src/Main.java";

        val addModification = Modification(testFileName, Modification.Type.ADD)
        val deleteModification = Modification(testFileName, Modification.Type.DELETE)
        val modifyModification = Modification(testFileName, Modification.Type.MODIFY)

        val addCommit = Commit("Add $testFileName", listOf(addModification), OffsetDateTime.now())
        val deleteCommit = Commit("Delete $testFileName", listOf(deleteModification), OffsetDateTime.now())
        val modifyCommit = Commit("Modify $testFileName", listOf(modifyModification), OffsetDateTime.now())

        val versionControlledFilesList =
                Stream.of(addCommit, deleteCommit, modifyCommit).collect(CommitCollector.create(metricsFactory))

        assertThat(versionControlledFilesList.get(testFileName)!!.isDeleted(), equalTo(true))
        assertThat(versionControlledFilesList.get(testFileName)!!.isMutated(), equalTo(true))

        //commits


        //merge commit

        //
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
