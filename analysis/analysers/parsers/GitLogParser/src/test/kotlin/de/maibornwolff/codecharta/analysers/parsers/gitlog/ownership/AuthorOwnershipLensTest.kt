package de.maibornwolff.codecharta.analysers.parsers.gitlog.ownership

import de.maibornwolff.codecharta.model.ClusterMember
import de.maibornwolff.codecharta.model.ClusterMembership
import de.maibornwolff.codecharta.model.NodeId
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AuthorOwnershipLensTest {
    private val firstCommit = "abcdef0123456789"

    private fun commit(hash: String, vararg people: String) = CommitPeople(hash, people.toList())

    private fun clusteringOf(commits: List<CommitPeople>, blame: Map<String, FileBlame>) =
        AuthorOwnershipLens.of(commits, blame).clusterings.getValue("author-ownership")

    @Test
    fun `should number people by first commit and keep the number of one with no surviving line`() {
        // Arrange
        val commits = listOf(commit(firstCommit, "Ann"), commit("c2", "Bob"), commit("c3", "Cid"))
        val blame = mapOf("a.kt" to FileBlame(mapOf(firstCommit to 1, "c3" to 1), 2))

        // Act
        val clustering = clusteringOf(commits, blame)

        // Assert
        assertThat(clustering.clusters.map { it.id }).containsExactly("abcdef0-author-1", "abcdef0-author-3")
        assertThat(clustering.clusters.map { it.name }).containsExactly("Author 1", "Author 3")
    }

    @Test
    fun `should write neither names nor attributes`() {
        // Arrange
        val commits = listOf(commit(firstCommit, "Ann Secret"))
        val blame = mapOf("a.kt" to FileBlame(mapOf(firstCommit to 1), 1))

        // Act
        val clustering = clusteringOf(commits, blame)

        // Assert
        assertThat(clustering.toString()).doesNotContain("Secret")
        assertThat(clustering.clusters.single().attributes).isEmpty()
        assertThat(clustering.attributeDescriptors).isEmpty()
    }

    @Test
    fun `should write real names under a clustering of its own only when asked to`() {
        // Arrange
        val commits = listOf(commit(firstCommit, "Ann Real", "Bob Real"))
        val blame = mapOf("a.kt" to FileBlame(mapOf(firstCommit to 1), 1))

        // Act
        val lens = AuthorOwnershipLens.of(commits, blame, withNames = true)

        // Assert
        val clustering = lens.clusterings.getValue("author-ownership-with-names")
        assertThat(lens.clusterings.keys).containsExactly("author-ownership-with-names")
        assertThat(clustering.title).isEqualTo("Author ownership (real names)")
        assertThat(clustering.clusters.map { it.name }).containsExactly("Ann Real", "Bob Real")
        assertThat(clustering.clusters.map { it.id }).containsExactly("abcdef0-author-1", "abcdef0-author-2")
    }

    @Test
    fun `should describe the clustering as weighted by lines from the git log parser`() {
        // Arrange
        val commits = listOf(commit(firstCommit, "Ann"))
        val blame = mapOf("a.kt" to FileBlame(mapOf(firstCommit to 1), 1))

        // Act
        val clustering = clusteringOf(commits, blame)

        // Assert
        assertThat(clustering.title).isEqualTo("Author ownership")
        assertThat(clustering.membership).isEqualTo(ClusterMembership.WEIGHTED)
        assertThat(clustering.weightBasis).isEqualTo("loc")
        assertThat(clustering.analyzers).containsExactly("gitlogparser")
    }

    @Test
    fun `should split the lines of a commit equally among its people and add up a person's commits`() {
        // Arrange
        val commits = listOf(commit(firstCommit, "Ann", "Bob"), commit("c2", "Bob"))
        val blame = mapOf("a.kt" to FileBlame(mapOf(firstCommit to 2, "c2" to 2), 4))

        // Act
        val clustering = clusteringOf(commits, blame)

        // Assert
        assertThat(clustering.clusters.map { it.members.single().weight }).containsExactly(0.25, 0.75)
    }

    @Test
    fun `should count exactly when commits divide a line differently`() {
        // Arrange
        val commits = listOf(commit(firstCommit, "Ann", "Bob", "Cid"), commit("c2", "Ann", "Bob"), commit("c3", "Ann"))
        val blame = mapOf("a.kt" to FileBlame(mapOf(firstCommit to 3, "c2" to 2, "c3" to 1), 6))

        // Act
        val clustering = clusteringOf(commits, blame)

        // Assert
        assertThat(clustering.clusters.map { it.members.single().weight }).containsExactly(0.5, 0.3333, 0.1666)
    }

    @Test
    fun `should round the weights down to four decimals so a file never sums above one`() {
        // Arrange
        val commits = listOf(commit(firstCommit, "Ann"), commit("c2", "Bob"), commit("c3", "Cid"))
        val blame = mapOf("a.kt" to FileBlame(mapOf(firstCommit to 1, "c2" to 1, "c3" to 1), 3))

        // Act
        val clustering = clusteringOf(commits, blame)

        // Assert
        assertThat(clustering.clusters.flatMap { it.members }.map { it.weight }).containsOnly(0.3333)
    }

    @Test
    fun `should leave out a share too small to show at four decimals`() {
        // Arrange
        val commits = listOf(commit(firstCommit, "Ann"), commit("c2", "Bob"))
        val blame = mapOf("big.kt" to FileBlame(mapOf(firstCommit to 19_999, "c2" to 1), 20_000))

        // Act
        val clustering = clusteringOf(commits, blame)

        // Assert
        assertThat(clustering.clusters.map { it.name }).containsExactly("Author 1")
    }

    @Test
    fun `should leave the uncommitted part of a file unattributed`() {
        // Arrange
        val commits = listOf(commit(firstCommit, "Ann"))
        val blame = mapOf("src/a.kt" to FileBlame(mapOf(firstCommit to 1), 2))

        // Act
        val clustering = clusteringOf(commits, blame)

        // Assert
        assertThat(clustering.clusters.single().members)
            .containsExactly(ClusterMember(NodeId.fromSegments(listOf("src", "a.kt")), 0.5))
    }

    @Test
    fun `should sort the members by node id whatever order the files came in`() {
        // Arrange
        val commits = listOf(commit(firstCommit, "Ann"))
        val paths = listOf("a.kt", "b.kt", "c.kt", "d.kt")
        val forwards = paths.associateWith { FileBlame(mapOf(firstCommit to 1), 1) }
        val backwards = paths.reversed().associateWith { FileBlame(mapOf(firstCommit to 1), 1) }

        // Act
        val fromForwards = clusteringOf(commits, forwards)
        val fromBackwards = clusteringOf(commits, backwards)

        // Assert
        assertThat(fromForwards).isEqualTo(fromBackwards)
        assertThat(fromForwards.clusters.single().members.map { it.nodeId }).isSorted()
    }

    @Test
    fun `should carry nothing when no file has an attributed line`() {
        // Arrange
        val commits = listOf(commit(firstCommit, "Ann"))
        val blame = mapOf("a.kt" to FileBlame(emptyMap(), 2))

        // Act
        val lens = AuthorOwnershipLens.of(commits, blame)

        // Assert
        assertThat(lens.carriesData).isFalse()
    }

    @Test
    fun `should carry nothing without any commit`() {
        // Arrange & Act
        val lens = AuthorOwnershipLens.of(emptyList(), emptyMap())

        // Assert
        assertThat(lens.carriesData).isFalse()
    }
}
