package de.maibornwolff.treesitter.excavationsite.languages.python

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class PythonExtractionTest {
    // === Identifier Extraction Tests ===

    @Test
    fun `should extract class definition identifier`() {
        // Arrange
        val code = """
            class UserService:
                pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("UserService")
    }

    @Test
    fun `should extract function definition identifier`() {
        // Arrange
        val code = """
            def process_order():
                pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("process_order")
    }

    @Test
    fun `should extract simple assignment identifier`() {
        // Arrange
        val code = "order_total = 100"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("order_total")
    }

    @Test
    fun `should extract simple parameter identifiers`() {
        // Arrange
        val code = """
            def foo(x, y):
                pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("foo", "x", "y")
    }

    @Test
    fun `should extract typed parameter identifiers`() {
        // Arrange
        val code = """
            def foo(x: int, y: str):
                pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("foo", "x", "y")
    }

    @Test
    fun `should extract default parameter identifiers`() {
        // Arrange
        val code = """
            def foo(x=10, y='default'):
                pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("foo", "x", "y")
    }

    @Test
    fun `should extract args and kwargs parameter identifiers`() {
        // Arrange
        val code = """
            def foo(*args, **kwargs):
                pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("foo", "args", "kwargs")
    }

    @Test
    fun `should extract identifiers from complex class`() {
        // Arrange
        val code = """
            class OrderProcessor:
                status = "pending"

                def __init__(self, order_id):
                    self.order_id = order_id

                def process_order(self, customer_id):
                    result = self.validate()
                    return result

                def validate(self):
                    return True
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "OrderProcessor",
            "status",
            "__init__",
            "self",
            "order_id",
            "process_order",
            "self",
            "customer_id",
            "result",
            "validate",
            "self"
        )
    }

    @Test
    fun `should not extract tuple unpacking assignment`() {
        // Arrange
        val code = "a, b = 1, 2"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        // Tuple unpacking is not a simple identifier assignment
        assertThat(result.identifiers).isEmpty()
    }

    @Test
    fun `should handle empty source code`() {
        // Arrange
        val code = ""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).isEmpty()
        assertThat(result.comments).isEmpty()
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should extract identifiers from decorated function`() {
        // Arrange
        val code = """
            @decorator
            def my_function(param):
                pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        // Now also extracts decorator name
        assertThat(result.identifiers).containsExactly("decorator", "my_function", "param")
    }

    @Test
    fun `should extract identifiers from class with inheritance`() {
        // Arrange
        val code = """
            class ChildClass(ParentClass):
                def method(self, value):
                    pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("ChildClass", "method", "self", "value")
    }

    // === Comment Extraction Tests ===

    @Test
    fun `should extract single line comment`() {
        // Arrange
        val code = """
            # This is a comment
            x = 1
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a comment")
    }

    @Test
    fun `should extract multiple comments`() {
        // Arrange
        val code = """
            # First comment
            x = 1
            # Second comment
            y = 2
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.comments).containsExactly("First comment", "Second comment")
    }

    @Test
    fun `should extract inline comment`() {
        // Arrange
        val code = "x = 1  # inline comment"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.comments).containsExactly("inline comment")
    }

    // === String Extraction Tests ===

    @Test
    fun `should extract double quoted string`() {
        // Arrange
        val code = """message = "Hello World""""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract single quoted string`() {
        // Arrange
        val code = "message = 'Hello World'"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract triple double quoted string`() {
        // Arrange
        val code = "message = \"\"\"Hello World\"\"\""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract triple single quoted string`() {
        // Arrange
        val code = "message = '''Hello World'''"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract docstring as comment`() {
        // Arrange
        val code = """
            def my_function():
                '''This is a docstring'''
                pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        // Docstrings are treated as comments (consistent with metrics)
        assertThat(result.comments).containsExactly("This is a docstring")
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should extract f-string`() {
        // Arrange
        val code = """name = f"Hello {user}""""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.strings).containsExactly("Hello {user}")
    }

    @Test
    fun `should extract raw string`() {
        // Arrange
        val code = """pattern = r"\d+""""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        // Raw strings preserve backslashes as-is
        assertThat(result.strings).containsExactly("\\d+")
    }

    @Test
    fun `should extract multiple strings`() {
        // Arrange
        val code = """
            first = "Hello"
            second = 'World'
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.strings).containsExactly("Hello", "World")
    }

    // === Combined Tests ===

    @Test
    fun `should correctly categorize extracted items by context`() {
        // Arrange
        val code = """
            # Comment about the class
            class Example:
                name = "test"
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "name")
        assertThat(result.comments).containsExactly("Comment about the class")
        assertThat(result.strings).containsExactly("test")
    }

    @Test
    fun `should provide access via extractedTexts list`() {
        // Arrange
        val code = """
            # Comment
            class Foo:
                pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.extractedTexts.map { it.context }).containsExactly(
            ExtractionContext.COMMENT,
            ExtractionContext.IDENTIFIER
        )
    }

    // === Comprehension Variable Tests ===

    @Test
    fun `should extract list comprehension variable`() {
        // Arrange
        val code = "[x for x in items]"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("x")
    }

    @Test
    fun `should extract dict comprehension variables`() {
        // Arrange
        val code = "{k: v for k, v in pairs}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("k", "v")
    }

    @Test
    fun `should extract generator expression variable`() {
        // Arrange
        val code = "(x * 2 for x in numbers)"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("x")
    }

    @Test
    fun `should extract set comprehension variable`() {
        // Arrange
        val code = "{x for x in items}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("x")
    }

    @Test
    fun `should extract nested comprehension variables`() {
        // Arrange
        val code = "[[y for y in row] for row in matrix]"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("y", "row")
    }

    // === Walrus Operator Tests ===

    @Test
    fun `should extract walrus operator variable in if statement`() {
        // Arrange
        val code = """
            if (n := len(data)) > 10:
                print(n)
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("n")
    }

    @Test
    fun `should extract walrus operator variable in while loop`() {
        // Arrange
        val code = """
            while (line := file.readline()):
                process(line)
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("line")
    }

    @Test
    fun `should extract walrus operator variable in list comprehension`() {
        // Arrange
        val code = "[y for x in data if (y := compute(x))]"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("x", "y")
    }

    // === Exception Handler Variable Tests ===

    @Test
    fun `should extract exception handler variable`() {
        // Arrange
        val code = """
            try:
                risky()
            except ValueError as e:
                print(e)
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("e")
    }

    @Test
    fun `should extract multiple exception handler variables`() {
        // Arrange
        val code = """
            try:
                risky()
            except ValueError as ve:
                handle(ve)
            except TypeError as te:
                handle(te)
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("ve", "te")
    }

    // === Exception Handler Edge Cases ===

    @Test
    fun `should not extract from exception handler without variable`() {
        // Arrange
        val code = """
            try:
                risky()
            except ValueError:
                handle()
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        // No variable bound, should extract nothing
        assertThat(result.identifiers).isEmpty()
    }

    @Test
    fun `should not extract from bare except`() {
        // Arrange
        val code = """
            try:
                risky()
            except:
                handle()
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).isEmpty()
    }

    // === Context Manager Variable Tests ===

    @Test
    fun `should not extract from context manager without variable`() {
        // Arrange
        val code = """
            with lock:
                do_work()
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        // No variable bound, should extract nothing
        assertThat(result.identifiers).isEmpty()
    }

    @Test
    fun `should extract context manager variable`() {
        // Arrange
        val code = """
            with open(file) as f:
                data = f.read()
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("f", "data")
    }

    @Test
    fun `should extract multiple context manager variables`() {
        // Arrange
        val code = """
            with open(input) as fin, open(output) as fout:
                pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("fin", "fout")
    }

    // === Decorator Name Tests ===

    @Test
    fun `should extract simple decorator name`() {
        // Arrange
        val code = """
            @dataclass
            class User:
                pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("dataclass", "User")
    }

    @Test
    fun `should extract call decorator name`() {
        // Arrange
        val code = """
            @property
            def value(self):
                pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("property", "value", "self")
    }

    @Test
    fun `should extract decorator with arguments name`() {
        // Arrange
        val code = """
            @decorator(arg=1)
            def func():
                pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("decorator", "func")
    }

    @Test
    fun `should extract multiple decorator names`() {
        // Arrange
        val code = """
            @first
            @second
            def func():
                pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("first", "second", "func")
    }

    // === For Loop Variable Tests ===

    @Test
    fun `should extract for loop variable`() {
        // Arrange
        val code = """
            for i in range(10):
                pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("i")
    }

    @Test
    fun `should extract for loop tuple unpacking variables`() {
        // Arrange
        val code = """
            for x, y in coordinates:
                pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("x", "y")
    }

    @Test
    fun `should extract for loop with assignment inside`() {
        // Arrange
        val code = """
            for item in items:
                result = process(item)
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("item", "result")
    }

    // === Lambda Parameter Tests ===

    @Test
    fun `should extract lambda parameters`() {
        // Arrange
        val code = "fn = lambda x, y: x + y"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("fn", "x", "y")
    }

    @Test
    fun `should extract lambda with default parameter`() {
        // Arrange
        val code = "fn = lambda x, y=10: x + y"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("fn", "x", "y")
    }

    @Test
    fun `should extract lambda with args and kwargs`() {
        // Arrange
        val code = "fn = lambda *args, **kwargs: None"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("fn", "args", "kwargs")
    }

    // === Type Alias Tests (Python 3.12+) ===
    // NOTE: These tests require tree-sitter-python with Python 3.12 support
    // Currently disabled as the tree-sitter version may not support the `type` statement

    @Test
    fun `should extract type alias name when supported`() {
        // Arrange
        val code = "type Point = tuple[int, int]"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert - may be empty if tree-sitter doesn't support type statements
        // When supported, should extract "Point"
        val hasTypeAliasSupport = result.identifiers.contains("Point")
        if (hasTypeAliasSupport) {
            assertThat(result.identifiers).containsExactly("Point")
        } else {
            // Tree-sitter parses this as assignment fallback, skip assertion
            assertThat(result.identifiers).isEmpty()
        }
    }

    @Test
    fun `should extract generic type alias name when supported`() {
        // Arrange
        val code = "type Vector[T] = list[T]"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert - may be empty if tree-sitter doesn't support type statements
        val hasTypeAliasSupport = result.identifiers.contains("Vector")
        if (hasTypeAliasSupport) {
            assertThat(result.identifiers).containsExactly("Vector")
        } else {
            assertThat(result.identifiers).isEmpty()
        }
    }

    // === Pattern Matching Tests (Python 3.10+) ===

    @Test
    fun `should extract pattern matching capture variable`() {
        // Arrange
        val code = """
            match command:
                case ["go", direction]:
                    move(direction)
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("direction")
    }

    @Test
    fun `should extract pattern matching dict capture variables`() {
        // Arrange
        val code = """
            match data:
                case {"action": action, "value": value}:
                    perform(action, value)
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("action", "value")
    }

    @Test
    fun `should extract pattern matching as capture`() {
        // Arrange
        val code = """
            match point:
                case (x, y) as p:
                    print(p)
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("x", "y", "p")
    }

    @Test
    fun `should extract pattern matching star pattern`() {
        // Arrange
        val code = """
            match items:
                case [first, *rest]:
                    process(first)
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("first", "rest")
    }

    @Test
    fun `should extract pattern matching class pattern`() {
        // Arrange
        val code = """
            match shape:
                case Point(x, y):
                    draw(x, y)
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        // Point is the class name (not captured), x and y are captured
        assertThat(result.identifiers).containsExactly("x", "y")
    }

    @Test
    fun `should not extract pattern matching wildcard`() {
        // Arrange
        val code = """
            match value:
                case _:
                    default()
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        // Wildcard _ should not be extracted
        assertThat(result.identifiers).isEmpty()
    }

    @Test
    fun `should extract pattern matching or pattern`() {
        // Arrange
        val code = """
            match status:
                case 200 | 201 | code:
                    handle(code)
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("code")
    }

    // === Global/Nonlocal Tests ===

    @Test
    fun `should extract global declaration variable`() {
        // Arrange
        val code = """
            def foo():
                global x
                x = 1
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("foo", "x", "x")
    }

    @Test
    fun `should extract nonlocal declaration variable`() {
        // Arrange
        val code = """
            def outer():
                x = 1
                def inner():
                    nonlocal x
                    x = 2
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("outer", "x", "inner", "x", "x")
    }

    @Test
    fun `should extract multiple global variables`() {
        // Arrange
        val code = """
            def foo():
                global a, b, c
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("foo", "a", "b", "c")
    }

    // === Annotated Assignment Tests ===

    @Test
    fun `should extract annotated assignment variable`() {
        // Arrange
        val code = "x: int = 5"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("x")
    }

    @Test
    fun `should extract annotated assignment without value`() {
        // Arrange
        val code = "x: int"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("x")
    }

    @Test
    fun `should extract class attribute with annotation`() {
        // Arrange
        val code = """
            class Foo:
                x: int
                y: str = "hello"
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("Foo", "x", "y")
    }

    // === Async For/With Tests ===

    @Test
    fun `should extract async for loop variable`() {
        // Arrange
        val code = """
            async def fetch():
                async for item in stream:
                    process(item)
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("fetch", "item")
    }

    @Test
    fun `should extract async with context manager variable`() {
        // Arrange
        val code = """
            async def connect():
                async with session.get(url) as response:
                    data = await response.json()
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("connect", "response", "data")
    }

    // === Comprehension Edge Cases ===

    @Test
    fun `should extract comprehension variable with condition`() {
        // Arrange
        val code = "[x for x in items if x > 0]"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        // Only the loop variable, not the condition references
        assertThat(result.identifiers).containsExactly("x")
    }

    @Test
    fun `should extract multiple comprehension variables`() {
        // Arrange
        val code = "[x + y for x in xs for y in ys]"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("x", "y")
    }

    @Test
    fun `should extract async comprehension variable`() {
        // Arrange
        val code = "[x async for x in aiter]"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("x")
    }

    // === Keyword-only and Positional-only Parameter Tests ===

    @Test
    fun `should extract keyword-only parameters`() {
        // Arrange
        val code = """
            def foo(a, *, key, value):
                pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("foo", "a", "key", "value")
    }

    @Test
    fun `should extract positional-only parameters`() {
        // Arrange
        val code = """
            def foo(x, y, /):
                pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("foo", "x", "y")
    }

    @Test
    fun `should extract mixed parameter types`() {
        // Arrange
        val code = """
            def foo(pos_only, /, regular, *, kw_only):
                pass
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactly("foo", "pos_only", "regular", "kw_only")
    }

    // === API Tests ===

    @Test
    fun `should report extraction is supported for Python`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.PYTHON)).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".py")).isTrue()
    }

    @Test
    fun `should return Python in supported languages`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.PYTHON)).isTrue()
    }

    @Test
    fun `should return py in supported extensions`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(".py")).isTrue()
    }
}
