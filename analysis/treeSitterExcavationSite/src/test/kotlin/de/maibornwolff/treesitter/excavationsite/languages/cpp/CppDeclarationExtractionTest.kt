package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CppDeclarationExtractionTest {
    @Test
    fun `should extract function definition identifier`() {
        // Arrange
        val code = """
            void processOrder() {
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("processOrder")
    }

    @Test
    fun `should extract function with return type and parameters`() {
        // Arrange
        val code = """
            int calculateTotal(int count, float price) {
                return count * price;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("calculateTotal", "count", "price")
    }

    @Test
    fun `should extract method definition identifier`() {
        // Arrange - method defined outside class with qualified name
        val code = """
            void UserService::processOrder() {
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("processOrder")
    }

    @Test
    fun `should extract class specifier identifier`() {
        // Arrange
        val code = """
            class UserService {
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("UserService")
    }

    @Test
    fun `should extract class with members`() {
        // Arrange
        val code = """
            class Order {
            public:
                int orderId;
                std::string customerName;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("Order", "orderId", "customerName")
    }

    @Test
    fun `should extract struct specifier identifier`() {
        // Arrange
        val code = """
            struct Point {
                int x;
                int y;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("Point", "x", "y")
    }

    @Test
    fun `should extract enum specifier identifier`() {
        // Arrange
        val code = """
            enum Status {
                PENDING,
                ACTIVE
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("Status", "PENDING", "ACTIVE")
    }

    @Test
    fun `should extract enum class identifier`() {
        // Arrange
        val code = """
            enum class OrderStatus {
                PENDING,
                PROCESSING,
                SHIPPED
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("OrderStatus", "PENDING", "PROCESSING", "SHIPPED")
    }

    @Test
    fun `should extract namespace definition identifier`() {
        // Arrange
        val code = """
            namespace orders {
                int count;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("orders", "count")
    }

    @Test
    fun `should extract variable declaration identifier`() {
        // Arrange
        val code = """
            int orderCount;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("orderCount")
    }

    @Test
    fun `should extract initialized variable declaration`() {
        // Arrange
        val code = """
            int orderCount = 10;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("orderCount")
    }

    @Test
    fun `should extract pointer variable declaration`() {
        // Arrange
        val code = """
            int* orderPtr;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("orderPtr")
    }

    @Test
    fun `should extract reference variable declaration`() {
        // Arrange
        val code = """
            void process(int& orderRef) {
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("process", "orderRef")
    }

    @Test
    fun `should extract constexpr variable`() {
        // Arrange
        val code = """
            constexpr int MAX_SIZE = 100;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("MAX_SIZE")
    }

    @Test
    fun `should extract field declaration identifier`() {
        // Arrange
        val code = """
            class Order {
                std::string customerName;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("Order", "customerName")
    }

    @Test
    fun `should extract parameter identifiers`() {
        // Arrange
        val code = """
            void process(int orderId, std::string customerName) {
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("process", "orderId", "customerName")
    }

    @Test
    fun `should extract using declaration name`() {
        // Arrange
        val code = "using std::cout;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("cout")
    }

    @Test
    fun `should extract multiple using declarations`() {
        // Arrange
        val code = """
            using std::cout;
            using std::endl;
            using std::vector;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("cout", "endl", "vector")
    }

    @Test
    fun `should extract friend class name`() {
        // Arrange
        val code = """
            class MyClass {
                friend class OtherClass;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("MyClass", "OtherClass")
    }

    @Test
    fun `should extract friend function name`() {
        // Arrange
        val code = """
            class MyClass {
                friend void helperFunction();
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("MyClass", "helperFunction")
    }

    @Test
    fun `should extract friend function with parameters`() {
        // Arrange
        val code = """
            class Data {
                friend bool compare(const Data& a, const Data& b);
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("Data", "compare", "a", "b")
    }

    @Test
    fun `should extract using alias identifier`() {
        // Arrange
        val code = """
            using UserId = int;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("UserId")
    }

    @Test
    fun `should extract identifiers from complex class`() {
        // Arrange
        val code = """
            class OrderService {
            public:
                OrderService();
                void processOrder(int orderId);
            private:
                int orderCount;
                std::string serviceName;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "OrderService",
            "OrderService",
            "processOrder",
            "orderId",
            "orderCount",
            "serviceName"
        )
    }

    @Test
    fun `should handle empty source code`() {
        // Arrange
        val code = ""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).isEmpty()
        assertThat(result.comments).isEmpty()
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should extract using from deeply nested namespace`() {
        // Arrange
        val code = "using std::chrono::high_resolution_clock;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("high_resolution_clock")
    }

    @Test
    fun `should extract using in namespace block`() {
        // Arrange
        val code = """
            namespace myns {
                using std::string;
                using std::vector;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("myns", "string", "vector")
    }

    @Test
    fun `should extract friend struct name`() {
        // Arrange
        val code = """
            class A {
                friend struct B;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("A", "B")
    }

    @Test
    fun `should handle friend with nested class`() {
        // Arrange
        val code = """
            class Container {
                class Inner { };
                friend class Helper;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("Container", "Inner", "Helper")
    }

    @Test
    fun `should extract destructor name without tilde`() {
        // Arrange
        val code = """
            class Resource {
                ~Resource() { }
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("Resource", "Resource")
    }

    @Test
    fun `should extract virtual destructor`() {
        // Arrange
        val code = """
            class Base {
                virtual ~Base() = default;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("Base", "Base")
    }

    @Test
    fun `should extract static member variable`() {
        // Arrange
        val code = """
            class Counter {
                static int count;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("Counter", "count")
    }

    @Test
    fun `should extract static constexpr member`() {
        // Arrange
        val code = """
            class Config {
                static constexpr int MAX_SIZE = 100;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("Config", "MAX_SIZE")
    }

    @Test
    fun `should extract const member function`() {
        // Arrange
        val code = """
            class Data {
                int getValue() const { return value; }
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("Data", "getValue")
    }

    @Test
    fun `should extract pointer to pointer variable`() {
        // Arrange
        val code = "int** doublePtr;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("doublePtr")
    }

    @Test
    fun `should extract array of pointers`() {
        // Arrange
        val code = "int* ptrArray[10];"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("ptrArray")
    }

    @Test
    fun `should extract pointer to function parameter`() {
        // Arrange
        val code = "void process(int (*callback)(int, int)) { }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("process", "callback")
    }

    @Test
    fun `should extract nested namespace identifiers`() {
        // Arrange
        val code = """
            namespace outer {
                namespace inner {
                    int value;
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("outer", "inner", "value")
    }

    @Test
    fun `should extract inline namespace`() {
        // Arrange
        val code = """
            inline namespace v1 {
                void api() { }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("v1", "api")
    }

    @Test
    fun `should extract anonymous namespace content`() {
        // Arrange
        val code = """
            namespace {
                int privateVar;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("privateVar")
    }

    @Test
    fun `should extract from function with trailing return type`() {
        // Arrange
        val code = "auto add(int a, int b) -> int { return a + b; }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("add", "a", "b")
    }

    @Test
    fun `should extract from noexcept function`() {
        // Arrange
        val code = "void safe() noexcept { }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("safe")
    }

    @Test
    fun `should extract from deleted function`() {
        // Arrange
        val code = """
            class NonCopyable {
                NonCopyable(const NonCopyable&) = delete;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("NonCopyable", "NonCopyable")
    }

    @Test
    fun `should extract from defaulted function`() {
        // Arrange
        val code = """
            class Simple {
                Simple() = default;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("Simple", "Simple")
    }
}
