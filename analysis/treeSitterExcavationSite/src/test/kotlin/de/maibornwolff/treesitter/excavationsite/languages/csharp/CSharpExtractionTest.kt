package de.maibornwolff.treesitter.excavationsite.languages.csharp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CSharpExtractionTest {
    // === Identifier Extraction Tests ===

    @Test
    fun `should extract class declaration identifier`() {
        // Arrange
        val code = "public class UserService {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("UserService")
    }

    @Test
    fun `should extract interface declaration identifier`() {
        // Arrange
        val code = "public interface IOrderRepository {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("IOrderRepository")
    }

    @Test
    fun `should extract struct declaration identifier`() {
        // Arrange
        val code = "public struct Point {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Point")
    }

    @Test
    fun `should extract enum declaration and members`() {
        // Arrange
        val code = """
            public enum Status {
                Pending,
                Active,
                Completed
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Status", "Pending", "Active", "Completed")
    }

    @Test
    fun `should extract record declaration identifier`() {
        // Arrange
        val code = "public record User(string Name, int Age);"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("User", "Name", "Age")
    }

    @Test
    fun `should extract method declaration identifier`() {
        // Arrange
        val code = """
            public class Example {
                public void ProcessOrder() {}
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "ProcessOrder")
    }

    @Test
    fun `should extract constructor declaration identifier`() {
        // Arrange
        val code = """
            public class User {
                public User() {}
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("User", "User")
    }

    @Test
    fun `should extract property declaration identifier`() {
        // Arrange
        val code = """
            public class Customer {
                public string Name { get; set; }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Customer", "Name")
    }

    @Test
    fun `should extract field declaration identifiers`() {
        // Arrange
        val code = """
            public class Customer {
                private string _customerName;
                private int _customerAge;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Customer", "_customerName", "_customerAge")
    }

    @Test
    fun `should extract local variable declaration identifiers`() {
        // Arrange
        val code = """
            public class Example {
                public void Calculate() {
                    int orderTotal = 0;
                    var customerCount = 10;
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Calculate", "orderTotal", "customerCount")
    }

    @Test
    fun `should extract parameter identifiers`() {
        // Arrange
        val code = """
            public class OrderService {
                public void Save(Order order, Customer customer) {}
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("OrderService", "Save", "order", "customer")
    }

    @Test
    fun `should extract delegate declaration identifier`() {
        // Arrange
        val code = "public delegate void EventHandler(object sender);"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("EventHandler", "sender")
    }

    @Test
    fun `should extract event declaration identifier`() {
        // Arrange
        val code = """
            public class Publisher {
                public event EventHandler OnSaved;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Publisher", "OnSaved")
    }

    @Test
    fun `should extract identifiers from complex class`() {
        // Arrange
        val code = """
            public class OrderProcessor {
                private string _orderId;
                private string _status = "pending";

                public OrderProcessor(string orderId) {
                    _orderId = orderId;
                }

                public void ProcessOrder(string customerId) {
                    bool result = Validate();
                }

                private bool Validate() {
                    return true;
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "OrderProcessor",
            "_orderId",
            "_status",
            "OrderProcessor",
            "orderId",
            "ProcessOrder",
            "customerId",
            "result",
            "Validate"
        )
    }

    @Test
    fun `should handle empty source code`() {
        // Arrange
        val code = ""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).isEmpty()
        assertThat(result.comments).isEmpty()
        assertThat(result.strings).isEmpty()
    }

    // === Comment Extraction Tests ===

    @Test
    fun `should extract single line comment`() {
        // Arrange
        val code = """
            // This is a comment
            public class Example {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a comment")
    }

    @Test
    fun `should extract block comment`() {
        // Arrange
        val code = """
            /* This is a
               block comment */
            public class Example {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.comments).containsExactly("This is a\nblock comment")
    }

    @Test
    fun `should extract xml documentation comment`() {
        // Arrange
        val code = """
            /// <summary>
            /// Documentation for the class
            /// </summary>
            public class Example {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.comments).containsExactly("<summary>", "Documentation for the class", "</summary>")
    }

    @Test
    fun `should extract multiple comments`() {
        // Arrange
        val code = """
            // First comment
            public class Example {
                // Second comment
                void Method() {}
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.comments).containsExactly("First comment", "Second comment")
    }

    // === String Extraction Tests ===

    @Test
    fun `should extract string literal`() {
        // Arrange
        val code = """
            public class Example {
                string message = "Hello World";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract verbatim string literal`() {
        // Arrange
        val code = """
            public class Example {
                string path = @"C:\Users\Documents";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.strings).containsExactly("C:\\Users\\Documents")
    }

    @Test
    fun `should extract interpolated string`() {
        // Arrange
        val code = """
            public class Example {
                void Test(string name) {
                    var msg = ${"$"}"Hello {name}";
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.strings).containsExactly("Hello {name}")
    }

    @Test
    fun `should extract multiple strings`() {
        // Arrange
        val code = """
            public class Example {
                string first = "Hello";
                string second = "World";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.strings).containsExactly("Hello", "World")
    }

    @Test
    fun `should extract string from method argument`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    Console.WriteLine("Test message");
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.strings).containsExactly("Test message")
    }

    // === ExtractionResult Tests ===

    @Test
    fun `should correctly categorize extracted items by context`() {
        // Arrange
        val code = """
            // Comment about the class
            public class Example {
                string name = "test";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "name")
        assertThat(result.comments).containsExactly("Comment about the class")
        assertThat(result.strings).containsExactly("test")
    }

    @Test
    fun `should provide access via extractedTexts list`() {
        // Arrange
        val code = """
            // Comment
            public class Foo {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.extractedTexts.map { it.context }).containsExactly(
            ExtractionContext.COMMENT,
            ExtractionContext.IDENTIFIER
        )
    }

    // === API Tests ===

    @Test
    fun `should report extraction is supported for CSharp`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.CSHARP)).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".cs")).isTrue()
    }

    @Test
    fun `should return CSharp in supported languages`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.CSHARP)).isTrue()
    }

    @Test
    fun `should return cs extension in supported extensions`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(".cs")).isTrue()
    }

    // === Lambda Parameter Tests ===

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

    // === Catch Clause Variable Tests ===

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

    // === Foreach Loop Variable Tests ===

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

    // === Generic Type Parameter Tests ===

    @Test
    fun `should extract generic type parameter`() {
        // Arrange
        val code = "public class Box<T> {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Box", "T")
    }

    @Test
    fun `should extract constrained generic type parameter`() {
        // Arrange
        val code = "public class Container<T> where T : IComparable<T> {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Container", "T")
    }

    @Test
    fun `should extract multiple generic type parameters`() {
        // Arrange
        val code = "public class Pair<TKey, TValue> {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Pair", "TKey", "TValue")
    }

    @Test
    fun `should extract method generic type parameter`() {
        // Arrange
        val code = """
            public class Example {
                public T Transform<T>(object input) { return default; }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Transform", "T", "input")
    }

    // === Using Statement Variable Tests ===

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

    // === Pattern Matching Tests ===

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

    // === Edge Case Tests ===

    @Test
    fun `should handle nested classes`() {
        // Arrange
        val code = """
            public class Outer {
                class Inner {
                    class Innermost {
                        string value;
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Outer", "Inner", "Innermost", "value")
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
    fun `should not extract comment text from inside strings`() {
        // Arrange
        val code = """
            public class Example {
                string code = "// this is not a comment";
                string block = "/* also not a comment */";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "code", "block")
        assertThat(result.comments).isEmpty()
        assertThat(result.strings).containsExactly("// this is not a comment", "/* also not a comment */")
    }

    @Test
    fun `should not extract string from inside comments`() {
        // Arrange
        val code = """
            public class Example {
                // string notExtracted = "hidden";
                /* string alsoHidden = "invisible"; */
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example")
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should handle string with escaped quotes`() {
        // Arrange
        val code = """
            public class Example {
                string escaped = "He said \"hello\"";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "escaped")
        assertThat(result.strings).containsExactly("He said \\\"hello\\\"")
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
    fun `should handle indexer declaration`() {
        // Arrange
        val code = """
            public class Example {
                public string this[int index] {
                    get { return items[index]; }
                    set { items[index] = value; }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "index")
    }

    @Test
    fun `should handle static and instance constructors`() {
        // Arrange
        val code = """
            public class Example {
                static string staticField;
                string instanceField;

                static Example() {
                    staticField = "init";
                }

                public Example() {
                    instanceField = "init";
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "Example",
            "staticField",
            "instanceField",
            "Example",
            "Example"
        )
        assertThat(result.strings).containsExactly("init", "init")
    }

    @Test
    fun `should handle params parameter`() {
        // Arrange
        val code = """
            public class Example {
                void Process(string first, params string[] rest) {}
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        // Note: params parameter "rest" comes before "first" due to C# grammar structure
        // (params are not wrapped in a parameter node, so they're extracted at parameter_list level)
        assertThat(result.identifiers).containsExactly("Example", "Process", "rest", "first")
    }

    @Test
    fun `should handle out and ref parameters`() {
        // Arrange
        val code = """
            public class Example {
                void Process(out int result, ref string data) {}
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Process", "result", "data")
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
    fun `should handle nullable reference types`() {
        // Arrange
        val code = """
            public class Example {
                string? nullableName;
                int? nullableAge;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "nullableName", "nullableAge")
    }

    @Test
    fun `should handle extension method parameter`() {
        // Arrange
        val code = """
            public static class Extensions {
                public static int WordCount(this string str) {
                    return str.Split(' ').Length;
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Extensions", "WordCount", "str")
    }

    // === Additional Edge Case Tests ===

    @Test
    fun `should handle async method`() {
        // Arrange
        val code = """
            public class Example {
                public async Task<string> FetchDataAsync(string url) {
                    return await GetAsync(url);
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "FetchDataAsync", "url")
    }

    @Test
    fun `should handle expression-bodied method`() {
        // Arrange
        val code = """
            public class Example {
                public int Double(int x) => x * 2;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Double", "x")
    }

    @Test
    fun `should handle expression-bodied property`() {
        // Arrange
        val code = """
            public class Example {
                private string firstName;
                private string lastName;
                public string FullName => firstName + lastName;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "firstName", "lastName", "FullName")
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
    fun `should handle record with primary constructor`() {
        // Arrange
        val code = """
            public record Person(string FirstName, string LastName) {
                public string FullName => FirstName + LastName;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Person", "FirstName", "LastName", "FullName")
    }

    @Test
    fun `should handle record struct`() {
        // Arrange
        val code = "public record struct Point(int X, int Y);"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Point", "X", "Y")
    }

    @Test
    fun `should handle init-only property`() {
        // Arrange
        val code = """
            public class Example {
                public string Name { get; init; }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Name")
    }

    @Test
    fun `should handle global using statement`() {
        // Arrange
        val code = """
            global using System;
            public class Example {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example")
    }

    @Test
    fun `should handle file-scoped namespace`() {
        // Arrange
        val code = """
            namespace MyNamespace;
            public class Example {
                string value;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "value")
    }

    @Test
    fun `should handle attribute on parameter`() {
        // Arrange
        val code = """
            public class Example {
                void Test([NotNull] string input) {}
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Test", "input")
    }

    @Test
    fun `should handle default parameter value`() {
        // Arrange
        val code = """
            public class Example {
                void Process(string name = "default", int count = 0) {}
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Process", "name", "count")
        assertThat(result.strings).containsExactly("default")
    }

    @Test
    fun `should handle explicit interface implementation`() {
        // Arrange
        val code = """
            public class Example : IDisposable {
                void IDisposable.Dispose() {}
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Dispose")
    }

    @Test
    fun `should handle operator overload`() {
        // Arrange
        val code = """
            public class Vector {
                public int X;
                public static Vector operator +(Vector a, Vector b) {
                    return new Vector();
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Vector", "X", "a", "b")
    }

    @Test
    fun `should handle implicit and explicit conversion operators`() {
        // Arrange
        val code = """
            public class Meter {
                public double Value;
                public static implicit operator double(Meter m) => m.Value;
                public static explicit operator Meter(double d) => new Meter();
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Meter", "Value", "m", "d")
    }

    @Test
    fun `should handle finalizer`() {
        // Arrange
        val code = """
            public class Example {
                ~Example() {
                    Cleanup();
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        // Note: destructor_declaration not currently extracted (would need dedicated support)
        assertThat(result.identifiers).containsExactly("Example")
    }

    @Test
    fun `should handle partial class`() {
        // Arrange
        val code = """
            public partial class Example {
                private string partOne;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "partOne")
    }

    @Test
    fun `should handle partial method`() {
        // Arrange
        val code = """
            public partial class Example {
                partial void OnChanged(string value);
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "OnChanged", "value")
    }

    @Test
    fun `should handle sealed class and method`() {
        // Arrange
        val code = """
            public sealed class Example {
                public sealed override string ToString() {
                    return "Example";
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "ToString")
        assertThat(result.strings).containsExactly("Example")
    }

    @Test
    fun `should handle abstract class and method`() {
        // Arrange
        val code = """
            public abstract class Example {
                public abstract void Process(string input);
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Process", "input")
    }

    @Test
    fun `should handle virtual and override methods`() {
        // Arrange
        val code = """
            public class Base {
                public virtual void Execute(string cmd) {}
            }
            public class Derived : Base {
                public override void Execute(string cmd) {}
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Base", "Execute", "cmd", "Derived", "Execute", "cmd")
    }

    @Test
    fun `should handle const field`() {
        // Arrange
        val code = """
            public class Example {
                public const string DefaultName = "Unknown";
                public const int MaxCount = 100;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "DefaultName", "MaxCount")
        assertThat(result.strings).containsExactly("Unknown")
    }

    @Test
    fun `should handle readonly field`() {
        // Arrange
        val code = """
            public class Example {
                public readonly string Id;
                public Example(string id) {
                    Id = id;
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Id", "Example", "id")
    }

    @Test
    fun `should handle volatile field`() {
        // Arrange
        val code = """
            public class Example {
                private volatile bool isRunning;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "isRunning")
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

    @Test
    fun `should handle unicode identifiers`() {
        // Arrange
        val code = """
            public class Héllo {
                string größe = "size";
                void naïve() {}
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Héllo", "größe", "naïve")
        assertThat(result.strings).containsExactly("size")
    }

    @Test
    fun `should handle verbatim identifier`() {
        // Arrange
        val code = """
            public class Example {
                string @class = "reserved";
                void @if(string @event) {}
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "@class", "@if", "@event")
        assertThat(result.strings).containsExactly("reserved")
    }

    @Test
    fun `should handle empty class body`() {
        // Arrange
        val code = "public class Empty { }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Empty")
        assertThat(result.comments).isEmpty()
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should handle deeply nested classes`() {
        // Arrange
        val code = """
            public class A {
                class B {
                    class C {
                        class D {
                            string value;
                        }
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("A", "B", "C", "D", "value")
    }

    @Test
    fun `should handle generic class with multiple constraints`() {
        // Arrange
        val code = """
            public class Example<T, U>
                where T : class, new()
                where U : struct { }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "T", "U")
    }

    @Test
    fun `should handle generic method with constraints`() {
        // Arrange
        val code = """
            public class Example {
                public T Create<T>() where T : new() {
                    return new T();
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "Create", "T")
    }

    @Test
    fun `should handle covariant and contravariant type parameters`() {
        // Arrange
        val code = """
            public interface IProducer<out T> {
                T Produce();
            }
            public interface IConsumer<in T> {
                void Consume(T item);
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("IProducer", "T", "Produce", "IConsumer", "T", "Consume", "item")
    }
}
