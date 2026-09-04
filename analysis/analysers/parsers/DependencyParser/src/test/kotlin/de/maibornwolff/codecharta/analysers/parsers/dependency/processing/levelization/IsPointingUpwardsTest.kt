package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization

import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.model.GraphNode
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.model.GraphNodeBuilder
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

/**
 * Unit tests for the isPointingUpwards logic.
 *
 * Based on the TypeScript implementation in visualization/src/app/model/Edge.ts:
 * ```typescript
 * isPointingUpwards(): boolean {
 *   const [sourceNode, targetNode] = findSiblingsUnderLowestCommonAncestor(this.source, this.target)
 *   return sourceNode.level <= targetNode.level
 * }
 * ```
 *
 * The key insight: Find siblings under the lowest common ancestor and compare their levels.
 * An edge "points upwards" when it violates normal dependency flow (lower level → higher level).
 */
class IsPointingUpwardsTest {
    @Test
    fun `should return false when source level is higher than target level - normal dependency flow`() {
        // Given: A typical dependency where higher level depends on lower level
        // Structure:
        //   root
        //   ├── application (level 1)
        //   │   └── service (leaf)
        //   └── domain (level 0)
        //       └── model (leaf)
        // Edge: application.service → domain.model (level 1 → level 0)

        val domain = GraphNodeBuilder(id = "domain", parent = "root", level = 0)
            .withChildren(
                GraphNodeBuilder(id = "model", parent = "root.domain", level = 0).build()
            ).build()

        val application = GraphNodeBuilder(id = "application", parent = "root", level = 1)
            .withChildren(
                GraphNodeBuilder(
                    id = "service",
                    parent = "root.application",
                    level = 1,
                    dependencies = setOf("root.domain.model")
                ).build()
            ).build()

        val root = GraphNodeBuilder(id = "root")
            .withChildren(application, domain)
            .build()

        // When: Checking if edge points upwards
        val sourceNode = findNodeById(root, "root.application.service")!!
        val targetNode = findNodeById(root, "root.domain.model")!!
        val isPointingUpwards = checkIsPointingUpwards(sourceNode, targetNode, root)

        // Then: Should be false (normal flow: higher → lower)
        assertThat(isPointingUpwards).isFalse
    }

    @Test
    fun `should return true when source level equals target level - same level dependency`() {
        // Given: Dependencies between nodes at the same level
        // Structure:
        //   root
        //   ├── moduleA (level 0)
        //   │   └── classA (leaf)
        //   └── moduleB (level 0)
        //       └── classB (leaf)
        // Edge: moduleA.classA → moduleB.classB (level 0 → level 0)

        val moduleA = GraphNodeBuilder(id = "moduleA", parent = "root", level = 0)
            .withChildren(
                GraphNodeBuilder(
                    id = "classA",
                    parent = "root.moduleA",
                    level = 0,
                    dependencies = setOf("root.moduleB.classB")
                ).build()
            ).build()

        val moduleB = GraphNodeBuilder(id = "moduleB", parent = "root", level = 0)
            .withChildren(
                GraphNodeBuilder(id = "classB", parent = "root.moduleB", level = 0).build()
            ).build()

        val root = GraphNodeBuilder(id = "root")
            .withChildren(moduleA, moduleB)
            .build()

        // When: Checking if edge points upwards
        val sourceNode = findNodeById(root, "root.moduleA.classA")!!
        val targetNode = findNodeById(root, "root.moduleB.classB")!!
        val isPointingUpwards = checkIsPointingUpwards(sourceNode, targetNode, root)

        // Then: Should be true (same level is considered upward)
        assertThat(isPointingUpwards).isTrue
    }

