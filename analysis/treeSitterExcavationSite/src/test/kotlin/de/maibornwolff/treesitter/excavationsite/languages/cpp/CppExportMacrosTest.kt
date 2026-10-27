package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.syntax.CppExportMacros
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource

class CppExportMacrosTest {
    @ParameterizedTest(name = "should blank the export macros of `{0}`")
    @CsvSource(
        delimiter = '|',
        value = [
            "class LIB_EXPORT Widget { int size; };|class            Widget { int size; };",
            "struct API Centaur final : Creature {};|struct     Centaur final : Creature {};",
            "class A_EXPORT B_DEPRECATED Box : Base {};|class                       Box : Base {};",
            "union LIB_EXPORT Value\\n{ int x; };|union            Value\\n{ int x; };"
        ]
    )
    fun `should blank the export macros between the class keyword and the name of a class with a body`(code: String, expected: String) {
        // Act
        val blanked = CppExportMacros.blank(code.replace("\\n", "\n"))

        // Assert
        assertThat(blanked).isEqualTo(expected.replace("\\n", "\n"))
    }

    @ParameterizedTest(name = "should keep `{0}`")
    @CsvSource(
        delimiter = '|',
        value = [
            "class Widget { int size; };",
            "class Widget final : Base {};",
            "struct timeval tv{};",
            "class LIB_EXPORT Widget;",
            "struct Point make() { return {}; }"
        ]
    )
    fun `should keep code without an export macro unchanged`(code: String) {
        // Act
        val blanked = CppExportMacros.blank(code)

        // Assert
        assertThat(blanked).isEqualTo(code)
    }
}
