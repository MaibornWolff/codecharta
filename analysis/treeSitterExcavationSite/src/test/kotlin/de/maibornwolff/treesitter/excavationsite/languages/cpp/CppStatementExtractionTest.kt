package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CppStatementExtractionTest {
    @Test
    fun `should extract range-based for variable`() {
        // Arrange
        val code = """
            void foo() {
                for (const auto& item : container) { }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("foo", "item")
    }

    @Test
    fun `should extract range-based for variable with auto`() {
        // Arrange
        val code = """
            void process(std::vector<int> items) {
                for (auto val : items) {
                    use(val);
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("process", "items", "val")
    }

    @Test
    fun `should extract range-based for with pointer`() {
        // Arrange
        val code = "for (auto* ptr : pointers) { }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("ptr")
    }

    @Test
    fun `should extract catch clause variable`() {
        // Arrange
        val code = """
            try { }
            catch (const std::exception& e) { }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("e")
    }

    @Test
    fun `should extract multiple catch clause variables`() {
        // Arrange
        val code = """
            try {
                riskyOperation();
            } catch (const std::runtime_error& runtime) {
                handle(runtime);
            } catch (const std::exception& ex) {
                handle(ex);
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("runtime", "ex")
    }

    @Test
    fun `should extract catch clause with pointer parameter`() {
        // Arrange
        val code = """
            try { }
            catch (Exception* exc) { }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("exc")
    }

    @Test
    fun `should extract structured binding variables`() {
        // Arrange
        val code = "auto [x, y, z] = getPoint();"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("x", "y", "z")
    }

    @Test
    fun `should extract structured binding with const ref`() {
        // Arrange
        val code = "const auto& [name, age] = person;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("name", "age")
    }

    @Test
    fun `should extract structured binding from pair`() {
        // Arrange
        val code = """
            auto [first, second] = std::make_pair(1, 2);
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("first", "second")
    }

    @Test
    fun `should extract structured binding in for loop`() {
        // Arrange
        val code = """
            for (auto [key, value] : map) {
                process(key, value);
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("key", "value")
    }

    @Test
    fun `should extract range-based for with explicit type`() {
        // Arrange
        val code = """
            void process() {
                for (int num : numbers) { }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("process", "num")
    }

    @Test
    fun `should extract nested range-based for loops`() {
        // Arrange
        val code = """
            void process() {
                for (auto& row : matrix) {
                    for (auto& cell : row) { }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("process", "row", "cell")
    }

    @Test
    fun `should extract range-based for with rvalue reference`() {
        // Arrange
        val code = """
            void process() {
                for (auto&& item : getItems()) { }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("process", "item")
    }

    @Test
    fun `should handle catch-all without parameter name`() {
        // Arrange
        val code = """
            try { }
            catch (...) { }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).isEmpty()
    }

    @Test
    fun `should extract from nested try-catch`() {
        // Arrange
        val code = """
            try {
                try { }
                catch (InnerException& inner) { }
            }
            catch (OuterException& outer) { }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("inner", "outer")
    }

    @Test
    fun `should extract catch with const value`() {
        // Arrange
        val code = """
            try { }
            catch (const MyException err) { }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("err")
    }

    @Test
    fun `should extract structured binding inside function`() {
        // Arrange
        val code = """
            void process() {
                auto [a, b] = getPair();
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("process", "a", "b")
    }

    @Test
    fun `should extract structured binding with many variables`() {
        // Arrange
        val code = "auto [a, b, c, d, e] = getTuple();"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("a", "b", "c", "d", "e")
    }

    @Test
    fun `should extract structured binding in if statement`() {
        // Arrange
        val code = """
            void check() {
                if (auto [success, value] = tryGet(); success) { }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("check", "success", "value")
    }

    @Test
    fun `should extract structured binding with volatile qualifier`() {
        // Arrange
        val code = "volatile auto [x, y] = getData();"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("x", "y")
    }
}