    @Test
    fun `should return true when source level is lower than target level - architectural violation`() {
        // Given: An architectural violation where lower level depends on higher level
        // Structure:
        //   root
        //   ├── domain (level 0)
        //   │   └── model (leaf)
        //   └── application (level 1)
        //       └── service (leaf)
        // Edge: domain.model → application.service (level 0 → level 1)

        val domain = GraphNodeBuilder(id = "domain", parent = "root", level = 0)
            .withChildren(
                GraphNodeBuilder(
                    id = "model",
                    parent = "root.domain",
                    level = 0,
                    dependencies = setOf("root.application.service")
                ).build()
            ).build()

        val application = GraphNodeBuilder(id = "application", parent = "root", level = 1)
            .withChildren(
                GraphNodeBuilder(id = "service", parent = "root.application", level = 1).build()
            ).build()

        val root = GraphNodeBuilder(id = "root")
            .withChildren(domain, application)
            .build()

        // When: Checking if edge points upwards
        val sourceNode = findNodeById(root, "root.domain.model")!!
        val targetNode = findNodeById(root, "root.application.service")!!
        val isPointingUpwards = checkIsPointingUpwards(sourceNode, targetNode, root)

        // Then: Should be true (upward flow: lower → higher)
        assertThat(isPointingUpwards).isTrue
    }

    @Test
    fun `should compare levels of siblings under common ancestor not absolute levels`() {
        // Given: A complex hierarchy where absolute levels differ from sibling levels
        // Structure:
        //   root
        //   └── parent (level 0)
        //       ├── childA (level 1)
        //       │   └── leafA (level 2)
        //       └── childB (level 0)
        //           └── leafB (level 1)
        // Edge: parent.childA.leafA → parent.childB.leafB
        // Absolute levels: 2 → 1 (would suggest normal flow)
        // But sibling levels under parent: childA(1) → childB(0) (normal flow)

        val childA = GraphNodeBuilder(id = "childA", parent = "root.parent", level = 1)
            .withChildren(
                GraphNodeBuilder(
                    id = "leafA",
                    parent = "root.parent.childA",
                    level = 2,
                    dependencies = setOf("root.parent.childB.leafB")
                ).build()
            ).build()

        val childB = GraphNodeBuilder(id = "childB", parent = "root.parent", level = 0)
            .withChildren(
                GraphNodeBuilder(id = "leafB", parent = "root.parent.childB", level = 1).build()
            ).build()

        val parent = GraphNodeBuilder(id = "parent", parent = "root", level = 0)
            .withChildren(childA, childB)
            .build()

        val root = GraphNodeBuilder(id = "root")
            .withChildren(parent)
            .build()

        // When: Checking if edge points upwards
        val sourceNode = findNodeById(root, "root.parent.childA.leafA")!!
        val targetNode = findNodeById(root, "root.parent.childB.leafB")!!
        val isPointingUpwards = checkIsPointingUpwards(sourceNode, targetNode, root)

        // Then: Should be false (childA level 1 > childB level 0, normal flow)
        assertThat(isPointingUpwards).isFalse
    }

    @Test
    fun `should handle deeply nested structures correctly`() {
        // Given: A deeply nested structure
        // Structure:
        //   root
        //   └── layer1
        //       └── layer2
        //           ├── moduleA (level 1)
        //           │   └── classA (leaf)
        //           └── moduleB (level 0)
        //               └── classB (leaf)
        // Edge: layer1.layer2.moduleA.classA → layer1.layer2.moduleB.classB

        val moduleA = GraphNodeBuilder(id = "moduleA", parent = "root.layer1.layer2", level = 1)
            .withChildren(
                GraphNodeBuilder(
                    id = "classA",
                    parent = "root.layer1.layer2.moduleA",
                    level = 1,
                    dependencies = setOf("root.layer1.layer2.moduleB.classB")
                ).build()
            ).build()

        val moduleB = GraphNodeBuilder(id = "moduleB", parent = "root.layer1.layer2", level = 0)
            .withChildren(
                GraphNodeBuilder(id = "classB", parent = "root.layer1.layer2.moduleB", level = 0).build()
            ).build()

        val layer2 = GraphNodeBuilder(id = "layer2", parent = "root.layer1")
            .withChildren(moduleA, moduleB)
            .build()

        val layer1 = GraphNodeBuilder(id = "layer1", parent = "root")
            .withChildren(layer2)
            .build()

        val root = GraphNodeBuilder(id = "root")
            .withChildren(layer1)
            .build()

        // When: Checking if edge points upwards
        val sourceNode = findNodeById(root, "root.layer1.layer2.moduleA.classA")!!
        val targetNode = findNodeById(root, "root.layer1.layer2.moduleB.classB")!!
        val isPointingUpwards = checkIsPointingUpwards(sourceNode, targetNode, root)

        // Then: Should be false (moduleA level 1 > moduleB level 0)
        assertThat(isPointingUpwards).isFalse
    }

