package de.maibornwolff.codecharta.analysers.parsers.gitlog.ownership

import de.maibornwolff.codecharta.model.ClusterMember
import de.maibornwolff.codecharta.model.ClusterMembership
import de.maibornwolff.codecharta.model.NodeId
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AuthorOwnershipLensTest {
    private val hash = "abcdef0123456789"

    private fun clusteringOf(authors: List<String>, blame: Map<String, FileBlame>) =
        AuthorOwnershipLens.of(hash, authors, blame).clusterings.getValue("author-ownership")

    @Test
    fun `should number the authors by first commit and keep the number of one with no surviving line`() {
        // Arrange
        val blame = mapOf("a.kt" to FileBlame(mapOf("Cid" to 1, "Ann" to 1), 2))

        // Act
        val clustering = clusteringOf(listOf("Ann", "Bob", "Cid"), blame)

        // Assert
        assertThat(clustering.clusters.map { it.id }).containsExactly("abcdef0-author-1", "abcdef0-author-3")
        assertThat(clustering.clusters.map { it.name }).containsExactly("Author 1", "Author 3")
    }

    @Test
    fun `should write neither names nor attributes`() {
        // Arrange
        val blame = mapOf("a.kt" to FileBlame(mapOf("Ann Secret" to 1), 1))

        // Act
        val clustering = clusteringOf(listOf("Ann Secret"), blame)

        // Assert
        assertThat(clustering.toString()).doesNotContain("Secret")
        assertThat(clustering.clusters.single().attributes).isEmpty()
        assertThat(clustering.attributeDescriptors).isEmpty()
    }

    @Test
    fun `should describe the clustering as weighted by lines from the git log parser`() {
        // Arrange
        val blame = mapOf("a.kt" to FileBlame(mapOf("Ann" to 1), 1))

        // Act
        val clustering = clusteringOf(listOf("Ann"), blame)

        // Assert
        assertThat(clustering.title).isEqualTo("Author ownership")
        assertThat(clustering.membership).isEqualTo(ClusterMembership.WEIGHTED)
        assertThat(clustering.weightBasis).isEqualTo("loc")
        assertThat(clustering.analyzers).containsExactly("gitlogparser")
    }

    @Test
    fun `should round the weights down to four decimals so a file never sums above one`() {
        // Arrange
        val blame = mapOf("a.kt" to FileBlame(mapOf("Ann" to 1, "Bob" to 1, "Cid" to 1), 3))

        // Act
        val clustering = clusteringOf(listOf("Ann", "Bob", "Cid"), blame)

        // Assert
        assertThat(clustering.clusters.flatMap { it.members }.map { it.weight }).containsOnly(0.3333)
    }

    @Test
    fun `should leave out a share too small to show at four decimals`() {
        // Arrange
        val blame = mapOf("big.kt" to FileBlame(mapOf("Ann" to 19_999, "Bob" to 1), 20_000))

        // Act
        val clustering = clusteringOf(listOf("Ann", "Bob"), blame)

        // Assert
        assertThat(clustering.clusters.map { it.name }).containsExactly("Author 1")
    }

    @Test
    fun `should leave the uncommitted part of a file unattributed`() {
        // Arrange
        val blame = mapOf("src/a.kt" to FileBlame(mapOf("Ann" to 1), 2))

        // Act
        val clustering = clusteringOf(listOf("Ann"), blame)

        // Assert
        assertThat(clustering.clusters.single().members)
            .containsExactly(ClusterMember(NodeId.fromSegments(listOf("src", "a.kt")), 0.5))
    }

    @Test
    fun `should sort the members by node id whatever order the files came in`() {
        // Arrange
        val paths = listOf("a.kt", "b.kt", "c.kt", "d.kt")
        val forwards = paths.associateWith { FileBlame(mapOf("Ann" to 1), 1) }
        val backwards = paths.reversed().associateWith { FileBlame(mapOf("Ann" to 1), 1) }

        // Act
        val fromForwards = clusteringOf(listOf("Ann"), forwards)
        val fromBackwards = clusteringOf(listOf("Ann"), backwards)

        // Assert
        assertThat(fromForwards).isEqualTo(fromBackwards)
        assertThat(fromForwards.clusters.single().members.map { it.nodeId }).isSorted()
    }

    @Test
    fun `should carry nothing when no file has an attributed line`() {
        // Arrange
        val blame = mapOf("a.kt" to FileBlame(emptyMap(), 2))

        // Act
        val lens = AuthorOwnershipLens.of(hash, listOf("Ann"), blame)

        // Assert
        assertThat(lens.carriesData).isFalse()
    }
}
