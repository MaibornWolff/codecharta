package de.maibornwolff.codecharta.analysers.parsers.gitlog.commitchanges

import de.maibornwolff.codecharta.model.ClusterMember
import de.maibornwolff.codecharta.model.ClusterMembership
import de.maibornwolff.codecharta.model.Clustering
import de.maibornwolff.codecharta.model.NodeId
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CommitChangesLensTest {
    private val hash = "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678"
    private val noon20261031 = 1_793_448_000L

    private fun commit(vararg changes: FileChange, subject: String = "Fix login", hash: String = this.hash) =
        LoggedCommit(hash, noon20261031, subject, changes.toList())

    private fun clusteringOf(
        commits: List<LoggedCommit>,
        linesToday: Map<String, Int?>,
        peopleByHash: Map<String, List<String>> = commits.associate { it.hash to listOf("Magenta Rabbit", "Teal Falcon") }
    ): Clustering = CommitChangesLens.of(commits, linesToday, peopleByHash).clusterings.getValue(CommitChangesLens.CLUSTERING_KEY)

    private fun idOf(path: String) = NodeId.fromSegments(path.split("/"))

    @Test
    fun `should weigh a change as the lines changed over the lines in the file today`() {
        // Arrange
        val commits = listOf(commit(FileChange("src/a.kt", 50)))

        // Act
        val clustering = clusteringOf(commits, mapOf("src/a.kt" to 200))

        // Assert
        assertThat(clustering.membership).isEqualTo(ClusterMembership.OVERLAY)
        assertThat(clustering.clusters.single().members).containsExactly(ClusterMember(idOf("src/a.kt"), 0.25))
    }

    @Test
    fun `should cap the weight at the whole file when a commit changed more lines than the file has`() {
        // Arrange
        val commits = listOf(commit(FileChange("a.kt", 300)))

        // Act
        val clustering = clusteringOf(commits, mapOf("a.kt" to 200))

        // Assert
        assertThat(
            clustering.clusters
                .single()
                .members
                .single()
                .weight
        ).isEqualTo(1.0)
    }

    @Test
    fun `should keep a tiny change visible with the smallest weight`() {
        // Arrange
        val commits = listOf(commit(FileChange("a.kt", 1)))

        // Act
        val clustering = clusteringOf(commits, mapOf("a.kt" to 100_000))

        // Assert
        assertThat(
            clustering.clusters
                .single()
                .members
                .single()
                .weight
        ).isEqualTo(0.0001)
    }

    @Test
    fun `should omit the weight of a file with no lines to relate to`() {
        // Arrange
        val commits = listOf(commit(FileChange("logo.png", null), FileChange("empty.txt", 3)))

        // Act
        val clustering = clusteringOf(commits, mapOf("logo.png" to null, "empty.txt" to 0))

        // Assert
        assertThat(clustering.clusters.single().members.map { it.weight }).containsOnlyNulls()
    }

    @Test
    fun `should follow a renamed file to its path today, for older commits only`() {
        // Arrange
        val commits = listOf(
            commit(FileChange("new.kt", 2, pathBefore = "old.kt"), hash = "b".repeat(40)),
            commit(FileChange("old.kt", 5), hash = "a".repeat(40))
        )

        // Act
        val clustering = clusteringOf(commits, mapOf("new.kt" to 10))

        // Assert
        assertThat(clustering.clusters.map { it.members.single() })
            .containsExactly(ClusterMember(idOf("new.kt"), 0.2), ClusterMember(idOf("new.kt"), 0.5))
    }

    @Test
    fun `should not count a pure rename as a change of the file`() {
        // Arrange
        val commits = listOf(commit(FileChange("new.kt", 0, pathBefore = "old.kt")))

        // Act
        val lens = CommitChangesLens.of(commits, mapOf("new.kt" to 10), emptyMap())

        // Assert
        assertThat(lens.carriesData).isFalse()
    }

    @Test
    fun `should leave out a commit none of whose files exist today, yet count them in its attributes`() {
        // Arrange
        val gone = commit(FileChange("gone.kt", 9), hash = "a".repeat(40))
        val partlyGone = commit(FileChange("gone.kt", 9), FileChange("a.kt", 1), hash = "b".repeat(40))

        // Act
        val clustering = clusteringOf(listOf(partlyGone, gone), mapOf("a.kt" to 10))

        // Assert
        val cluster = clustering.clusters.single()
        assertThat(cluster.id).isEqualTo("b".repeat(40))
        assertThat(cluster.attributes).containsEntry("changed_files", 2).containsEntry("changed_lines", 10)
    }

    @Test
    fun `should name a commit by its short hash and subject, identify it by its full hash and date it in UTC`() {
        // Arrange
        val commits = listOf(commit(FileChange("a.kt", 1)))

        // Act
        val clustering = clusteringOf(commits, mapOf("a.kt" to 10))

        // Assert
        val cluster = clustering.clusters.single()
        assertThat(cluster.id).isEqualTo(hash)
        assertThat(cluster.name).isEqualTo("a1b2c3d Fix login")
        assertThat(cluster.attributes).containsEntry("date", "2026-10-31")
    }

    @Test
    fun `should write the author of each commit`() {
        // Arrange
        val commits = listOf(commit(FileChange("a.kt", 1)))

        // Act
        val clustering = clusteringOf(commits, mapOf("a.kt" to 10), mapOf(hash to listOf("Ochre Elk")))

        // Assert
        assertThat(clustering.clusters.single().attributes).containsEntry("author", "Ochre Elk")
    }

    @Test
    fun `should write the co-authors of a commit in their order, joined by semicolons`() {
        // Arrange
        val commits = listOf(commit(FileChange("a.kt", 1)))

        // Act
        val clustering = clusteringOf(commits, mapOf("a.kt" to 10), mapOf(hash to listOf("Ochre Elk", "Teal Falcon", "Jade Owl")))

        // Assert
        assertThat(clustering.clusters.single().attributes)
            .containsEntry("author", "Ochre Elk")
            .containsEntry("co_authors", "Teal Falcon; Jade Owl")
    }

    @Test
    fun `should name the author and each co-author only once`() {
        // Arrange
        val commits = listOf(commit(FileChange("a.kt", 1)))
        val people = listOf("Ochre Elk", "Teal Falcon", "Ochre Elk", "Jade Owl", "Teal Falcon")

        // Act
        val clustering = clusteringOf(commits, mapOf("a.kt" to 10), mapOf(hash to people))

        // Assert
        assertThat(clustering.clusters.single().attributes).containsEntry("co_authors", "Teal Falcon; Jade Owl")
    }

    @Test
    fun `should leave out the co-authors of a commit that has none`() {
        // Arrange
        val commits = listOf(commit(FileChange("a.kt", 1)))

        // Act
        val clustering = clusteringOf(commits, mapOf("a.kt" to 10), mapOf(hash to listOf("Ochre Elk")))

        // Assert
        assertThat(clustering.clusters.single().attributes).doesNotContainKey("co_authors").containsEntry("author", "Ochre Elk")
    }

    @Test
    fun `should leave out the author of a commit the history does not hold`() {
        // Arrange
        val commits = listOf(commit(FileChange("a.kt", 1)))

        // Act
        val clustering = clusteringOf(commits, mapOf("a.kt" to 10), emptyMap())

        // Assert
        assertThat(clustering.clusters.single().attributes)
            .doesNotContainKeys("author", "co_authors")
            .containsEntry("changed_files", 1)
    }

    @Test
    fun `should describe every attribute it writes`() {
        // Arrange
        val commits = listOf(commit(FileChange("a.kt", 1), subject = "fix: hotfix for the login"))

        // Act
        val clustering = clusteringOf(commits, mapOf("a.kt" to 10))

        // Assert
        assertThat(clustering.attributeDescriptors.keys).isEqualTo(clustering.clusters.single().attributes.keys)
        assertThat(
            clustering.attributeDescriptors.values.map { it.title }
        ).containsExactly("Date", "Author", "Co-authors", "Files changed", "Lines changed", "Commit type", "Hotfix")
    }

    @Test
    fun `should write the type the subject starts with and flag a hotfix as the commit metrics count them`() {
        // Arrange
        val commits = listOf(
            commit(FileChange("a.kt", 1), subject = "feat(login): remember the user", hash = "f1"),
            commit(FileChange("a.kt", 1), subject = "Hotfix the broken login", hash = "f2")
        )

        // Act
        val clustering = clusteringOf(commits, mapOf("a.kt" to 10))

        // Assert
        val (feature, hotfix) = clustering.clusters
        assertThat(feature.attributes).containsEntry("commit_type", "feat").doesNotContainKey("hotfix")
        assertThat(hotfix.attributes).containsEntry("hotfix", 1).doesNotContainKey("commit_type")
    }

    @Test
    fun `should write nothing when no commit touched a file of today`() {
        // Arrange & Act
        val lens = CommitChangesLens.of(emptyList(), mapOf("a.kt" to 10), emptyMap())

        // Assert
        assertThat(lens.clusterings).isEmpty()
    }
}