    @Test
    fun `should handle edge between direct siblings`() {
        // Given: Direct siblings at the same level
        // Structure:
        //   root
        //   ├── siblingA (level 0)
        //   └── siblingB (level 0)
        // Edge: siblingA → siblingB

        val root = GraphNodeBuilder(id = "root")
            .withChildren(
                GraphNodeBuilder(id = "siblingA", parent = "root", level = 0, dependencies = setOf("root.siblingB")).build(),
                GraphNodeBuilder(id = "siblingB", parent = "root", level = 0).build()
            ).build()

        // When: Checking if edge points upwards
        val sourceNode = findNodeById(root, "root.siblingA")!!
        val targetNode = findNodeById(root, "root.siblingB")!!
        val isPointingUpwards = checkIsPointingUpwards(sourceNode, targetNode, root)

        // Then: Should be true (same level)
        assertThat(isPointingUpwards).isTrue
    }

    @Test
    fun `should throw exception when nodes have no common ancestor`() {
        // Given: Two separate trees with no common ancestor
        val tree1 = GraphNodeBuilder(id = "tree1")
            .withChildren(
                GraphNodeBuilder(id = "nodeA", parent = "tree1", level = 0).build()
            ).build()

        val tree2 = GraphNodeBuilder(id = "tree2")
            .withChildren(
                GraphNodeBuilder(id = "nodeB", parent = "tree2", level = 0).build()
            ).build()

        val sourceNode = findNodeById(tree1, "tree1.nodeA")!!
        val targetNode = findNodeById(tree2, "tree2.nodeB")!!

        // When/Then: Should throw exception (matching TypeScript behavior)
        assertThrows<IllegalStateException> {
            checkIsPointingUpwards(sourceNode, targetNode, tree1)
        }
    }

    @Test
    fun `should detect container level feedback edges between multiple top-level roots - reproduces RootFolderBug`() {
        // Given: Multiple top-level roots representing the structure when analyzing src/frontend/src/
        // This reproduces the bug where core → store dependency is NOT marked as container level feedback edge
        //
        // Structure (what the bug creates - multiple separate roots):
        //   core (level 0)
        //   │   └── models
        //   │       └── hydrate
        //   │           └── actions
        //   │               └── hydrate (leaf) → store.createStore.RootState
        //   store (level 1)
        //       └── createStore
        //           └── RootState (leaf)
        //
        // Expected: core.models.hydrate.actions.hydrate → store.createStore.RootState
        //           should be a container level feedback edge (level 0 → level 1, architectural violation)

        val storeRoot = GraphNodeBuilder(id = "store", level = 1)
            .withChildren(
                GraphNodeBuilder(id = "createStore", parent = "store", level = 1)
                    .withChildren(
                        GraphNodeBuilder(id = "RootState", parent = "store.createStore", level = 1).build()
                    ).build()
            ).build()

        val coreRoot = GraphNodeBuilder(id = "core", level = 0)
            .withChildren(
                GraphNodeBuilder(id = "models", parent = "core", level = 0)
                    .withChildren(
                        GraphNodeBuilder(id = "hydrate", parent = "core.models", level = 0)
                            .withChildren(
                                GraphNodeBuilder(id = "actions", parent = "core.models.hydrate", level = 0)
                                    .withChildren(
                                        GraphNodeBuilder(
                                            id = "hydrate",
                                            parent = "core.models.hydrate.actions",
                                            level = 0,
                                            dependencies = setOf("store.createStore.RootState")
                                        ).build()
                                    ).build()
                            ).build()
                    ).build()
            ).build()

        // When: both roots are wrapped in the virtual root, so they have a common ancestor to compare under
        val (_, virtualRoot) = GraphNode.wrapInVirtualRootIfNeeded(listOf(coreRoot, storeRoot))

        val isPointingUpwards =
            GraphIndex(virtualRoot).isPointingUpwards("core.models.hydrate.actions.hydrate", "store.createStore.RootState")

        // Then: the edge crosses from core (level 0) to store (level 1), so it is a container level feedback edge
        assertThat(isPointingUpwards)
            .describedAs(
                "Edge from core (level 0) to store (level 1) should be a container level feedback edge (isPointingUpwards=true), " +
                    "but is false when the roots are not wrapped in a common ancestor"
            ).isTrue()
    }

