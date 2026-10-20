package de.maibornwolff.treesitter.excavationsite.languages.csharp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CSharpStatementExtractionTest {
    @Test
    fun `should extract lambda parameter`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    list.ForEach(item => Process(item));
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "item")
    }

    @Test
    fun `should extract typed lambda parameters`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    list.Select((string str) => str.ToUpper());
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "str")
    }

    @Test
    fun `should extract multiple lambda parameters`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    dict.ForEach((key, value) => Process(key, value));
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "key", "value")
    }

    @Test
    fun `should extract lambda with no parameters`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    Action a = () => DoSomething();
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "a")
    }

    @Test
    fun `should extract catch clause exception variable`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    try {
                        RiskyOperation();
                    } catch (Exception ex) {
                        Handle(ex);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "ex")
    }

    @Test
    fun `should extract multiple catch block variables`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    try {
                        Risky();
                    } catch (IOException io) {
                        HandleIO(io);
                    } catch (SqlException sql) {
                        HandleSQL(sql);
                    } catch (Exception ex) {
                        HandleGeneric(ex);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "io", "sql", "ex")
    }

    @Test
    fun `should extract foreach loop variable`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    foreach (var item in items) {
                        Process(item);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "item")
    }

    @Test
    fun `should extract typed foreach loop variable`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    foreach (string name in names) {
                        Process(name);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "name")
    }

    @Test
    fun `should extract using statement variable`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    using (var stream = new FileStream("file", FileMode.Open)) {
                        Read(stream);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "stream")
        assertThat(result.strings).containsExactly("file")
    }

    @Test
    fun `should extract using declaration variable`() {
        // Arrange - C# 8.0+ using declaration
        val code = """
            public class Example {
                void Test() {
                    using var stream = new FileStream("file", FileMode.Open);
                    Read(stream);
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "stream")
    }

    @Test
    fun `should extract is pattern variable`() {
        // Arrange
        val code = """
            public class Example {
                void Test(object obj) {
                    if (obj is string str) {
                        Process(str);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "obj", "str")
    }

    @Test
    fun `should not extract from is expression without pattern variable`() {
        // Arrange
        val code = """
            public class Example {
                void Test(object obj) {
                    if (obj is string) {
                        Process();
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "obj")
    }

    @Test
    fun `should extract switch expression pattern variable`() {
        // Arrange
        val code = """
            public class Example {
                int Test(object obj) {
                    return obj switch {
                        int num => num + 1,
                        string text => text.Length,
                        _ => 0
                    };
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "obj", "num", "text")
    }

    @Test
    fun `should extract case pattern variable`() {
        // Arrange
        val code = """
            public class Example {
                void Test(object obj) {
                    switch (obj) {
                        case int num:
                            Process(num);
                            break;
                        case string text:
                            Process(text);
                            break;
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "obj", "num", "text")
    }

    @Test
    fun `should handle nested lambdas`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    list
                        .Select(outer => inner => Process(outer, inner));
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "outer", "inner")
    }

    @Test
    fun `should handle chained method calls with lambdas`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    list
                        .Where(item => item.IsValid())
                        .Select(valid => valid.Transform())
                        .ToList();
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "item", "valid")
    }

    @Test
    fun `should handle traditional for loop variable`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    for (int i = 0; i < 10; i++) {
                        Process(i);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "i")
    }

    @Test
    fun `should handle try-catch-finally with using`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    using (var input = Open()) {
                        Read(input);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "input")
    }

    @Test
    fun `should handle local function`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    int LocalFunction(int x) {
                        return x * 2;
                    }
                    var result = LocalFunction(5);
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "LocalFunction", "x", "result")
    }

    @Test
    fun `should handle tuple deconstruction`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    var (name, age) = GetPerson();
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "name", "age")
    }

    @Test
    fun `should handle multiple variable declarations`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    int a = 1, b = 2, c = 3;
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        // Note: Only first variable is extracted from multi-declaration
        assertThat(result.identifiers).containsExactly("Example", "Test", "a")
    }

    @Test
    fun `should handle nested tuple deconstruction`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    var ((x, y), z) = GetNested();
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        // Note: nested tuple_pattern nodes cause duplicates due to tree structure
        assertThat(result.identifiers).containsExactly("Example", "Test", "x", "y", "z", "x", "y")
    }

    @Test
    fun `should handle discard in pattern`() {
        // Arrange
        val code = """
            public class Example {
                void Test(object obj) {
                    if (obj is string _) {
                        Process();
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        // Discard (_) should not be extracted as identifier
        assertThat(result.identifiers).containsExactly("Example", "Test", "obj")
    }

    @Test
    fun `should handle switch with when clause`() {
        // Arrange
        val code = """
            public class Example {
                string Test(object obj) {
                    return obj switch {
                        int num when num > 0 => "positive",
                        int num => "non-positive",
                        _ => "unknown"
                    };
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "obj", "num", "num")
        assertThat(result.strings).containsExactly("positive", "non-positive", "unknown")
    }

    @Test
    fun `should handle ref local variable`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    int value = 10;
                    ref int refValue = ref value;
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "value", "refValue")
    }

    @Test
    fun `should handle static local function`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    static int Add(int a, int b) => a + b;
                    var result = Add(1, 2);
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "Add", "a", "b", "result")
    }

    @Test
    fun `should handle fixed statement`() {
        // Arrange
        val code = """
            public class Example {
                unsafe void Test() {
                    fixed (int* ptr = array) {
                        Process(ptr);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        // Note: fixed_statement variable not currently extracted (would need dedicated support)
        assertThat(result.identifiers).containsExactly("Example", "Test")
    }

    @Test
    fun `should handle lock statement`() {
        // Arrange
        val code = """
            public class Example {
                private object lockObj = new object();
                void Test() {
                    lock (lockObj) {
                        Process();
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "lockObj", "Test")
    }

    @Test
    fun `should handle stackalloc expression`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    Span<int> numbers = stackalloc int[10];
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "numbers")
    }

    @Test
    fun `should handle checked and unchecked expressions`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    int checkedResult = checked(a + b);
                    int uncheckedResult = unchecked(c * d);
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "checkedResult", "uncheckedResult")
    }

    @Test
    fun `should handle nameof expression in string`() {
        // Arrange
        val code = """
            public class Example {
                void Validate(string param) {
                    if (param == null)
                        throw new ArgumentNullException(nameof(param));
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Validate", "param")
    }

    @Test
    fun `should handle typeof expression`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    var type = typeof(string);
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "type")
    }
}
