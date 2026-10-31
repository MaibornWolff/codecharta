package de.maibornwolff.codecharta.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ClustersLensTest {
    private fun lensOf(
        vararg clusters: Cluster,
        membership: ClusterMembership = ClusterMembership.WEIGHTED,
        analyzer: String = "gitlogparser"
    ) = ClustersLens(mapOf(KEY to Clustering("Author ownership", membership, listOf(analyzer), clusters.toList())))

    private fun ClustersLens.clusters() = clusterings.getValue(KEY).clusters

    @Test
    fun `should not carry data when no clustering has a cluster`() {
        // Arrange
        val emptyClustering = lensOf()

        // Act
        val carriesData = emptyClustering.carriesData

        // Assert
        assertThat(carriesData).isFalse()
        assertThat(ClustersLens().carriesData).isFalse()
    }

    @Test
    fun `should union clusters by id and members by node id when merging`() {
        // Arrange
        val first = lensOf(Cluster("a", "A", listOf(ClusterMember("n1", 0.5))))
        val second = lensOf(
            Cluster("a", "A", listOf(ClusterMember("n2", 0.25))),
            Cluster("b", "B", listOf(ClusterMember("n1", 0.5)))
        )

        // Act
        val merged = first.merge(second)

        // Assert
        assertThat(merged.clusters().map { it.id }).containsExactly("a", "b")
        assertThat(merged.clusters().first().members).containsExactly(ClusterMember("n1", 0.5), ClusterMember("n2", 0.25))
    }

    @Test
    fun `should keep the weight of the first input when two inputs weigh a member differently`() {
        // Arrange
        val first = lensOf(Cluster("a", "A", listOf(ClusterMember("n1", 0.5))))
        val second = lensOf(Cluster("a", "A", listOf(ClusterMember("n1", 0.9))))

        // Act
        val merged = first.merge(second)

        // Assert
        assertThat(merged.clusters().single().members).containsExactly(ClusterMember("n1", 0.5))
    }

    @Test
    fun `should union the analyzers and keep the clusterings only one input has when merging`() {
        // Arrange
        val first = lensOf(Cluster("a", "A", listOf(ClusterMember("n1"))))
        val second = lensOf(Cluster("a", "A", listOf(ClusterMember("n1"))), analyzer = "other")
        val third = ClustersLens(mapOf("teams" to Clustering("Teams", ClusterMembership.PARTITION, listOf("x"), emptyList())))

        // Act
        val merged = first.merge(second).merge(third)

        // Assert
        assertThat(merged.clusterings.getValue(KEY).analyzers).containsExactly("gitlogparser", "other")
        assertThat(merged.clusterings.keys).containsExactly(KEY, "teams")
    }

    @Test
    fun `should give the same result when a lens is merged with itself`() {
        // Arrange
        val lens = lensOf(Cluster("a", "A", listOf(ClusterMember("n1", 0.5))))

        // Act
        val merged = lens.merge(lens)

        // Assert
        assertThat(merged).isEqualTo(lens)
    }

    @Test
    fun `should drop the members whose node is unknown and a cluster left without any`() {
        // Arrange
        val lens = lensOf(
            Cluster("a", "A", listOf(ClusterMember("known", 0.5), ClusterMember("gone", 0.5))),
            Cluster("b", "B", listOf(ClusterMember("gone", 0.5)))
        )

        // Act
        val resolved = lens.droppingUnresolvedMembers(setOf("known"))

        // Assert
        assertThat(resolved.clusters()).containsExactly(Cluster("a", "A", listOf(ClusterMember("known", 0.5))))
    }

    @Test
    fun `should keep an emptied cluster that a surviving cluster still names as its parent`() {
        // Arrange
        val lens = lensOf(
            Cluster("team", "Team", listOf(ClusterMember("gone"))),
            Cluster("author", "Author", listOf(ClusterMember("known")), parentId = "team")
        )

        // Act
        val resolved = lens.keepingMembersOf(setOf("known"))

        // Assert
        assertThat(resolved.clusters().map { it.id }).containsExactly("team", "author")
    }

    @Test
    fun `should drop a clustering left without clusters so the lens carries nothing`() {
        // Arrange
        val lens = lensOf(Cluster("a", "A", listOf(ClusterMember("gone"))))

        // Act
        val resolved = lens.keepingMembersOf(emptySet())

        // Assert
        assertThat(resolved.carriesData).isFalse()
        assertThat(resolved.clusterings).isEmpty()
    }

    @Test
    fun `should move the members onto the new ids and drop those of removed nodes when re-keying`() {
        // Arrange
        val moved = Node("Moved.kt", NodeType.File)
        val removed = Node("Removed.kt", NodeType.File)
        val before = Node("root", NodeType.Folder, children = setOf(Node("old", NodeType.Folder, children = setOf(moved, removed))))
        val after = Node("root", NodeType.Folder, children = setOf(Node("new", NodeType.Folder, children = setOf(moved))))
        val lens = lensOf(
            Cluster(
                "a",
                "A",
                listOf(
                    ClusterMember(NodeId.fromSegments(listOf("old", "Moved.kt")), 0.5),
                    ClusterMember(NodeId.fromSegments(listOf("old", "Removed.kt")), 0.5)
                )
            )
        )
        val remap: SegmentRemapping = { segments ->
            when {
                segments == listOf("old", "Removed.kt") -> null
                segments.firstOrNull() == "old" -> listOf("new") + segments.drop(1)
                else -> segments
            }
        }

        // Act
        val rekeyed = lens.rekeyed(before, after, remap)

        // Assert
        assertThat(rekeyed.clusters().single().members)
            .containsExactly(ClusterMember(NodeId.fromSegments(listOf("new", "Moved.kt")), 0.5))
    }

    @Test
    fun `should read a missing weight as a full share`() {
        // Arrange
        val member = ClusterMember("n1")

        // Act
        val weight = member.effectiveWeight

        // Assert
        assertThat(weight).isEqualTo(1.0)
    }

    companion object {
        private const val KEY = "author-ownership"
    }
}