    @Test
    fun `should handle real-world example from Java codebase`() {
        // Given: The actual structure from the Java example
        // Structure (simplified):
        //   de.sots.cellarsandcentaurs
        //   ├── application (level 1)
        //   │   ├── CreatureFacade
        //   │   └── CreatureUtil
        //   └── domain (level 0)
        //       └── model
        //           ├── ArmorClass
        //           └── Creature
        // Violations:
        // - domain.model.ArmorClass → application.CreatureUtil (level 0 → level 1)
        // - domain.model.Creature → application.CreatureFacade (level 0 → level 1)

        val application = GraphNodeBuilder(id = "application", parent = "de.sots.cellarsandcentaurs", level = 1)
            .withChildren(
                GraphNodeBuilder(id = "CreatureFacade", parent = "de.sots.cellarsandcentaurs.application", level = 1).build(),
                GraphNodeBuilder(id = "CreatureUtil", parent = "de.sots.cellarsandcentaurs.application", level = 1).build()
            ).build()

        val model = GraphNodeBuilder(id = "model", parent = "de.sots.cellarsandcentaurs.domain", level = 0)
            .withChildren(
                GraphNodeBuilder(
                    id = "ArmorClass",
                    parent = "de.sots.cellarsandcentaurs.domain.model",
                    level = 0,
                    dependencies = setOf("de.sots.cellarsandcentaurs.application.CreatureUtil")
                ).build(),
                GraphNodeBuilder(
                    id = "Creature",
                    parent = "de.sots.cellarsandcentaurs.domain.model",
                    level = 0,
                    dependencies = setOf("de.sots.cellarsandcentaurs.application.CreatureFacade")
                ).build()
            ).build()

        val domain = GraphNodeBuilder(id = "domain", parent = "de.sots.cellarsandcentaurs", level = 0)
            .withChildren(model)
            .build()

        val root = GraphNodeBuilder(id = "de.sots.cellarsandcentaurs")
            .withChildren(application, domain)
            .build()

        // When: Checking architectural violations
        val armorClass = findNodeById(root, "de.sots.cellarsandcentaurs.domain.model.ArmorClass")!!
        val creatureUtil = findNodeById(root, "de.sots.cellarsandcentaurs.application.CreatureUtil")!!
        val isArmorClassViolation = checkIsPointingUpwards(armorClass, creatureUtil, root)

        val creature = findNodeById(root, "de.sots.cellarsandcentaurs.domain.model.Creature")!!
        val creatureFacade = findNodeById(root, "de.sots.cellarsandcentaurs.application.CreatureFacade")!!
        val isCreatureViolation = checkIsPointingUpwards(creature, creatureFacade, root)

        // Then: Both should be architectural violations (pointing upwards)
        assertThat(isArmorClassViolation).isTrue
        assertThat(isCreatureViolation).isTrue
    }

    // Helper functions to simulate the logic that needs to be implemented

    /**
     * Finds a node by its full ID in the tree.
     */
    private fun findNodeById(root: GraphNode, id: String): GraphNode? {
        if (root.id == id) return root
        for (child in root.children) {
            val found = findNodeById(child, id)
            if (found != null) return found
        }
        return null
    }

    /**
     * Simulates the isPointingUpwards logic that needs to be implemented.
     * This is a placeholder implementation for testing purposes.
     *
     * The actual implementation should:
     * 1. Find the lowest common ancestor of source and target
     * 2. Get the siblings under that ancestor (one containing source, one containing target)
     * 3. Compare their levels: sourceLevel <= targetLevel means pointing upwards
     */
    private fun checkIsPointingUpwards(source: GraphNode, target: GraphNode, root: GraphNode): Boolean =
        GraphIndex(root).isPointingUpwards(source.id, target.id)
}
