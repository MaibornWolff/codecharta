package de.maibornwolff.treesitter.excavationsite.languages.php

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class PhpExtractionTest {
    @Nested
    inner class IdentifierTests {
        @Test
        fun `should extract class declaration identifier`() {
            // Arrange
            val code = "<?php class UserService {}"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("UserService")
        }

        @Test
        fun `should extract interface declaration identifier`() {
            // Arrange
            val code = "<?php interface OrderRepository {}"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("OrderRepository")
        }

        @Test
        fun `should extract trait declaration identifier`() {
            // Arrange
            val code = "<?php trait Loggable {}"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("Loggable")
        }

        @Test
        fun `should extract enum declaration identifier`() {
            // Arrange
            val code = "<?php enum Status { case Active; case Inactive; }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("Status")
        }

        @Test
        fun `should extract function definition identifier`() {
            // Arrange
            val code = "<?php function processOrder() {}"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("processOrder")
        }

        @Test
        fun `should extract method declaration identifier`() {
            // Arrange
            val code = """
                <?php
                class Calculator {
                    public function add() {}
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("Calculator", "add")
        }

        @Test
        fun `should extract property declaration identifier without dollar sign`() {
            // Arrange
            val code = """
                <?php
                class User {
                    private ${"$"}customerName;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("User", "customerName")
        }

        @Test
        fun `should extract const declaration identifier`() {
            // Arrange
            val code = """
                <?php
                class Config {
                    const MAX_SIZE = 100;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("Config", "MAX_SIZE")
        }

        @Test
        fun `should extract parameter identifiers without dollar sign`() {
            // Arrange
            val code = """
                <?php
                function calculate(${"$"}price, ${"$"}quantity) {
                    return ${"$"}price * ${"$"}quantity;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("calculate", "price", "quantity")
        }

        @Test
        fun `should extract assignment expression identifier`() {
            // Arrange
            val code = """
                <?php
                ${"$"}orderTotal = 0;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("orderTotal")
        }

        @Test
        fun `should extract constructor property promotion identifiers`() {
            // Arrange
            val code = """
                <?php
                class User {
                    public function __construct(
                        private string ${"$"}name,
                        private int ${"$"}age
                    ) {}
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("User", "__construct", "name", "age")
        }

        @Test
        fun `should extract namespace definition`() {
            // Arrange
            val code = """
                <?php
                namespace App\Services;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("App\\Services")
        }

        @Test
        fun `should extract identifiers from complex class`() {
            // Arrange
            val code = """
                <?php
                namespace App\Domain;

                class OrderProcessor {
                    private ${"$"}orderId;
                    const STATUS_PENDING = 'pending';

                    public function __construct(${"$"}orderId) {
                        ${"$"}this->orderId = ${"$"}orderId;
                    }

                    public function process(${"$"}customerId) {
                        ${"$"}result = ${"$"}this->validate();
                        return ${"$"}result;
                    }

                    private function validate() {
                        return true;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly(
                "App\\Domain",
                "OrderProcessor",
                "orderId",
                "STATUS_PENDING",
                "__construct",
                "orderId",
                "process",
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
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).isEmpty()
            assertThat(result.comments).isEmpty()
            assertThat(result.strings).isEmpty()
        }
    }

    @Nested
    inner class CommentTests {
        @Test
        fun `should extract single line comment`() {
            // Arrange
            val code = """
                <?php
                // This is a line comment
                ${"$"}x = 1;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.comments).containsExactly("This is a line comment")
        }

        @Test
        fun `should extract hash comment`() {
            // Arrange
            val code = """
                <?php
                # This is a shell-style comment
                ${"$"}x = 1;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.comments).containsExactly("This is a shell-style comment")
        }

        @Test
        fun `should extract block comment`() {
            // Arrange
            val code = """
                <?php
                /* This is a block comment */
                ${"$"}x = 1;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.comments).containsExactly("This is a block comment")
        }

        @Test
        fun `should extract docblock comment`() {
            // Arrange
            val code = """
                <?php
                /**
                 * This is a docblock
                 * @param int ${"$"}value The value
                 */
                function example(${"$"}value) {}
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.comments).containsExactly("This is a docblock\n@param int \$value The value")
        }
    }

    @Nested
    inner class StringTests {
        @Test
        fun `should extract single quoted string`() {
            // Arrange
            val code = """<?php ${"$"}message = 'Hello World';"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.strings).containsExactly("Hello World")
        }

        @Test
        fun `should extract double quoted string`() {
            // Arrange
            val code = """<?php ${"$"}message = "Hello World";"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.strings).containsExactly("Hello World")
        }

        @Test
        fun `should extract heredoc string`() {
            // Arrange
            val code = """
                <?php
                ${"$"}text = <<<EOT
                This is heredoc content
                EOT;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.strings).containsExactly("This is heredoc content")
        }

        @Test
        fun `should extract nowdoc string`() {
            // Arrange
            val code = """
                <?php
                ${"$"}text = <<<'EOT'
                This is nowdoc content
                EOT;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.strings).containsExactly("This is nowdoc content")
        }
    }

    @Nested
    inner class CatchClauseTests {
        @Test
        fun `should extract catch clause variable`() {
            // Arrange
            val code = """
                <?php
                try {
                    riskyOperation();
                } catch (Exception ${"$"}e) {
                    log(${"$"}e);
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("e")
        }

        @Test
        fun `should extract multiple catch clause variables`() {
            // Arrange
            val code = """
                <?php
                try {
                    riskyOperation();
                } catch (InvalidArgumentException ${"$"}argError) {
                    handleArg(${"$"}argError);
                } catch (RuntimeException ${"$"}runtimeError) {
                    handleRuntime(${"$"}runtimeError);
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("argError", "runtimeError")
        }

        @Test
        fun `should extract catch clause variable with typed union`() {
            // Arrange
            val code = """
                <?php
                try {
                    process();
                } catch (TypeError|ValueError ${"$"}error) {
                    handleError(${"$"}error);
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("error")
        }
    }

    @Nested
    inner class ForeachTests {
        @Test
        fun `should extract foreach loop value variable`() {
            // Arrange
            val code = """<?php foreach (${"$"}items as ${"$"}item) { }"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("item")
        }

        @Test
        fun `should extract foreach loop key and value variables`() {
            // Arrange
            val code = """<?php foreach (${"$"}users as ${"$"}id => ${"$"}user) { }"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("id", "user")
        }

        @Test
        fun `should extract foreach with reference variable`() {
            // Arrange
            val code = """<?php foreach (${"$"}items as &${"$"}item) { }"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("item")
        }

        @Test
        fun `should extract nested foreach variables`() {
            // Arrange
            val code = """
                <?php
                foreach (${"$"}matrix as ${"$"}row) {
                    foreach (${"$"}row as ${"$"}cell) {
                        echo ${"$"}cell;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("row", "cell")
        }
    }

    @Nested
    inner class ArrowFunctionTests {
        @Test
        fun `should extract arrow function parameters`() {
            // Arrange
            val code = """<?php ${"$"}multiply = fn(${"$"}x, ${"$"}y) => ${"$"}x * ${"$"}y;"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("multiply", "x", "y")
        }

        @Test
        fun `should extract single arrow function parameter`() {
            // Arrange
            val code = """<?php ${"$"}double = fn(${"$"}n) => ${"$"}n * 2;"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("double", "n")
        }

        @Test
        fun `should extract arrow function with typed parameters`() {
            // Arrange
            val code = """<?php ${"$"}format = fn(string ${"$"}name, int ${"$"}age): string => "${"$"}name is ${"$"}age";"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("format", "name", "age")
        }

        @Test
        fun `should extract arrow function parameter in array_map`() {
            // Arrange
            val code = """<?php array_map(fn(${"$"}item) => ${"$"}item * 2, ${"$"}items);"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("item")
        }
    }

    @Nested
    inner class EnumCaseTests {
        @Test
        fun `should extract enum declaration`() {
            // Arrange
            val code = """
                <?php
                enum Status {
                    case Pending;
                    case Active;
                    case Inactive;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("Status")
        }

        @Test
        fun `should extract backed enum declaration`() {
            // Arrange
            val code = """
                <?php
                enum Status: int {
                    case Pending = 0;
                    case Active = 1;
                    case Inactive = 2;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("Status")
        }

        @Test
        fun `should extract string backed enum`() {
            // Arrange
            val code = """
                <?php
                enum Color: string {
                    case Red = 'red';
                    case Green = 'green';
                    case Blue = 'blue';
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("Color")
        }
    }

    @Nested
    inner class InterfaceConstantTests {
        @Test
        fun `should extract interface constant`() {
            // Arrange
            val code = """
                <?php
                interface Configurable {
                    public const DEFAULT_VALUE = 100;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("Configurable", "DEFAULT_VALUE")
        }

        @Test
        fun `should extract multiple interface constants`() {
            // Arrange
            val code = """
                <?php
                interface Settings {
                    public const MIN_VALUE = 0;
                    public const MAX_VALUE = 100;
                    public const DEFAULT_TIMEOUT = 30;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly(
                "Settings",
                "MIN_VALUE",
                "MAX_VALUE",
                "DEFAULT_TIMEOUT"
            )
        }

        @Test
        fun `should extract interface method declarations`() {
            // Arrange
            val code = """
                <?php
                interface Repository {
                    public function find(${"$"}id);
                    public function save(${"$"}entity);
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly(
                "Repository",
                "find",
                "id",
                "save",
                "entity"
            )
        }
    }

    @Nested
    inner class AttributeTests {
        @Test
        fun `should extract attribute names`() {
            // Arrange
            val code = """
                <?php
                #[Route("/api")]
                #[Inject]
                class Controller { }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            // Order: class is visited first, then its child attribute nodes
            assertThat(result.identifiers).containsExactly("Controller", "Route", "Inject")
        }

        @Test
        fun `should extract attribute with namespace`() {
            // Arrange
            val code = """
                <?php
                #[Symfony\Component\Routing\Annotation\Route("/users")]
                class UserController { }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            // Order: class is visited first, then its child attribute nodes
            assertThat(result.identifiers).containsExactly("UserController", "Route")
        }

        @Test
        fun `should extract method attribute`() {
            // Arrange
            val code = """
                <?php
                class Controller {
                    #[Get("/users")]
                    public function index() { }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            // Order: class first, then method, then method's attributes
            assertThat(result.identifiers).containsExactly("Controller", "index", "Get")
        }

        @Test
        fun `should extract multiple attributes on same declaration`() {
            // Arrange
            val code = """
                <?php
                #[Attribute1]
                #[Attribute2("value")]
                function myFunction() { }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            // Order: function is visited first, then its child attribute nodes
            assertThat(result.identifiers).containsExactly("myFunction", "Attribute1", "Attribute2")
        }
    }

    @Nested
    inner class UseStatementTests {
        @Test
        fun `should extract use statement class name`() {
            // Arrange
            val code = """
                <?php
                use App\Services\UserService;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("UserService")
        }

        @Test
        fun `should extract use statement alias`() {
            // Arrange
            val code = """
                <?php
                use App\Models\User as UserModel;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("UserModel")
        }

        @Test
        fun `should extract multiple use statements`() {
            // Arrange
            val code = """
                <?php
                use App\Services\UserService;
                use App\Models\User as UserModel;
                use App\Contracts\Repository;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("UserService", "UserModel", "Repository")
        }

        @Test
        fun `should extract function use statement`() {
            // Arrange
            val code = """
                <?php
                use function App\Helpers\formatDate;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("formatDate")
        }

        @Test
        fun `should extract const use statement`() {
            // Arrange
            val code = """
                <?php
                use const App\Config\DEFAULT_TIMEOUT;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("DEFAULT_TIMEOUT")
        }
    }

    @Nested
    inner class TraitUseAdaptationTests {
        @Test
        fun `should extract trait use alias`() {
            // Arrange
            val code = """
                <?php
                class MyClass {
                    use TraitA {
                        TraitA::oldMethod as newMethod;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("MyClass", "newMethod")
        }

        @Test
        fun `should extract trait use with visibility change`() {
            // Arrange
            val code = """
                <?php
                class MyClass {
                    use TraitA {
                        TraitA::privateMethod as public publicMethod;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("MyClass", "publicMethod")
        }

        @Test
        fun `should extract multiple trait aliases`() {
            // Arrange
            val code = """
                <?php
                class MyClass {
                    use TraitA, TraitB {
                        TraitA::method as methodA;
                        TraitB::method as methodB;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("MyClass", "methodA", "methodB")
        }

        @Test
        fun `should extract trait visibility only change without alias`() {
            // Arrange - visibility change without renaming
            val code = """
                <?php
                class MyClass {
                    use TraitA {
                        TraitA::privateMethod as public;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert - no alias name to extract, just the class
            assertThat(result.identifiers).containsExactly("MyClass")
        }

        @Test
        fun `should handle trait insteadof clause`() {
            // Arrange - insteadof doesn't create aliases
            val code = """
                <?php
                class MyClass {
                    use TraitA, TraitB {
                        TraitA::method insteadof TraitB;
                        TraitB::otherMethod as renamedMethod;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert - only the renamed method should be extracted
            assertThat(result.identifiers).containsExactly("MyClass", "renamedMethod")
        }

        @Test
        fun `should extract trait use without adaptations`() {
            // Arrange - simple trait use without any adaptations
            val code = """
                <?php
                class MyClass {
                    use TraitA, TraitB;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert - just the class name
            assertThat(result.identifiers).containsExactly("MyClass")
        }
    }

    @Nested
    inner class ClosureUseTests {
        @Test
        fun `should extract closure use variable`() {
            // Arrange
            val code = """
                <?php
                ${"$"}callback = function() use (${"$"}captured) {
                    return ${"$"}captured;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("callback", "captured")
        }

        @Test
        fun `should extract multiple closure use variables`() {
            // Arrange
            val code = """
                <?php
                ${"$"}handler = function(${"$"}input) use (${"$"}config, ${"$"}logger, &${"$"}counter) {
                    return ${"$"}input;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("handler", "input", "config", "logger", "counter")
        }

        @Test
        fun `should extract closure use with reference`() {
            // Arrange
            val code = """
                <?php
                ${"$"}incrementer = function() use (&${"$"}count) {
                    ${"$"}count++;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("incrementer", "count")
        }

        @Test
        fun `should handle closure without use clause`() {
            // Arrange
            val code = """
                <?php
                ${"$"}simple = function(${"$"}x) {
                    return ${"$"}x * 2;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert - just the variable and parameter
            assertThat(result.identifiers).containsExactly("simple", "x")
        }

        @Test
        fun `should handle nested closures with use clauses`() {
            // Arrange
            val code = """
                <?php
                ${"$"}outer = function() use (${"$"}outerVar) {
                    ${"$"}inner = function() use (${"$"}innerVar) {
                        return ${"$"}innerVar;
                    };
                    return ${"$"}inner;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("outer", "outerVar", "inner", "innerVar")
        }

        @Test
        fun `should handle arrow function without use clause`() {
            // Arrange - arrow functions auto-capture, no use clause
            val code = """
                <?php
                ${"$"}captured = 10;
                ${"$"}arrow = fn(${"$"}x) => ${"$"}x + ${"$"}captured;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert - arrow functions don't have use clauses
            assertThat(result.identifiers).containsExactly("captured", "arrow", "x")
        }
    }

    @Nested
    inner class GlobalVariableTests {
        @Test
        fun `should extract global variable declaration`() {
            // Arrange
            val code = """
                <?php
                function example() {
                    global ${"$"}config;
                    return ${"$"}config;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("example", "config")
        }

        @Test
        fun `should extract multiple global variables`() {
            // Arrange
            val code = """
                <?php
                function setup() {
                    global ${"$"}db, ${"$"}cache, ${"$"}logger;
                    return true;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("setup", "db", "cache", "logger")
        }

        @Test
        fun `should extract multiple global statements`() {
            // Arrange
            val code = """
                <?php
                function process() {
                    global ${"$"}config;
                    global ${"$"}logger;
                    return true;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("process", "config", "logger")
        }

        @Test
        fun `should extract global in nested function`() {
            // Arrange
            val code = """
                <?php
                function outer() {
                    global ${"$"}outerGlobal;
                    ${"$"}inner = function() {
                        global ${"$"}innerGlobal;
                        return ${"$"}innerGlobal;
                    };
                    return ${"$"}inner;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("outer", "outerGlobal", "inner", "innerGlobal")
        }

        @Test
        fun `should handle function without global statement`() {
            // Arrange
            val code = """
                <?php
                function simple(${"$"}param) {
                    return ${"$"}param * 2;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("simple", "param")
        }
    }

    @Nested
    inner class ListDestructuringTests {
        @Test
        fun `should extract list assignment variables`() {
            // Arrange
            val code = """
                <?php
                list(${"$"}first, ${"$"}second) = ${"$"}array;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("first", "second")
        }

        @Test
        fun `should extract short array destructuring variables`() {
            // Arrange
            val code = """
                <?php
                [${"$"}a, ${"$"}b, ${"$"}c] = ${"$"}values;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("a", "b", "c")
        }

        @Test
        fun `should extract keyed list destructuring`() {
            // Arrange
            val code = """
                <?php
                ['name' => ${"$"}userName, 'email' => ${"$"}userEmail] = ${"$"}user;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("userName", "userEmail")
        }

        @Test
        fun `should extract nested destructuring`() {
            // Arrange
            val code = """
                <?php
                [${"$"}first, [${"$"}nestedA, ${"$"}nestedB]] = ${"$"}data;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("first", "nestedA", "nestedB")
        }

        @Test
        fun `should handle list with skipped elements`() {
            // Arrange - using commas to skip elements
            val code = """
                <?php
                [${"$"}first, , ${"$"}third] = ${"$"}array;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("first", "third")
        }

        @Test
        fun `should handle deeply nested list`() {
            // Arrange
            val code = """
                <?php
                [${"$"}a, [${"$"}b, [${"$"}c, ${"$"}d]]] = ${"$"}data;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("a", "b", "c", "d")
        }

        @Test
        fun `should handle mixed keyed and indexed destructuring`() {
            // Arrange
            val code = """
                <?php
                ['name' => ${"$"}name, 0 => ${"$"}first, 'email' => ${"$"}email] = ${"$"}user;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("name", "first", "email")
        }

        @Test
        fun `should handle list with reference variables`() {
            // Arrange
            val code = """
                <?php
                [${"$"}value, &${"$"}reference] = ${"$"}array;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("value", "reference")
        }

        @Test
        fun `should handle list function syntax`() {
            // Arrange - old list() syntax
            val code = """
                <?php
                list(${"$"}red, ${"$"}green, ${"$"}blue) = ${"$"}colors;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("red", "green", "blue")
        }

        @Test
        fun `should handle empty list`() {
            // Arrange - edge case: empty destructuring
            val code = """
                <?php
                [] = ${"$"}array;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).isEmpty()
        }

        @Test
        fun `should handle foreach with list destructuring`() {
            // Arrange
            val code = """
                <?php
                foreach (${"$"}users as [${"$"}id, ${"$"}name]) {
                    echo ${"$"}name;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.identifiers).containsExactly("id", "name")
        }
    }

    @Nested
    inner class ImportStringTests {
        @Test
        fun `should not extract include path strings`() {
            // Arrange
            val code = """<?php include 'header.php';"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.strings).isEmpty()
        }

        @Test
        fun `should not extract require path strings`() {
            // Arrange
            val code = """<?php require "config.php";"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.strings).isEmpty()
        }

        @Test
        fun `should not extract include_once path strings`() {
            // Arrange
            val code = """<?php include_once 'functions.php';"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.strings).isEmpty()
        }

        @Test
        fun `should not extract require_once path strings`() {
            // Arrange
            val code = """<?php require_once 'bootstrap.php';"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.strings).isEmpty()
        }

        @Test
        fun `should still extract regular strings alongside includes`() {
            // Arrange
            val code = """
                <?php
                require 'config.php';
                ${"$"}message = "Hello World";
                ${"$"}greeting = 'Welcome';
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.strings).containsExactly("Hello World", "Welcome")
        }

        @Test
        fun `should handle mixed includes and regular strings`() {
            // Arrange
            val code = """
                <?php
                require 'config.php';
                include_once 'header.php';
                ${"$"}appName = "MyApp";
                require_once 'footer.php';
                ${"$"}version = '1.0.0';
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.PHP)

            // Assert
            assertThat(result.strings).containsExactly("MyApp", "1.0.0")
        }
    }

    @Nested
    inner class APITests {
        @Test
        fun `should report extraction is supported for PHP`() {
            assertThat(TreeSitterExtraction.isExtractionSupported(Language.PHP)).isTrue()
            assertThat(TreeSitterExtraction.isExtractionSupported(".php")).isTrue()
        }

        @Test
        fun `should return PHP in supported languages`() {
            // Act & Assert
            assertThat(TreeSitterExtraction.isExtractionSupported(Language.PHP)).isTrue()
        }

        @Test
        fun `should return php in supported extensions`() {
            // Act & Assert
            assertThat(TreeSitterExtraction.isExtractionSupported(".php")).isTrue()
        }
    }
}
