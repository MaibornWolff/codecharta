package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class FfmSyntaxTreeLifetimeTest : FfmSyntaxTreeTestBase() {
    @Nested
    inner class ReadReleasingReachedNodes {
        private val code = "class A { int x; int y; }"

        private val typesBelowTheRoot = visitedTypes(code).drop(1)

        private fun typesOfAllDescendants(node: SyntaxNode): List<String> =
            node.children().flatMap { listOf(it.type) + typesOfAllDescendants(it) }.toList()

        @Test
        fun `should return what was read from the root`() {
            FfmSyntaxTree.parse(code, java).use { tree ->
                // Arrange: the parsed code

                // Act
                val types = tree.readReleasingReachedNodes { root -> typesOfAllDescendants(root) }

                // Assert
                assertThat(types).isEqualTo(typesBelowTheRoot)
            }
        }

        @Test
        fun `should release the nodes that were reached`() {
            FfmSyntaxTree.parse(code, java).use { tree ->
                // Arrange
                val markBeforeRead = tree.nodeAllocator.mark()

                // Act
                tree.readReleasingReachedNodes { root -> typesOfAllDescendants(root) }

                // Assert
                assertThat(tree.nodeAllocator.mark()).isEqualTo(markBeforeRead)
            }
        }

        @Test
        fun `should release the nodes that were reached before a failure`() {
            FfmSyntaxTree.parse(code, java).use { tree ->
                // Arrange
                val markBeforeRead = tree.nodeAllocator.mark()

                // Act
                val read = runCatching {
                    tree.readReleasingReachedNodes { root ->
                        typesOfAllDescendants(root)
                        error("extraction failed")
                    }
                }

                // Assert
                assertThat(read.isFailure).isTrue()
                assertThat(tree.nodeAllocator.mark()).isEqualTo(markBeforeRead)
            }
        }

        @Test
        fun `should keep the root readable after the read`() {
            FfmSyntaxTree.parse(code, java).use { tree ->
                // Arrange
                tree.readReleasingReachedNodes { root -> typesOfAllDescendants(root) }

                // Act
                val typesOfSecondRead = tree.readReleasingReachedNodes { root -> typesOfAllDescendants(root) }

                // Assert
                assertThat(tree.rootNode.type).isEqualTo("program")
                assertThat(typesOfSecondRead).isEqualTo(typesBelowTheRoot)
            }
        }
    }

    @Nested
    inner class Lifetime {
        @Test
        fun `should refuse to read a node after its tree was closed`() {
            // Arrange
            val tree = FfmSyntaxTree.parse("class A {}", java)
            val root = tree.rootNode

            // Act
            tree.close()

            // Assert
            assertThatThrownBy { root.type }.isInstanceOf(IllegalStateException::class.java)
        }

        @Test
        fun `should ignore a second close`() {
            // Arrange
            val tree = FfmSyntaxTree.parse("class A {}", java)
            tree.close()

            // Act
            val secondClose = runCatching { tree.close() }

            // Assert
            assertThat(secondClose.isSuccess).isTrue()
        }

        @Test
        fun `should reach every child of a node with more children than a block of nodes holds`() {
            // Arrange
            val fieldCount = 50_000
            val code = "class A {\n" + "int x;\n".repeat(fieldCount) + "}"

            // Act
            val fieldsOfClassBody = FfmSyntaxTree.parse(code, java).use { tree ->
                var fields = 0
                tree.walk { node, nodeType ->
                    if (nodeType == "class_body") fields = (0 until node.childCount).count { node.getChild(it).type == "field_declaration" }
                }
                fields
            }

            // Assert
            assertThat(fieldsOfClassBody).isEqualTo(fieldCount)
        }

        @Test
        fun `should refuse to read a tree on another thread than the one that parsed it`() {
            FfmSyntaxTree.parse("class A {}", java).use { tree ->
                // Arrange
                val root = tree.rootNode
                var failure: Throwable? = null

                // Act
                Thread { failure = runCatching { root.type }.exceptionOrNull() }.apply { start() }.join()

                // Assert
                assertThat(failure).isInstanceOf(WrongThreadException::class.java)
            }
        }
    }
}
