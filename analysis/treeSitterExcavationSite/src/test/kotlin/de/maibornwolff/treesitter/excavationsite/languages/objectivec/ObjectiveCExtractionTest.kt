package de.maibornwolff.treesitter.excavationsite.languages.objectivec

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ObjectiveCExtractionTest {
    @Test
    fun `should correctly categorize extracted items by context`() {
        // Arrange
        val code = """
            // Process the order
            @interface Order : NSObject
            @property NSString *orderId;
            - (void)process;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Order", "orderId", "process")
        assertThat(result.comments).containsExactly("Process the order")
    }

    @Test
    fun `should provide access via extractedTexts list`() {
        // Arrange
        val code = """
            // Comment
            @interface Foo : NSObject
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        val contexts = result.extractedTexts.map { it.context }
        assertThat(contexts).containsExactly(ExtractionContext.COMMENT, ExtractionContext.IDENTIFIER)
    }

    @Test
    fun `should extract from complete class`() {
        // Arrange
        val code = """
            @interface Customer : NSObject
            @property (nonatomic, strong) NSString *name;
            @property (nonatomic, assign) int age;
            - (void)save;
            - (void)updateName:(NSString *)newName;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Customer", "name", "age", "save", "updateName", "newName")
    }

    @Test
    fun `should report extraction is supported for ObjectiveC`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.OBJECTIVE_C)).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".m")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".mm")).isTrue()
    }

    @Test
    fun `should return ObjectiveC in supported languages`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.OBJECTIVE_C)).isTrue()
    }

    @Test
    fun `should return m and mm in supported extensions`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(".m")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".mm")).isTrue()
    }
}
