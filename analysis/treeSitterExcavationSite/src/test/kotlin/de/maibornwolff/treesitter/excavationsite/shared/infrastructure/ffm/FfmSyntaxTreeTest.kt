package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import de.maibornwolff.treesitter.excavationsite.shared.domain.GrammarLibrary
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class FfmSyntaxTreeTest {
    private val java = NativeTreeSitter.grammar(GrammarLibrary("java"))

    private fun visitedTypes(code: String): List<String> = FfmSyntaxTree.parse(code, java).use { tree ->
        val types = mutableListOf<String>()
        tree.walk { _, nodeType -> types.add(nodeType) }
        types
    }

    @Nested
    inner class ReadReleasingReachedNodes {
        private val code = "class A { int x; int y; }"

        private fun typesOfAllDescendants(node: SyntaxNode): List<String> =
            (0 until node.childCount).map { node.getChild(it) }.flatMap { listOf(it.type) + typesOfAllDescendants(it) }

        @Test
        fun `should return what was read from the root`() {
            FfmSyntaxTree.parse(code, java).use { tree ->
                // Act
                val types = tree.readReleasingReachedNodes { root -> typesOfAllDescendants(root) }

                // Assert
                assertThat(types).isEqualTo(visitedTypes(code).drop(1))
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
                assertThat(typesOfSecondRead).isEqualTo(visitedTypes(code).drop(1))
            }
        }
    }

    @Nested
    inner class Walk {
        @Test
        fun `should visit every node in pre-order`() {
            // Arrange
            val code = "class A { int x; }"

            // Act
            val types = visitedTypes(code)

            // Assert
            assertThat(types).containsExactly(
                "program",
                "class_declaration",
                "class",
                "identifier",
                "class_body",
                "{",
                "field_declaration",
                "integral_type",
                "int",
                "variable_declarator",
                "identifier",
                ";",
                "}"
            )
        }

        @Test
        fun `should visit only the root for empty source`() {
            // Act
            val types = visitedTypes("")

            // Assert
            assertThat(types).containsExactly("program")
        }

        @Test
        fun `should name error nodes of code that does not parse`() {
            // Arrange
            val unparsableCode = "class { ) ] ?? @@ int"

            // Act
            val types = visitedTypes(unparsableCode)

            // Assert
            assertThat("ERROR" in types).isTrue()
        }

        @Test
        fun `should walk deeply nested code without overflowing the stack`() {
            // Arrange
            val nestingDepth = 20_000
            val code = "class A { int x = " + "(".repeat(nestingDepth) + "1" + ")".repeat(nestingDepth) + "; }"

            // Act
            val types = visitedTypes(code)

            // Assert
            assertThat(types.count { it == "parenthesized_expression" }).isEqualTo(nestingDepth)
        }

        @Test
        fun `should walk a file with a hundred thousand lines`() {
            // Arrange
            val lineCount = 100_000
            val code = "class A {\n" + "int x;\n".repeat(lineCount) + "}"

            // Act
            val types = visitedTypes(code)

            // Assert
            assertThat(types.count { it == "field_declaration" }).isEqualTo(lineCount)
        }
    }

    @Nested
    inner class Nodes {
        @Test
        fun `should report zero-based rows and columns`() {
            FfmSyntaxTree.parse("class A {\n  int x;\n}", java).use { tree ->
                // Arrange
                val classBody = tree.rootNode.getChild(0).getChildByFieldName("body")

                // Act
                val field = classBody.getChild(1)

                // Assert
                assertThat(field.type).isEqualTo("field_declaration")
                assertThat(listOf(field.startRow, field.startColumn, field.endRow, field.endColumn)).containsExactly(1, 2, 1, 8)
            }
        }

        @Test
        fun `should count columns in UTF-8 bytes`() {
            FfmSyntaxTree.parse("class A { String ä = \"😀\"; int x; }", java).use { tree ->
                // Arrange
                val classBody = tree.rootNode.getChild(0).getChildByFieldName("body")

                // Act
                val fieldAfterNonAsciiText = classBody.getChild(2)

                // Assert
                assertThat(fieldAfterNonAsciiText.type).isEqualTo("field_declaration")
                assertThat(fieldAfterNonAsciiText.startColumn).isEqualTo(30)
            }
        }

        @Test
        fun `should return a null node for a field the node does not have`() {
            FfmSyntaxTree.parse("class A {}", java).use { tree ->
                // Act
                val missingChild = tree.rootNode.getChild(0).getChildByFieldName("no_such_field")

                // Assert
                assertThat(missingChild.isNull).isTrue()
            }
        }

        @Test
        fun `should return a null node for a child index out of range`() {
            FfmSyntaxTree.parse("class A {}", java).use { tree ->
                // Arrange
                val root = tree.rootNode

                // Act
                val missingChild = root.getChild(root.childCount)

                // Assert
                assertThat(missingChild.isNull).isTrue()
            }
        }

        @Test
        fun `should return a null node as the parent of the root`() {
            FfmSyntaxTree.parse("class A {}", java).use { tree ->
                // Act
                val parentOfRoot = tree.rootNode.parent

                // Assert
                assertThat(parentOfRoot.isNull).isTrue()
            }
        }

        @Test
        fun `should throw instead of crashing when a null node is read`() {
            FfmSyntaxTree.parse("class A {}", java).use { tree ->
                // Arrange
                val nullNode = tree.rootNode.parent

                // Act & Assert
                assertThatThrownBy { nullNode.type }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.childCount }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.startRow }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.parent }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.getChild(0) }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.getChildByFieldName("name") }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.namedChildCount }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.getNamedChild(0) }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.startByte }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.endByte }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.text }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.prevSibling }.isInstanceOf(IllegalStateException::class.java)
            }
        }

        @Test
        fun `should return the parent of a child`() {
            FfmSyntaxTree.parse("class A {}", java).use { tree ->
                // Arrange
                val classDeclaration = tree.rootNode.getChild(0)

                // Act
                val parent = classDeclaration.getChildByFieldName("name").parent

                // Assert
                assertThat(parent.isNull).isFalse()
                assertThat(parent.type).isEqualTo("class_declaration")
                assertThat(parent.childCount).isEqualTo(classDeclaration.childCount)
            }
        }
    }

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
    inner class ChildrenInOnePass {
        private val codeByGrammar = mapOf(
            "java" to "class A<T> { @Deprecated int[] x = {1, 2, 3}; void f(String s) { g(s -> s + \"a\"); } int y = ; }",
            "cpp" to "void g() { (a.b = *c); std::vector<int> v; }",
            "typescript" to "let a: -1 = -1; export const f = (x: A<B>) => x?.y ?? [1, 2];"
        )

        private fun mismatchesInEveryNode(mismatchOf: FfmSyntaxTree.(SyntaxNode) -> String?): List<String> =
            codeByGrammar.flatMap { (grammarName, code) ->
                FfmSyntaxTree.parse(code, NativeTreeSitter.grammar(GrammarLibrary(grammarName))).use { tree ->
                    tree.readReleasingReachedNodes { root -> tree.mismatchesBelow(root, mismatchOf) }
                }
            }

        private fun FfmSyntaxTree.mismatchesBelow(node: SyntaxNode, mismatchOf: FfmSyntaxTree.(SyntaxNode) -> String?): List<String> =
            listOfNotNull(mismatchOf(node)) + node.children().flatMap { mismatchesBelow(it, mismatchOf) }

        @Test
        fun `should hand out the children tree-sitter finds by index`() {
            // Act
            val nodesWithOtherChildren = mismatchesInEveryNode { node ->
                val childrenByIndex = (0 until node.childCount).map { node.getChild(it) }
                node.type.takeIf { node.children().toList() != childrenByIndex }
            }

            // Assert
            assertThat(nodesWithOtherChildren).isEmpty()
        }

        @Test
        fun `should hand out the named children tree-sitter finds by index`() {
            // Act
            val nodesWithOtherNamedChildren = mismatchesInEveryNode { node ->
                val namedChildrenByIndex = (0 until node.namedChildCount).map { node.getNamedChild(it) }
                node.type.takeIf { node.namedChildren().toList() != namedChildrenByIndex }
            }

            // Assert
            assertThat(nodesWithOtherNamedChildren).isEmpty()
        }

        @Test
        fun `should give a child the parent tree-sitter finds from the root`() {
            // Act
            val nodesWithAnotherParent = mismatchesInEveryNode { node ->
                val childrenWithAnotherParent = (node.children() + node.namedChildren()).filter { child ->
                    child.parent != FfmNode(TreeSitterApi.nodeParent(nodeAllocator, (child as FfmNode).segment), this)
                }
                node.type.takeIf { childrenWithAnotherParent.any() }
            }

            // Assert
            assertThat(nodesWithAnotherParent).isEmpty()
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
        fun `should reach every child of a node with more children than a block of nodes holds`() {
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

    @Nested
    inner class RememberedParents {
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

    @Nested
    inner class Equality {
        @Test
        fun `should treat two views of the same node as equal`() {
            FfmSyntaxTree.parse("class A { int x; }", java).use { tree ->
                // Arrange
                val classDeclaration = tree.rootNode.getChild(0)

                // Act
                val sameNodeReachedTwice = classDeclaration.getChildByFieldName("name").parent

                // Assert
                assertThat(sameNodeReachedTwice).isEqualTo(classDeclaration)
                assertThat(sameNodeReachedTwice.hashCode()).isEqualTo(classDeclaration.hashCode())
            }
        }

        @Test
        fun `should tell different nodes apart`() {
            FfmSyntaxTree.parse("class A { int x; }", java).use { tree ->
                // Arrange
                val classDeclaration = tree.rootNode.getChild(0)

                // Act
                val name = classDeclaration.getChildByFieldName("name")

                // Assert
                assertThat(name).isNotEqualTo(classDeclaration)
                assertThat(name).isNotEqualTo("A")
            }
        }

        @Test
        fun `should tell the same position in two trees apart`() {
            // Arrange
            val code = "class A { int x; }"

            FfmSyntaxTree.parse(code, java).use { firstTree ->
                FfmSyntaxTree.parse(code, java).use { secondTree ->
                    // Act
                    val rootsAreEqual = firstTree.rootNode == secondTree.rootNode

                    // Assert
                    assertThat(rootsAreEqual).isFalse()
                }
            }
        }
    }

    @Nested
    inner class Text {
        private fun textsOfType(code: String, wantedType: String): List<String> = FfmSyntaxTree.parse(code, java).use { tree ->
            val texts = mutableListOf<String>()
            tree.walk { node, nodeType -> if (nodeType == wantedType) texts.add(node.text) }
            texts
        }

        @Test
        fun `should report the offsets of a node in UTF-8 bytes`() {
            // Arrange
            val twoByteCharacter = "ä"
            val code = "/*$twoByteCharacter*/class A { int x; }"

            FfmSyntaxTree.parse(code, java).use { tree ->
                // Act
                val name = tree.rootNode.getChild(1).getChildByFieldName("name")

                // Assert
                assertThat(name.text).isEqualTo("A")
                assertThat(listOf(name.startByte, name.endByte)).containsExactly(12, 13)
            }
        }

        @Test
        fun `should return non-ASCII text and the text after it unshifted`() {
            // Arrange
            val code = "class Größe { String 名前 = \"😀 ä\"; int after; }"

            // Act
            val identifiers = textsOfType(code, "identifier")
            val strings = textsOfType(code, "string_literal")

            // Assert
            assertThat(identifiers).containsExactly("Größe", "名前", "after")
            assertThat(strings).containsExactly("\"😀 ä\"")
        }

        @Test
        fun `should return the text of a node that ends with the file`() {
            // Arrange
            val code = "class A {} // schließt"

            // Act
            val comments = textsOfType(code, "line_comment")

            // Assert
            assertThat(comments).containsExactly("// schließt")
        }

        @Test
        fun `should return the whole source as the text of the root`() {
            // Arrange
            val code = "class A { String s = \"ä\"; }"

            // Act
            val rootText = FfmSyntaxTree.parse(code, java).use { tree -> tree.rootNode.text }

            // Assert
            assertThat(rootText).isEqualTo(code)
        }

        @Test
        fun `should return an empty text for a missing node`() {
            // Arrange
            val codeMissingASemicolon = "class A { int x }"

            // Act
            val textsOfEmptyNodes = FfmSyntaxTree.parse(codeMissingASemicolon, java).use { tree ->
                val texts = mutableListOf<String>()
                tree.walk { node, _ -> if (node.startByte == node.endByte) texts.add(node.text) }
                texts
            }

            // Assert
            assertThat(textsOfEmptyNodes).containsExactly("")
        }

        @Test
        fun `should not shift the text after a byte order mark`() {
            // Arrange
            val byteOrderMark = "\uFEFF"
            val code = byteOrderMark + "class A { int x; }"

            // Act
            val identifiers = textsOfType(code, "identifier")

            // Assert
            assertThat(identifiers).containsExactly("A", "x")
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

    @Nested
    inner class Encoding {
        @Test
        fun `should parse source with a lone surrogate as if it were a question mark`() {
            // Arrange
            val loneSurrogate = '\uD83D'
            val code = "class A { String s = \"$loneSurrogate\"; int x; }"

            // Act
            val types = visitedTypes(code)

            // Assert
            assertThat(types).isEqualTo(visitedTypes(code.replace(loneSurrogate, '?')))
        }

        @Test
        fun `should parse a form feed as the whitespace it is`() {
            // Arrange
            val formFeed = '\u000C'
            val code = "class A { int x;$formFeed int y; }"

            // Act
            val types = visitedTypes(code)

            // Assert
            assertThat(types).isEqualTo(visitedTypes(code.replace(formFeed, ' ')))
        }

        @Test
        fun `should parse source that contains a NUL character up to its end`() {
            // Arrange
            val code = "class A { String s = \"\u0000\"; int x; }"

            // Act
            val types = visitedTypes(code)

            // Assert
            assertThat(types.count { it == "field_declaration" }).isEqualTo(2)
        }
    }
}
