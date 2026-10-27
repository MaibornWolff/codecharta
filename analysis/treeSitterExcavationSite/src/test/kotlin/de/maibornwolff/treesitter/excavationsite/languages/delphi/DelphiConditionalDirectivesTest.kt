package de.maibornwolff.treesitter.excavationsite.languages.delphi

import de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors.ConditionalDirectives
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class DelphiConditionalDirectivesTest {
    @Test
    fun `should blank conditional directives in either notation and keep their newlines and the code of both branches`() {
        // Arrange
        val code = "{\$ifdef WIN}\nA;\n{\$ELSE}\nB;\n(*\$ENDIF\n*)"

        // Act
        val blanked = ConditionalDirectives.blank(code)

        // Assert
        assertThat(blanked).isEqualTo("            \nA;\n       \nB;\n        \n  ")
    }

    @Test
    fun `should keep directives that are no condition`() {
        // Arrange
        val code = "{\$I Rules.inc}\n{\$R *.res}\n{\$IFDEFINED is no directive}"

        // Act
        val blanked = ConditionalDirectives.blank(code)

        // Assert
        assertThat(blanked).isEqualTo(code)
    }
}
