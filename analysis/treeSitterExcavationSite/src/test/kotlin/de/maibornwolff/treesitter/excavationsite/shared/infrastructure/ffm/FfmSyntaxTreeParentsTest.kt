package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import de.maibornwolff.treesitter.excavationsite.shared.domain.GrammarLibrary
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test

class FfmSyntaxTreeParentsTest : FfmSyntaxTreeTestBase() {
    private val nestedCode = """
        class A<T extends Comparable<T>> {
            @Deprecated int[] x = {1, 2, 3};
            void f(String s) { if (s.isEmpty()) { g(s -> s + "a"); } }
        }
    """.trimIndent()

    private fun FfmSyntaxTree.parentFoundFromTheRoot(node: SyntaxNode): FfmNode =
        FfmNode(TreeSitterApi.nodeParent(nodeAllocator, (node as FfmNode).segment), this)

    private fun FfmSyntaxTree.hasTheParentFoundFromTheRoot(node: SyntaxNode): Boolean = node.parent == parentFoundFromTheRoot(node)

    private fun parentTypeOfField(grammarName: String, code: String, ownerType: String, field: String): String? {
        val grammar = NativeTreeSitter.grammar(GrammarLibrary(grammarName))
        return FfmSyntaxTree.parse(code, grammar).use { tree ->
            var parentType: String? = null
            tree.walk { node, nodeType -> if (nodeType == ownerType) parentType = node.getChildByFieldName(field).parent.type }
            parentType
        }
    }

    @Test
    fun `should give every visited node the parent tree-sitter finds from the root`() {
        FfmSyntaxTree.parse(nestedCode, java).use { tree ->
            // Arrange
            val comparedTypes = mutableListOf<String>()
            val typesWithAnotherParent = mutableListOf<String>()

            // Act
            tree.walk { node, nodeType ->
                comparedTypes.add(nodeType)
                if (!tree.hasTheParentFoundFromTheRoot(node)) typesWithAnotherParent.add(nodeType)
            }

            // Assert
            assertThat(comparedTypes).isEqualTo(visitedTypes(nestedCode))
            assertThat(typesWithAnotherParent).isEmpty()
        }
    }

    @Test
    fun `should give the ancestors of a visited node up to the null node above the root`() {
        FfmSyntaxTree.parse("class A { int x; }", java).use { tree ->
            // Arrange
            val ancestorsOfTheFieldName = mutableListOf<String>()

            // Act
            tree.walk { node, nodeType ->
                if (nodeType == "identifier" && node.text == "x") {
                    var ancestor = node.parent
                    while (!ancestor.isNull) {
                        ancestorsOfTheFieldName.add(ancestor.type)
                        ancestor = ancestor.parent
                    }
                }
            }

            // Assert
            assertThat(ancestorsOfTheFieldName)
                .containsExactly("variable_declarator", "field_declaration", "class_body", "class_declaration", "program")
        }
    }

    @Test
    fun `should give every child of a node the parent tree-sitter finds from the root`() {
        FfmSyntaxTree.parse(nestedCode, java).use { tree ->
            // Arrange
            val typesOfEveryNodeBelowTheRoot = visitedTypes(nestedCode).drop(1)
            val comparedChildTypes = mutableListOf<String>()
            val typesWithAnotherParent = mutableListOf<String>()

            fun compareParentOf(child: SyntaxNode) {
                if (!tree.hasTheParentFoundFromTheRoot(child)) typesWithAnotherParent.add(child.type)
            }

            // Act
            tree.walk { node, _ ->
                (0 until node.childCount).forEach {
                    comparedChildTypes.add(node.getChild(it).type)
                    compareParentOf(node.getChild(it))
                }
                (0 until node.namedChildCount).forEach { compareParentOf(node.getNamedChild(it)) }
            }

            // Assert
            assertThat(comparedChildTypes).containsExactlyInAnyOrderElementsOf(typesOfEveryNodeBelowTheRoot)
            assertThat(typesWithAnotherParent).isEmpty()
        }
    }

    @Test
    fun `should ask tree-sitter for the parent of a field that a nested node passes up in C++`() {
        // Arrange
        val code = "void g() { (a.b = *c); }"

        // Act
        val parentOfTheLeftOperand = parentTypeOfField("cpp", code, ownerType = "parenthesized_expression", field = "left")

        // Assert
        assertThat(parentOfTheLeftOperand).isEqualTo("assignment_expression")
    }

    @Test
    fun `should ask tree-sitter for the parent of a field that a nested node passes up in TypeScript`() {
        // Arrange
        val code = "let a: -1 = -1;"

        // Act
        val parentOfTheArgument = parentTypeOfField("typescript", code, ownerType = "literal_type", field = "argument")

        // Assert
        assertThat(parentOfTheArgument).isEqualTo("unary_expression")
    }

    @Test
    fun `should give a previous sibling the parent tree-sitter finds from the root`() {
        FfmSyntaxTree.parse(nestedCode, java).use { tree ->
            // Arrange
            var nodesBelowTheRoot = -1
            var firstChildren = 0
            var comparedSiblings = 0
            val typesWithAnotherParent = mutableListOf<String>()

            // Act
            tree.walk { node, _ ->
                nodesBelowTheRoot++
                if (node.childCount > 0) firstChildren++
                val sibling = node.prevSibling
                if (!sibling.isNull) {
                    comparedSiblings++
                    if (!tree.hasTheParentFoundFromTheRoot(sibling)) typesWithAnotherParent.add(sibling.type)
                }
            }

            // Assert
            assertThat(comparedSiblings).isEqualTo(nodesBelowTheRoot - firstChildren)
            assertThat(typesWithAnotherParent).isEmpty()
        }
    }

    @Test
    fun `should throw for the parent of a null node that was reached from a node`() {
        FfmSyntaxTree.parse("class A {}", java).use { tree ->
            // Arrange
            val root = tree.rootNode

            // Act
            val childOutOfRange = root.getChild(root.childCount)

            // Assert
            assertThat(childOutOfRange.isNull).isTrue()
            assertThatThrownBy { childOutOfRange.parent }.isInstanceOf(IllegalStateException::class.java)
        }
    }

    @Test
    fun `should keep the ancestors readable while a deep subtree below them is visited`() {
        // Arrange
        val nestingDepth = 5_000
        val code = "class A { int x = " + "(".repeat(nestingDepth) + "1" + ")".repeat(nestingDepth) + "; }"

        // Act
        val ancestorsOfTheInnermostLiteral = FfmSyntaxTree.parse(code, java).use { tree ->
            var ancestors = 0
            tree.walk { node, nodeType ->
                if (nodeType == "decimal_integer_literal") {
                    var ancestor = node.parent
                    while (!ancestor.isNull) {
                        if (ancestor.type == "parenthesized_expression") ancestors++
                        ancestor = ancestor.parent
                    }
                }
            }
            ancestors
        }

        // Assert
        assertThat(ancestorsOfTheInnermostLiteral).isEqualTo(nestingDepth)
    }
}
