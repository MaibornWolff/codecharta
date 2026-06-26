package de.maibornwolff.codecharta.model

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class LensTest {
    @Test
    fun `should keep the first occurrence of an attribute type when merging metrics lenses`() {
        val first = MetricsLens(attributeTypes = mapOf("rloc" to AttributeType.ABSOLUTE))
        val second = MetricsLens(attributeTypes = mapOf("rloc" to AttributeType.RELATIVE, "mcc" to AttributeType.ABSOLUTE))

        val merged = first.merge(second)

        assertEquals(AttributeType.ABSOLUTE, merged.attributeTypes["rloc"])
        assertEquals(AttributeType.ABSOLUTE, merged.attributeTypes["mcc"])
    }

    @Test
    fun `should union analyzers of matching descriptors when merging metrics lenses`() {
        val first = MetricsLens(attributeDescriptors = mapOf("rloc" to AttributeDescriptor(title = "rloc", analyzers = setOf("a"))))
        val second = MetricsLens(attributeDescriptors = mapOf("rloc" to AttributeDescriptor(title = "rloc", analyzers = setOf("b"))))

        val merged = first.merge(second)

        assertEquals(setOf("a", "b"), merged.attributeDescriptors["rloc"]!!.analyzers)
    }

    @Test
    fun `should not mutate input descriptors when merging metrics lenses`() {
        val shared = AttributeDescriptor(title = "rloc", analyzers = setOf("a"))
        val first = MetricsLens(attributeDescriptors = mapOf("rloc" to shared))
        val second = MetricsLens(attributeDescriptors = mapOf("rloc" to AttributeDescriptor(title = "rloc", analyzers = setOf("b"))))

        val merged = first.merge(second)

        assertEquals(setOf("a"), shared.analyzers) // the shared input descriptor is untouched
        assertEquals(setOf("a", "b"), merged.attributeDescriptors["rloc"]!!.analyzers)
    }

    @Test
    fun `should route edge-type descriptors into the dependency lens and node descriptors into metrics`() {
        val lenses =
            LensSet.fromLegacy(
                edges = emptyList(),
                attributeTypes = mapOf(
                    "edges" to mapOf("pairingRate" to AttributeType.RELATIVE),
                    "nodes" to mapOf("rloc" to AttributeType.ABSOLUTE)
                ),
                attributeDescriptors = mapOf(
                    "pairingRate" to AttributeDescriptor(title = "pairingRate"),
                    "rloc" to AttributeDescriptor(title = "rloc")
                )
            )

        assertEquals(setOf("pairingRate"), lenses.dependency.attributeDescriptors.keys)
        assertEquals(setOf("rloc"), lenses.metrics.attributeDescriptors.keys)
    }

    @Test
    fun `should default missing analyzers to Unknown when merging descriptors`() {
        val first = MetricsLens(attributeDescriptors = mapOf("rloc" to AttributeDescriptor(title = "rloc")))
        val second = MetricsLens()

        val merged = first.merge(second)

        assertEquals(setOf("Unknown"), merged.attributeDescriptors["rloc"]!!.analyzers)
    }

    @Test
    fun `should merge edges deduplicated by endpoints when mergeEdges is set`() {
        val first = DependencyLens(edges = listOf(Edge("/root/a", "/root/b", mapOf("x" to 1))))
        val second =
            DependencyLens(
                edges = listOf(Edge("/root/a", "/root/b", mapOf("x" to 9)), Edge("/root/b", "/root/c", mapOf("x" to 2)))
            )

        val merged = first.merge(second, mergeEdges = true)

        assertEquals(2, merged.edges.size)
        // The duplicate a->b keeps the first lens's attributes (x=1, not 9); the unique b->c survives.
        val ab = merged.edges.single { it.fromNodeName == "/root/a" && it.toNodeName == "/root/b" }
        val bc = merged.edges.single { it.fromNodeName == "/root/b" && it.toNodeName == "/root/c" }
        assertEquals(1, ab.attributes["x"])
        assertEquals(2, bc.attributes["x"])
    }

    @Test
    fun `should keep only its own edges when mergeEdges is not set`() {
        val first = DependencyLens(edges = listOf(Edge("/root/a", "/root/b")))
        val second = DependencyLens(edges = listOf(Edge("/root/b", "/root/c")))

        val merged = first.merge(second, mergeEdges = false)

        assertEquals(1, merged.edges.size)
    }

    @Test
    fun `should rebuild the legacy node-edge attributeTypes split from the lenses`() {
        val lenses =
            LensSet(
                metrics = MetricsLens(attributeTypes = mapOf("rloc" to AttributeType.ABSOLUTE)),
                dependency = DependencyLens(attributeTypes = mapOf("pairingRate" to AttributeType.RELATIVE))
            )

        val legacy = lenses.legacyAttributeTypes()

        assertEquals(AttributeType.ABSOLUTE, legacy["nodes"]!!["rloc"])
        assertEquals(AttributeType.RELATIVE, legacy["edges"]!!["pairingRate"])
    }

    @Test
    fun `should fold the legacy edges and attributeTypes split into the lens set`() {
        val lenses =
            LensSet.fromLegacy(
                edges = listOf(Edge("/root/a", "/root/b")),
                attributeTypes = mapOf(
                    "nodes" to mapOf("rloc" to AttributeType.ABSOLUTE),
                    "edges" to mapOf("dep" to AttributeType.ABSOLUTE)
                ),
                attributeDescriptors = mapOf("rloc" to AttributeDescriptor(title = "rloc"))
            )

        assertEquals(AttributeType.ABSOLUTE, lenses.metrics.attributeTypes["rloc"])
        assertEquals(AttributeType.ABSOLUTE, lenses.dependency.attributeTypes["dep"])
        assertEquals(1, lenses.dependency.edges.size)
        assertEquals("rloc", lenses.metrics.attributeDescriptors["rloc"]!!.title)
    }
}
