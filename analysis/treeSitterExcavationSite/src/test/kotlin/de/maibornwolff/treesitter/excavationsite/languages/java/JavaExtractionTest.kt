package de.maibornwolff.treesitter.excavationsite.languages.java

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class JavaExtractionTest {
    // === Identifier Extraction Tests ===

    @Test
    fun `should extract class declaration identifier`() {
        // Arrange
        val code = "public class UserService {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("UserService")
    }

    @Test
    fun `should extract interface declaration identifier`() {
        // Arrange
        val code = "public interface OrderRepository {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("OrderRepository")
    }

    @Test
    fun `should extract enum declaration and constants`() {
        // Arrange
        val code = """
            public enum Status {
                PENDING,
                ACTIVE,
                COMPLETED
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Status", "PENDING", "ACTIVE", "COMPLETED")
    }

    @Test
    fun `should extract record declaration identifier`() {
        // Arrange - Java 14+ record
        val code = "public record Point(int x, int y) {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Point", "x", "y")
    }

    @Test
    fun `should extract method declaration identifier`() {
        // Arrange
        val code = """
            public class Example {
                public void processOrder() {}
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "processOrder")
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
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("User", "User")
    }

    @Test
    fun `should extract field declaration identifiers`() {
        // Arrange
        val code = """
            public class Customer {
                private String customerName;
                private int customerAge;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Customer", "customerName", "customerAge")
    }

    @Test
    fun `should extract local variable declaration identifiers`() {
        // Arrange
        val code = """
            public class Example {
                public void calculate() {
                    int orderTotal = 0;
                    var customerCount = 10;
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "calculate", "orderTotal", "customerCount")
    }

    @Test
    fun `should extract formal parameter identifiers`() {
        // Arrange
        val code = """
            public class OrderService {
                public void save(Order order, Customer customer) {}
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("OrderService", "save", "order", "customer")
    }

    @Test
    fun `should extract identifiers from complex class`() {
        // Arrange
        val code = """
            public class OrderProcessor {
                private String orderId;
                private String status = "pending";

                public OrderProcessor(String orderId) {
                    this.orderId = orderId;
                }

                public void processOrder(String customerId) {
                    boolean result = validate();
                }

                private boolean validate() {
                    return true;
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "OrderProcessor",
            "orderId",
            "status",
            "OrderProcessor",
            "orderId",
            "processOrder",
            "customerId",
            "result",
            "validate"
        )
    }

    @Test
    fun `should handle empty source code`() {
        // Arrange
        val code = ""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).isEmpty()
        assertThat(result.comments).isEmpty()
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should extract identifiers from anonymous class`() {
        // Arrange
        val code = """
            public class Example {
                Runnable r = new Runnable() {
                    public void run() {}
                };
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "r", "run")
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
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

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
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.comments).containsExactly("This is a\nblock comment")
    }

    @Test
    fun `should extract javadoc comment`() {
        // Arrange
        val code = """
            /**
             * Documentation for the class
             * @author John Doe
             */
            public class Example {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.comments).containsExactly("Documentation for the class\n@author John Doe")
    }

    @Test
    fun `should extract multiple comments`() {
        // Arrange
        val code = """
            // First comment
            public class Example {
                // Second comment
                void method() {}
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.comments).containsExactly("First comment", "Second comment")
    }

    // === String Extraction Tests ===

    @Test
    fun `should extract string literal`() {
        // Arrange
        val code = """
            public class Example {
                String message = "Hello World";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract multiple strings`() {
        // Arrange
        val code = """
            public class Example {
                String first = "Hello";
                String second = "World";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.strings).containsExactly("Hello", "World")
    }

    @Test
    fun `should extract string from method argument`() {
        // Arrange
        val code = """
            public class Example {
                void test() {
                    System.out.println("Test message");
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

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
                String name = "test";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

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
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.extractedTexts.map { it.context }).containsExactly(
            ExtractionContext.COMMENT,
            ExtractionContext.IDENTIFIER
        )
    }

    // === API Tests ===

    @Test
    fun `should report extraction is supported for Java`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.JAVA)).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".java")).isTrue()
    }

    @Test
    fun `should return Java in supported languages`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.JAVA)).isTrue()
    }

    @Test
    fun `should return java extension in supported extensions`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(".java")).isTrue()
    }

    // === Text Block Tests (Java 15+) ===

    @Test
    fun `should extract text block content`() {
        // Arrange
        val code = """
            public class Example {
                String json = ${"\"\"\""}
                    {"key": "value"}
                    ${"\"\"\""};
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "json")
        assertThat(result.strings).containsExactly("{\"key\": \"value\"}")
    }

    @Test
    fun `should extract multiline text block`() {
        // Arrange
        val code = """
            public class Example {
                String html = ${"\"\"\""}
                    <html>
                        <body>Hello</body>
                    </html>
                    ${"\"\"\""};
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "html")
        assertThat(result.strings).containsExactly("<html>\n    <body>Hello</body>\n</html>")
    }

    // === Lambda Parameter Tests ===

    @Test
    fun `should extract lambda parameter`() {
        // Arrange
        val code = """
            public class Example {
                void test() {
                    list.forEach(item -> process(item));
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "item")
    }

    @Test
    fun `should extract typed lambda parameters`() {
        // Arrange
        val code = """
            public class Example {
                void test() {
                    list.stream().map((String str) -> str.toUpperCase());
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "str")
    }

    @Test
    fun `should extract multiple lambda parameters`() {
        // Arrange
        val code = """
            public class Example {
                void test() {
                    map.forEach((key, value) -> process(key, value));
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "key", "value")
    }

    // === Catch Clause Variable Tests ===

    @Test
    fun `should extract catch clause exception variable`() {
        // Arrange
        val code = """
            public class Example {
                void test() {
                    try {
                        riskyOperation();
                    } catch (Exception ex) {
                        handle(ex);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "ex")
    }

    @Test
    fun `should extract multi-catch exception variable`() {
        // Arrange
        val code = """
            public class Example {
                void test() {
                    try {
                        riskyOperation();
                    } catch (IOException | SQLException error) {
                        handle(error);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "error")
    }

    // === Enhanced For-Loop Variable Tests ===

    @Test
    fun `should extract enhanced for-loop variable`() {
        // Arrange
        val code = """
            public class Example {
                void test() {
                    for (String item : items) {
                        process(item);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "item")
    }

    @Test
    fun `should extract var enhanced for-loop variable`() {
        // Arrange
        val code = """
            public class Example {
                void test() {
                    for (var entry : entries) {
                        process(entry);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "entry")
    }

    // === Generic Type Parameter Tests ===

    @Test
    fun `should extract generic type parameter`() {
        // Arrange
        val code = "public class Box<T> {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Box", "T")
    }

    @Test
    fun `should extract bounded generic type parameter`() {
        // Arrange
        val code = "public class Container<E extends Comparable<E>> {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Container", "E")
    }

    @Test
    fun `should extract multiple generic type parameters`() {
        // Arrange
        val code = "public class Pair<K, V> {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Pair", "K", "V")
    }

    @Test
    fun `should extract method generic type parameter`() {
        // Arrange
        val code = """
            public class Example {
                public <R> R transform(Object input) { return null; }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "transform", "R", "input")
    }

    // === Annotation Type Element Tests ===

    @Test
    fun `should extract annotation type element`() {
        // Arrange
        val code = """
            public @interface MyAnnotation {
                String value();
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("MyAnnotation", "value")
    }

    @Test
    fun `should extract annotation type element with default`() {
        // Arrange
        val code = """
            public @interface Config {
                String name() default "default";
                int priority() default 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Config", "name", "priority")
        assertThat(result.strings).containsExactly("default")
    }

    // === Try-With-Resources Variable Tests ===

    @Test
    fun `should extract try-with-resources variable`() {
        // Arrange
        val code = """
            public class Example {
                void test() {
                    try (InputStream stream = new FileInputStream("file")) {
                        read(stream);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "stream")
        assertThat(result.strings).containsExactly("file")
    }

    @Test
    fun `should extract multiple try-with-resources variables`() {
        // Arrange
        val code = """
            public class Example {
                void test() {
                    try (InputStream in = openInput(); OutputStream out = openOutput()) {
                        copy(in, out);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "in", "out")
    }

    // === Pattern Matching Tests (Java 16+) ===

    @Test
    fun `should extract instanceof pattern variable`() {
        // Arrange
        val code = """
            public class Example {
                void test(Object obj) {
                    if (obj instanceof String str) {
                        process(str);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "obj", "str")
    }

    @Test
    fun `should not extract from instanceof without pattern variable`() {
        // Arrange
        val code = """
            public class Example {
                void test(Object obj) {
                    if (obj instanceof String) {
                        process();
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "obj")
    }

    @Test
    fun `should extract switch pattern variable`() {
        // Arrange
        val code = """
            public class Example {
                int test(Object obj) {
                    return switch (obj) {
                        case Integer num -> num + 1;
                        case String text -> text.length();
                        default -> 0;
                    };
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "obj", "num", "text")
    }

    @Test
    fun `should extract record pattern variables`() {
        // Arrange
        val code = """
            public class Example {
                void test(Object obj) {
                    if (obj instanceof Point(int x, int y)) {
                        process(x, y);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "obj", "x", "y")
    }

    @Test
    fun `should extract nested record pattern variables`() {
        // Arrange
        val code = """
            public class Example {
                void test(Object obj) {
                    if (obj instanceof Line(Point(int x1, int y1), Point(int x2, int y2))) {
                        draw(x1, y1, x2, y2);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "obj", "x1", "y1", "x2", "y2")
    }

    // === Edge Case Tests ===

    @Test
    fun `should handle empty class`() {
        // Arrange
        val code = "public class Empty {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Empty")
        assertThat(result.comments).isEmpty()
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should handle nested classes`() {
        // Arrange
        val code = """
            public class Outer {
                class Inner {
                    class Innermost {
                        String value;
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Outer", "Inner", "Innermost", "value")
    }

    @Test
    fun `should handle lambda with no parameters`() {
        // Arrange
        val code = """
            public class Example {
                void test() {
                    Runnable r = () -> doSomething();
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "r")
    }

    @Test
    fun `should handle nested lambdas`() {
        // Arrange
        val code = """
            public class Example {
                void test() {
                    list.stream()
                        .map(outer -> inner -> process(outer, inner));
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "outer", "inner")
    }

    @Test
    fun `should not extract from traditional for-loop`() {
        // Arrange - traditional for loop variable is a local_variable_declaration
        val code = """
            public class Example {
                void test() {
                    for (int i = 0; i < 10; i++) {
                        process(i);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "i")
    }

    @Test
    fun `should handle multiple catch blocks`() {
        // Arrange
        val code = """
            public class Example {
                void test() {
                    try {
                        risky();
                    } catch (IOException io) {
                        handleIO(io);
                    } catch (SQLException sql) {
                        handleSQL(sql);
                    } catch (Exception ex) {
                        handleGeneric(ex);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "io", "sql", "ex")
    }

    @Test
    fun `should handle try-catch-finally with resources`() {
        // Arrange
        val code = """
            public class Example {
                void test() {
                    try (InputStream input = open()) {
                        read(input);
                    } catch (Exception err) {
                        handle(err);
                    } finally {
                        cleanup();
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "input", "err")
    }

    @Test
    fun `should handle multiple instanceof patterns in same method`() {
        // Arrange
        val code = """
            public class Example {
                void test(Object a, Object b) {
                    if (a instanceof String strA && b instanceof Integer intB) {
                        process(strA, intB);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "a", "b", "strA", "intB")
    }

    @Test
    fun `should handle switch with mixed case types`() {
        // Arrange
        val code = """
            public class Example {
                String test(Object obj) {
                    return switch (obj) {
                        case Integer num -> "int: " + num;
                        case null -> "null";
                        default -> "other";
                    };
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "obj", "num")
        assertThat(result.strings).containsExactly("int: ", "null", "other")
    }

    @Test
    fun `should not extract comment text from inside strings`() {
        // Arrange
        val code = """
            public class Example {
                String code = "// this is not a comment";
                String block = "/* also not a comment */";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

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
                // String notExtracted = "hidden";
                /* String alsoHidden = "invisible"; */
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example")
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should handle string with escaped quotes`() {
        // Arrange
        val code = """
            public class Example {
                String escaped = "He said \"hello\"";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "escaped")
        assertThat(result.strings).containsExactly("He said \\\"hello\\\"")
    }

    @Test
    fun `should handle complex generic signature`() {
        // Arrange
        val code = "public class Container<K extends Comparable<K>, V extends List<? extends K>> {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Container", "K", "V")
    }

    @Test
    fun `should handle unicode identifiers`() {
        // Arrange
        val code = """
            public class Héllo {
                String größe = "größe";
                void naïve() {}
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Héllo", "größe", "naïve")
        assertThat(result.strings).containsExactly("größe")
    }

    @Test
    fun `should handle chained method calls with lambdas`() {
        // Arrange
        val code = """
            public class Example {
                void test() {
                    list.stream()
                        .filter(item -> item.isValid())
                        .map(valid -> valid.transform())
                        .forEach(result -> save(result));
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "test", "item", "valid", "result")
    }

    @Test
    fun `should handle static and instance initializer blocks`() {
        // Arrange
        val code = """
            public class Example {
                static String staticField;
                String instanceField;

                static {
                    String staticLocal = "init";
                    staticField = staticLocal;
                }

                {
                    String instanceLocal = "init";
                    instanceField = instanceLocal;
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "Example",
            "staticField",
            "instanceField",
            "staticLocal",
            "instanceLocal"
        )
        assertThat(result.strings).containsExactly("init", "init")
    }

    @Test
    fun `should handle varargs parameter`() {
        // Arrange
        val code = """
            public class Example {
                void process(String first, String... rest) {}
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "process", "first", "rest")
    }

    @Test
    fun `should handle annotation with parameters`() {
        // Arrange
        val code = """
            @interface Config {
                String[] values() default {};
                int count() default 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Config", "values", "count")
    }
}
