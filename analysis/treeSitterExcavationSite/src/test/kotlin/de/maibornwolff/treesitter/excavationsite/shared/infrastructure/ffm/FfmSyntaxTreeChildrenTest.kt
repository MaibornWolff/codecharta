package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import de.maibornwolff.treesitter.excavationsite.shared.domain.GrammarLibrary
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class FfmSyntaxTreeChildrenTest : FfmSyntaxTreeTestBase() {
    @Nested
    inner class NamedChildrenAndSiblings {
        @Test
        fun `should count and return only the named children`() {
            FfmSyntaxTree.parse("class A { int x; }", java).use { tree ->
                // Arrange
                val classBody = tree.rootNode.getChild(0).getChildByFieldName("body")

                // Act
                val onlyNamedChild = classBody.getNamedChild(0)

                // Assert
                assertThat(classBody.childCount).isEqualTo(3)
                assertThat(classBody.namedChildCount).isEqualTo(1)
                assertThat(onlyNamedChild.type).isEqualTo("field_declaration")
            }
        }

        @Test
        fun `should return a null node for a named child index out of range`() {
            FfmSyntaxTree.parse("class A { int x; }", java).use { tree ->
                // Arrange
                val classBody = tree.rootNode.getChild(0).getChildByFieldName("body")

                // Act
                val missingChild = classBody.getNamedChild(classBody.namedChildCount)

                // Assert
                assertThat(missingChild.isNull).isTrue()
            }
        }

        @Test
        fun `should return the previous sibling and a null node before the first child`() {
            FfmSyntaxTree.parse("class A { int x; }", java).use { tree ->
                // Arrange
                val classBody = tree.rootNode.getChild(0).getChildByFieldName("body")
                val field = classBody.getChild(1)

                // Act
                val openingBrace = field.prevSibling

                // Assert
                assertThat(openingBrace.type).isEqualTo("{")
                assertThat(openingBrace.prevSibling.isNull).isTrue()
            }
        }
    }

    @Nested
    inner class Children {
        private val codeByGrammar = mapOf(
            "java" to "class A<T> { int[] x = {1, 2, 3}; void f(String s) { g(s -> s + \"a\"); } int y = ; int a, b, c, d, e; }",
            "cpp" to "void g() { (a.b = *c); std::vector<int> v; }",
            "typescript" to "let a: -1 = -1; export const f = (x: A<B>) => x?.y ?? [1, 2];"
        )

        private fun typesOfNodesWhere(isWrong: FfmSyntaxTree.(SyntaxNode) -> Boolean): List<String> =
            codeByGrammar.flatMap { (grammarName, code) ->
                FfmSyntaxTree.parse(code, NativeTreeSitter.grammar(GrammarLibrary(grammarName))).use { tree ->
                    tree.readReleasingReachedNodes { root -> withAllDescendants(root).filter { tree.isWrong(it) }.map { it.type } }
                }
            }

        private fun withAllDescendants(node: SyntaxNode): List<SyntaxNode> =
            listOf(node) + node.children().flatMap { withAllDescendants(it) }

        private fun childrenByIndex(node: SyntaxNode): List<SyntaxNode> = (0 until node.childCount).map { node.getChild(it) }

        private fun namedChildrenByIndex(node: SyntaxNode): List<SyntaxNode> = (0 until node.namedChildCount).map { node.getNamedChild(it) }

        private fun FfmSyntaxTree.parentFoundFromTheRoot(node: SyntaxNode): FfmNode =
            FfmNode(TreeSitterApi.nodeParent(nodeAllocator, (node as FfmNode).segment), this)

        @Test
        fun `should hand out the children tree-sitter finds by index`() {
            // Arrange: every node of codeByGrammar

            // Act
            val nodesWithOtherChildren = typesOfNodesWhere { node -> node.children().toList() != childrenByIndex(node) }

            // Assert
            assertThat(nodesWithOtherChildren).isEmpty()
        }

        @Test
        fun `should hand out the named children tree-sitter finds by index`() {
            // Arrange: every node of codeByGrammar

            // Act
            val nodesWithOtherNamedChildren = typesOfNodesWhere { node -> node.namedChildren().toList() != namedChildrenByIndex(node) }

            // Assert
            assertThat(nodesWithOtherNamedChildren).isEmpty()
        }

        @Test
        fun `should give a child the parent tree-sitter finds from the root`() {
            // Arrange: every node of codeByGrammar

            // Act
            val nodesWithAChildOfAnotherParent = typesOfNodesWhere { node ->
                (node.children() + node.namedChildren()).any { child -> child.parent != parentFoundFromTheRoot(child) }
            }

            // Assert
            assertThat(nodesWithAChildOfAnotherParent).isEmpty()
        }

        @Test
        fun `should hand out all children and the named ones among them`() {
            FfmSyntaxTree.parse("class A { int a, b; int c, d, e, f, g; }", java).use { tree ->
                // Arrange
                val classBody = tree.rootNode.getChild(0).getChildByFieldName("body")
                val fewDeclarators = classBody.getNamedChild(0)
                val manyDeclarators = classBody.getNamedChild(1)

                // Act
                val textsOfFew = fewDeclarators.children().map { it.text }.toList()
                val textsOfMany = manyDeclarators.children().map { it.text }.toList()
                val namedTextsOfMany = manyDeclarators.namedChildren().map { it.text }.toList()

                // Assert
                assertThat(textsOfFew).containsExactly("int", "a", ",", "b", ";")
                assertThat(textsOfMany).containsExactly("int", "c", ",", "d", ",", "e", ",", "f", ",", "g", ";")
                assertThat(namedTextsOfMany).containsExactly("int", "c", "d", "e", "f", "g")
            }
        }

        @Test
        fun `should hand out no child for a node without children`() {
            FfmSyntaxTree.parse("class A {}", java).use { tree ->
                // Arrange
                val className = tree.rootNode.getChild(0).getChildByFieldName("name")

                // Act
                val children = className.children().toList()
                val namedChildren = className.namedChildren().toList()

                // Assert
                assertThat(children).isEmpty()
                assertThat(namedChildren).isEmpty()
            }
        }

        @Test
        fun `should hand out the same children every time they are asked for`() {
            FfmSyntaxTree.parse("class A { int x; }", java).use { tree ->
                // Arrange
                val children = tree.rootNode.getChild(0).children()

                // Act
                val typesOfFirstPass = children.map { it.type }.toList()
                val typesOfSecondPass = children.map { it.type }.toList()

                // Assert
                assertThat(typesOfFirstPass).containsExactly("class", "identifier", "class_body")
                assertThat(typesOfSecondPass).isEqualTo(typesOfFirstPass)
            }
        }

        @Test
        fun `should keep handing out siblings after a caller went through the children of one`() {
            FfmSyntaxTree.parse("class A { int x; int y; }", java).use { tree ->
                // Arrange
                val classBody = tree.rootNode.getChild(0).getChildByFieldName("body")

                // Act
                val grandchildCounts = classBody.children().map { child -> child.children().count() }.toList()

                // Assert
                assertThat(grandchildCounts).containsExactly(0, 3, 3, 0)
            }
        }

        @Test
        fun `should throw instead of crashing when the children of a null node are read`() {
            FfmSyntaxTree.parse("class A {}", java).use { tree ->
                // Arrange
                val nullNode = tree.rootNode.parent

                // Act & Assert
                assertThatThrownBy { nullNode.children().toList() }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.namedChildren().toList() }.isInstanceOf(IllegalStateException::class.java)
            }
        }

        @Test
        fun `should hand out every named child of a node with more children than a block of nodes holds`() {
            // Arrange
            val fieldCount = 50_000
            val code = "class A {\n" + "int x;\n".repeat(fieldCount) + "}"

            // Act
            val fieldsOfClassBody = FfmSyntaxTree.parse(code, java).use { tree ->
                tree.rootNode
                    .getChild(0)
                    .getChildByFieldName("body")
                    .namedChildren()
                    .count { it.type == "field_declaration" }
            }

            // Assert
            assertThat(fieldsOfClassBody).isEqualTo(fieldCount)
        }
    }
}
