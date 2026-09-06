package de.maibornwolff.treesitter.excavationsite.languages.javascript

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.extractIdentifiersFromMethodDefinition
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeSitterParser
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatCode
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.treesitter.TreeSitterJavascript

class MethodDefinitionExtractorTest {
    @Nested
    inner class NullSiblingRobustness {
        @Test
        fun `should not throw when the node has no previous sibling`() {
            // Arrange - a node that is the first child of its parent has a null-node sentinel as its
            // prevSibling. The decorator look-behind walk previously called `.type` on that null node,
            // throwing `TSException: Node is a null node`.
            val code = "class A { foo() {} }"
            val root = TreeSitterParser.parse(code, TreeSitterJavascript())
            val firstChild = root.getChild(0) // class_declaration, index 0 of program -> prevSibling is null

            // Act / Assert
            assertThatCode { extractIdentifiersFromMethodDefinition(firstChild, code) }
                .doesNotThrowAnyException()
        }
    }

    @Nested
    inner class DecoratedClassExtraction {
        @Test
        fun `should extract decorated class method names without throwing`() {
            // Arrange
            val code = "class A { @a @b foo() {} bar() {} }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactlyInAnyOrder("A", "foo", "bar")
        }
    }
}
