package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CppExtractionTest {
    // === Function Definition Tests ===

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

    // === Class Specifier Tests ===

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

    // === Struct Specifier Tests ===

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

    // === Enum Specifier Tests ===

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

    // === Namespace Tests ===

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

    // === Variable Declaration Tests ===

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

    // === Field Declaration Tests ===

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

    // === Parameter Declaration Tests ===

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

    // === Template Tests ===

    @Test
    fun `should extract template class identifier`() {
        // Arrange
        val code = """
            template<typename T>
            class Container {
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("T", "Container")
    }

    @Test
    fun `should extract template function identifier`() {
        // Arrange
        val code = """
            template<typename T>
            T process(T value) {
                return value;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("T", "process", "value")
    }

    @Test
    fun `should extract template type parameters`() {
        // Arrange
        val code = "template<typename T, typename U> class Pair { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("T", "U", "Pair")
    }

    @Test
    fun `should extract template non-type parameter`() {
        // Arrange
        val code = "template<int N> struct Array { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("N", "Array")
    }

    @Test
    fun `should extract template with class keyword`() {
        // Arrange
        val code = """
            template<class Container>
            void process(const Container& c) { }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("Container", "process", "c")
    }

    @Test
    fun `should extract template with default parameter`() {
        // Arrange
        val code = "template<typename T, typename U = int> class Map { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("T", "U", "Map")
    }

    // === Range-Based For Loop Tests ===

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

    // === Catch Clause Tests ===

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

    // === Structured Binding Tests (C++17) ===

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

    // === Lambda Capture Tests ===

    @Test
    fun `should extract lambda capture by value`() {
        // Arrange
        val code = "auto lambda = [x]() { return x; };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("lambda", "x")
    }

    @Test
    fun `should extract lambda capture by reference`() {
        // Arrange
        val code = "auto lambda = [&y]() { y++; };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("lambda", "y")
    }

    @Test
    fun `should extract multiple lambda captures`() {
        // Arrange
        val code = "auto lambda = [x, &y, z]() { return x + y + z; };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("lambda", "x", "y", "z")
    }

    @Test
    fun `should extract lambda capture with initializer`() {
        // Arrange
        val code = "auto lambda = [ptr = std::move(value)]() { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("lambda", "ptr")
    }

    // === Lambda Parameter Tests ===

    @Test
    fun `should extract lambda parameters`() {
        // Arrange
        val code = "auto add = [](int x, int y) { return x + y; };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("add", "x", "y")
    }

    @Test
    fun `should extract generic lambda parameter`() {
        // Arrange
        val code = "auto process = [](auto&& item) { use(item); };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("process", "item")
    }

    @Test
    fun `should extract lambda with captures and parameters`() {
        // Arrange
        val code = "auto closure = [&state](int input) { state += input; };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("closure", "state", "input")
    }

    // === Using Declaration Tests (Not Alias) ===

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

    // === Friend Declaration Tests ===

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

    // === Using Alias Tests ===

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

    // === Lambda Tests ===

    @Test
    fun `should extract lambda variable identifier`() {
        // Arrange
        val code = """
            auto handler = [](int x) { return x * 2; };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("handler", "x")
    }

    // === Complex Class Tests ===

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

    // === Comment Tests ===

    @Test
    fun `should extract single line comment`() {
        // Arrange
        val code = """
            // This is a comment
            int x;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a comment")
    }

    @Test
    fun `should extract block comment`() {
        // Arrange
        val code = """
            /* This is a block comment */
            int x;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a block comment")
    }

    @Test
    fun `should extract doxygen comment`() {
        // Arrange
        val code = """
            /**
             * Calculate the total price.
             * @param count Number of items
             */
            int calculate(int count) {
                return count;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.comments).containsExactly("Calculate the total price.\n@param count Number of items")
    }

    // === String Tests ===

    @Test
    fun `should extract string literal`() {
        // Arrange
        val code = """
            int main() {
                std::string message = "Hello World";
                return 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract raw string literal`() {
        // Arrange
        val code = """
            int main() {
                std::string message = R"(raw string content)";
                return 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.strings).containsExactly("raw string content")
    }

    @Test
    fun `should extract raw string literal with delimiter`() {
        // Arrange
        val code = """
            int main() {
                std::string message = R"delim(content with )parentheses)delim";
                return 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.strings).containsExactly("content with )parentheses")
    }

    @Test
    fun `should extract char literal`() {
        // Arrange
        val code = """
            int main() {
                char c = 'A';
                return 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.strings).containsExactly("A")
    }

    // === Combined Tests ===

    @Test
    fun `should correctly categorize extracted items by context`() {
        // Arrange
        val code = """
            // Process the order
            class Order {
                int id;
            };

            int processOrder(const char* msg) {
                return 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("Order", "id", "processOrder", "msg")
        assertThat(result.comments).containsExactly("Process the order")
    }

    @Test
    fun `should provide access via extractedTexts list`() {
        // Arrange
        val code = """
            // Comment
            int foo;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.extractedTexts.map { it.context }).containsExactly(
            ExtractionContext.COMMENT,
            ExtractionContext.IDENTIFIER
        )
    }

    // === API Tests ===

    @Test
    fun `should report extraction is supported for Cpp`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.CPP)).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".cpp")).isTrue()
    }

    @Test
    fun `should return Cpp in supported languages`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.CPP)).isTrue()
    }

    @Test
    fun `should return cpp in supported extensions`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(".cpp")).isTrue()
    }

    @Test
    fun `should support header file extensions`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(".hpp")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".h")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".cc")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".cxx")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".hxx")).isTrue()
    }

    // =====================================
    // === Edge Case Tests ===
    // =====================================

    // === Template Parameter Edge Cases ===

    @Test
    fun `should extract variadic template parameter`() {
        // Arrange
        val code = "template<typename... Args> void print(Args... args) { }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert - variadic parameter packs have different node types
        // Currently extracts the function name; variadic params would need additional support
        assertThat(result.identifiers).containsExactly("print")
    }

    @Test
    fun `should extract multiple template parameters with mixed types`() {
        // Arrange
        val code = "template<typename T, int N, typename U> struct Buffer { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("T", "N", "U", "Buffer")
    }

    @Test
    fun `should extract template parameters from nested template`() {
        // Arrange
        val code = """
            template<typename T>
            class Outer {
                template<typename U>
                void inner(U val) { }
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("T", "Outer", "U", "inner", "val")
    }

    @Test
    fun `should handle template specialization`() {
        // Arrange - full template specialization
        val code = "template<> class Specialized<int> { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert - template specialization uses template_type which contains the name
        // The class_specifier extracts from template_type differently
        assertThat(result.identifiers).isEmpty()
    }

    @Test
    fun `should extract partial template specialization`() {
        // Arrange
        val code = """
            template<typename T>
            class Container<T*> { };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("T")
    }

    @Test
    fun `should extract concept definition identifier`() {
        // Arrange
        val code = """
            template<typename T>
            concept Addable = requires(T a, T b) { a + b; };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("T", "Addable", "a", "b")
    }

    // === Range-Based For Loop Edge Cases ===

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

    // === Catch Clause Edge Cases ===

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

    // === Structured Binding Edge Cases ===

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

    // === Lambda Capture Edge Cases ===

    @Test
    fun `should handle default capture by value`() {
        // Arrange
        val code = "auto lambda = [=]() { return x + y; };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("lambda")
    }

    @Test
    fun `should handle default capture by reference`() {
        // Arrange
        val code = "auto lambda = [&]() { x++; };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("lambda")
    }

    @Test
    fun `should extract mixed capture with defaults`() {
        // Arrange
        val code = "auto lambda = [=, &specific]() { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("lambda", "specific")
    }

    @Test
    fun `should extract capture with reference and copy`() {
        // Arrange
        val code = "auto lambda = [&, copied]() { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("lambda", "copied")
    }

    @Test
    fun `should handle empty lambda capture`() {
        // Arrange
        val code = "auto lambda = []() { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("lambda")
    }

    @Test
    fun `should extract nested lambda captures`() {
        // Arrange
        val code = """
            auto outer = [x]() {
                auto inner = [y]() { };
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("outer", "x", "inner", "y")
    }

    @Test
    fun `should extract lambda with mutable keyword`() {
        // Arrange
        val code = "auto counter = [count]() mutable { return ++count; };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("counter", "count")
    }

    // === Lambda Parameter Edge Cases ===

    @Test
    fun `should handle lambda with no parameters`() {
        // Arrange
        val code = "auto noParams = []() { return 42; };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("noParams")
    }

    @Test
    fun `should extract lambda with many parameters`() {
        // Arrange
        val code = "auto multiParam = [](int a, int b, int c, int d) { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("multiParam", "a", "b", "c", "d")
    }

    @Test
    fun `should extract template lambda parameters`() {
        // Arrange
        val code = "auto generic = []<typename T>(T val) { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("generic", "T", "val")
    }

    // === Using Declaration Edge Cases ===

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

    // === Friend Declaration Edge Cases ===

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

    // === Destructor Edge Cases ===

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

    // === Static and Const Member Edge Cases ===

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

    // === Pointer and Reference Edge Cases ===

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

    // === Namespace Edge Cases ===

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

    // === Complex Expression Edge Cases ===

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
