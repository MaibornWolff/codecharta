package de.maibornwolff.treesitter.excavationsite.languages.c

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CGotoLabelExtractionTest {
    @Test
    fun `should extract goto label`() {
        // Arrange
        val code = """
            void process() {
                start:
                    goto cleanup;
                cleanup:
                    return;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("process", "start", "cleanup")
    }

    @Test
    fun `should extract single label in function`() {
        // Arrange
        val code = """
            void retry_operation() {
                retry:
                    int x = 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("retry_operation", "retry", "x")
    }

    @Test
    fun `should extract multiple labels in function`() {
        // Arrange
        val code = """
            int state_machine(int input) {
                state_a:
                    if (input == 0) goto state_b;
                    return 0;
                state_b:
                    if (input == 1) goto state_c;
                    return 1;
                state_c:
                    return 2;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("state_machine", "input", "state_a", "state_b", "state_c")
    }

    @Test
    fun `should extract label at function start`() {
        // Arrange
        val code = """
            void func() {
            entry_point:
                int x = 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("func", "entry_point", "x")
    }

    @Test
    fun `should extract consecutive labels`() {
        // Arrange
        val code = """
            void func() {
            label1:
            label2:
            label3:
                return;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("func", "label1", "label2", "label3")
    }

    @Test
    fun `should extract label with underscore prefix`() {
        // Arrange
        val code = """
            void func() {
            _private_label:
            __internal:
                return;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("func", "_private_label", "__internal")
    }

    @Test
    fun `should extract label in switch case fallthrough`() {
        // Arrange
        val code = """
            void handle(int x) {
                switch(x) {
                    case 1:
                    case 2:
                    common_handling:
                        process();
                        break;
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("handle", "x", "common_handling")
    }
}
