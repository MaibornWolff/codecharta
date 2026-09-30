package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CppExtractionTest {
    @ParameterizedTest
    @MethodSource("functionCases")
    fun `should extract function and parameter identifiers`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun functionCases() = listOf(
        argumentSet(
            "extract function definition identifier",
            """
                void processOrder() {
                }
            """.trimIndent(),
            listOf("processOrder")
        ),
        argumentSet(
            "extract function with return type and parameters",
            """
                int calculateTotal(int count, float price) {
                    return count * price;
                }
            """.trimIndent(),
            listOf("calculateTotal", "count", "price")
        ),
        argumentSet(
            "extract method definition identifier",
            """
                void UserService::processOrder() {
                }
            """.trimIndent(),
            listOf("processOrder")
        ),
        argumentSet(
            "extract parameter identifiers",
            """
                void process(int orderId, std::string customerName) {
                }
            """.trimIndent(),
            listOf("process", "orderId", "customerName")
        ),
        argumentSet(
            "extract destructor name without tilde",
            """
                class Resource {
                    ~Resource() { }
                };
            """.trimIndent(),
            listOf("Resource", "Resource")
        ),
        argumentSet(
            "extract virtual destructor",
            """
                class Base {
                    virtual ~Base() = default;
                };
            """.trimIndent(),
            listOf("Base", "Base")
        ),
        argumentSet(
            "extract from function with trailing return type",
            "auto add(int a, int b) -> int { return a + b; }",
            listOf("add", "a", "b")
        ),
        argumentSet("extract from noexcept function", "void safe() noexcept { }", listOf("safe")),
        argumentSet(
            "extract from deleted function",
            """
                class NonCopyable {
                    NonCopyable(const NonCopyable&) = delete;
                };
            """.trimIndent(),
            listOf("NonCopyable", "NonCopyable")
        ),
        argumentSet(
            "extract from defaulted function",
            """
                class Simple {
                    Simple() = default;
                };
            """.trimIndent(),
            listOf("Simple", "Simple")
        )
    )

    @ParameterizedTest
    @MethodSource("typeDeclarationCases")
    fun `should extract class, struct and enum identifiers`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun typeDeclarationCases() = listOf(
        argumentSet(
            "extract class specifier identifier",
            """
                class UserService {
                };
            """.trimIndent(),
            listOf("UserService")
        ),
        argumentSet(
            "extract class with members",
            """
                class Order {
                public:
                    int orderId;
                    std::string customerName;
                };
            """.trimIndent(),
            listOf("Order", "orderId", "customerName")
        ),
        argumentSet(
            "extract struct specifier identifier",
            """
                struct Point {
                    int x;
                    int y;
                };
            """.trimIndent(),
            listOf("Point", "x", "y")
        ),
        argumentSet(
            "extract enum specifier identifier",
            """
                enum Status {
                    PENDING,
                    ACTIVE
                };
            """.trimIndent(),
            listOf("Status", "PENDING", "ACTIVE")
        ),
        argumentSet(
            "extract enum class identifier",
            """
                enum class OrderStatus {
                    PENDING,
                    PROCESSING,
                    SHIPPED
                };
            """.trimIndent(),
            listOf("OrderStatus", "PENDING", "PROCESSING", "SHIPPED")
        ),
        argumentSet(
            "extract field declaration identifier",
            """
                class Order {
                    std::string customerName;
                };
            """.trimIndent(),
            listOf("Order", "customerName")
        ),
        argumentSet(
            "extract static member variable",
            """
                class Counter {
                    static int count;
                };
            """.trimIndent(),
            listOf("Counter", "count")
        ),
        argumentSet(
            "extract static constexpr member",
            """
                class Config {
                    static constexpr int MAX_SIZE = 100;
                };
            """.trimIndent(),
            listOf("Config", "MAX_SIZE")
        ),
        argumentSet(
            "extract const member function",
            """
                class Data {
                    int getValue() const { return value; }
                };
            """.trimIndent(),
            listOf("Data", "getValue")
        ),
        argumentSet(
            "extract identifiers from complex class",
            """
                class OrderService {
                public:
                    OrderService();
                    void processOrder(int orderId);
                private:
                    int orderCount;
                    std::string serviceName;
                };
            """.trimIndent(),
            listOf("OrderService", "OrderService", "processOrder", "orderId", "orderCount", "serviceName")
        )
    )

    @ParameterizedTest
    @MethodSource("friendCases")
    fun `should extract friend declaration names`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun friendCases() = listOf(
        argumentSet(
            "extract friend class name",
            """
                class MyClass {
                    friend class OtherClass;
                };
            """.trimIndent(),
            listOf("MyClass", "OtherClass")
        ),
        argumentSet(
            "extract friend function name",
            """
                class MyClass {
                    friend void helperFunction();
                };
            """.trimIndent(),
            listOf("MyClass", "helperFunction")
        ),
        argumentSet(
            "extract friend function with parameters",
            """
                class Data {
                    friend bool compare(const Data& a, const Data& b);
                };
            """.trimIndent(),
            listOf("Data", "compare", "a", "b")
        ),
        argumentSet(
            "extract friend struct name",
            """
                class A {
                    friend struct B;
                };
            """.trimIndent(),
            listOf("A", "B")
        ),
        argumentSet(
            "handle friend with nested class",
            """
                class Container {
                    class Inner { };
                    friend class Helper;
                };
            """.trimIndent(),
            listOf("Container", "Inner", "Helper")
        )
    )

    @ParameterizedTest
    @MethodSource("namespaceCases")
    fun `should extract namespace and using identifiers`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun namespaceCases() = listOf(
        argumentSet(
            "extract namespace definition identifier",
            """
                namespace orders {
                    int count;
                }
            """.trimIndent(),
            listOf("orders", "count")
        ),
        argumentSet(
            "extract nested namespace identifiers",
            """
                namespace outer {
                    namespace inner {
                        int value;
                    }
                }
            """.trimIndent(),
            listOf("outer", "inner", "value")
        ),
        argumentSet(
            "extract inline namespace",
            """
                inline namespace v1 {
                    void api() { }
                }
            """.trimIndent(),
            listOf("v1", "api")
        ),
        argumentSet(
            "extract anonymous namespace content",
            """
                namespace {
                    int privateVar;
                }
            """.trimIndent(),
            listOf("privateVar")
        ),
        argumentSet("extract using declaration name", "using std::cout;", listOf("cout")),
        argumentSet(
            "extract multiple using declarations",
            """
                using std::cout;
                using std::endl;
                using std::vector;
            """.trimIndent(),
            listOf("cout", "endl", "vector")
        ),
        argumentSet(
            "extract using from deeply nested namespace",
            "using std::chrono::high_resolution_clock;",
            listOf("high_resolution_clock")
        ),
        argumentSet(
            "extract using in namespace block",
            """
                namespace myns {
                    using std::string;
                    using std::vector;
                }
            """.trimIndent(),
            listOf("myns", "string", "vector")
        ),
        argumentSet("extract using alias identifier", "using UserId = int;", listOf("UserId"))
    )

    @ParameterizedTest
    @MethodSource("variableCases")
    fun `should extract variable identifiers`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun variableCases() = listOf(
        argumentSet("extract variable declaration identifier", "int orderCount;", listOf("orderCount")),
        argumentSet("extract initialized variable declaration", "int orderCount = 10;", listOf("orderCount")),
        argumentSet("extract pointer variable declaration", "int* orderPtr;", listOf("orderPtr")),
        argumentSet(
            "extract reference variable declaration",
            """
                void process(int& orderRef) {
                }
            """.trimIndent(),
            listOf("process", "orderRef")
        ),
        argumentSet("extract constexpr variable", "constexpr int MAX_SIZE = 100;", listOf("MAX_SIZE")),
        argumentSet("extract pointer to pointer variable", "int** doublePtr;", listOf("doublePtr")),
        argumentSet("extract array of pointers", "int* ptrArray[10];", listOf("ptrArray")),
        argumentSet("extract pointer to function parameter", "void process(int (*callback)(int, int)) { }", listOf("process", "callback"))
    )

    @ParameterizedTest
    @MethodSource("structuredBindingCases")
    fun `should extract structured binding variables`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun structuredBindingCases() = listOf(
        argumentSet("extract structured binding variables", "auto [x, y, z] = getPoint();", listOf("x", "y", "z")),
        argumentSet("extract structured binding with const ref", "const auto& [name, age] = person;", listOf("name", "age")),
        argumentSet("extract structured binding from pair", "auto [first, second] = std::make_pair(1, 2);", listOf("first", "second")),
        argumentSet(
            "extract structured binding in for loop",
            """
                for (auto [key, value] : map) {
                    process(key, value);
                }
            """.trimIndent(),
            listOf("key", "value")
        ),
        argumentSet(
            "extract structured binding inside function",
            """
                void process() {
                    auto [a, b] = getPair();
                }
            """.trimIndent(),
            listOf("process", "a", "b")
        ),
        argumentSet(
            "extract structured binding with many variables",
            "auto [a, b, c, d, e] = getTuple();",
            listOf("a", "b", "c", "d", "e")
        ),
        argumentSet(
            "extract structured binding in if statement",
            """
                void check() {
                    if (auto [success, value] = tryGet(); success) { }
                }
            """.trimIndent(),
            listOf("check", "success", "value")
        ),
        argumentSet("extract structured binding with volatile qualifier", "volatile auto [x, y] = getData();", listOf("x", "y"))
    )

    @ParameterizedTest
    @MethodSource("templateCases")
    fun `should extract template identifiers`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun templateCases() = listOf(
        argumentSet(
            "extract template class identifier",
            """
                template<typename T>
                class Container {
                };
            """.trimIndent(),
            listOf("T", "Container")
        ),
        argumentSet(
            "extract template function identifier",
            """
                template<typename T>
                T process(T value) {
                    return value;
                }
            """.trimIndent(),
            listOf("T", "process", "value")
        ),
        argumentSet("extract template type parameters", "template<typename T, typename U> class Pair { };", listOf("T", "U", "Pair")),
        argumentSet("extract template non-type parameter", "template<int N> struct Array { };", listOf("N", "Array")),
        argumentSet(
            "extract template with class keyword",
            """
                template<class Container>
                void process(const Container& c) { }
            """.trimIndent(),
            listOf("Container", "process", "c")
        ),
        argumentSet(
            "extract template with default parameter",
            "template<typename T, typename U = int> class Map { };",
            listOf("T", "U", "Map")
        ),
        argumentSet("extract variadic template parameter", "template<typename... Args> void print(Args... args) { }", listOf("print")),
        argumentSet(
            "extract multiple template parameters with mixed types",
            "template<typename T, int N, typename U> struct Buffer { };",
            listOf("T", "N", "U", "Buffer")
        ),
        argumentSet(
            "extract template parameters from nested template",
            """
                template<typename T>
                class Outer {
                    template<typename U>
                    void inner(U val) { }
                };
            """.trimIndent(),
            listOf("T", "Outer", "U", "inner", "val")
        ),
        argumentSet("handle template specialization", "template<> class Specialized<int> { };", emptyList<String>()),
        argumentSet(
            "extract partial template specialization",
            """
                template<typename T>
                class Container<T*> { };
            """.trimIndent(),
            listOf("T")
        ),
        argumentSet(
            "extract concept definition identifier",
            """
                template<typename T>
                concept Addable = requires(T a, T b) { a + b; };
            """.trimIndent(),
            listOf("T", "Addable", "a", "b")
        )
    )

    @ParameterizedTest
    @MethodSource("loopAndCatchVariableCases")
    fun `should extract range-based for and catch variables`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun loopAndCatchVariableCases() = listOf(
        argumentSet(
            "extract range-based for variable",
            """
                void foo() {
                    for (const auto& item : container) { }
                }
            """.trimIndent(),
            listOf("foo", "item")
        ),
        argumentSet(
            "extract range-based for variable with auto",
            """
                void process(std::vector<int> items) {
                    for (auto val : items) {
                        use(val);
                    }
                }
            """.trimIndent(),
            listOf("process", "items", "val")
        ),
        argumentSet("extract range-based for with pointer", "for (auto* ptr : pointers) { }", listOf("ptr")),
        argumentSet(
            "extract range-based for with explicit type",
            """
                void process() {
                    for (int num : numbers) { }
                }
            """.trimIndent(),
            listOf("process", "num")
        ),
        argumentSet(
            "extract nested range-based for loops",
            """
                void process() {
                    for (auto& row : matrix) {
                        for (auto& cell : row) { }
                    }
                }
            """.trimIndent(),
            listOf("process", "row", "cell")
        ),
        argumentSet(
            "extract range-based for with rvalue reference",
            """
                void process() {
                    for (auto&& item : getItems()) { }
                }
            """.trimIndent(),
            listOf("process", "item")
        ),
        argumentSet(
            "extract catch clause variable",
            """
                try { }
                catch (const std::exception& e) { }
            """.trimIndent(),
            listOf("e")
        ),
        argumentSet(
            "extract multiple catch clause variables",
            """
                try {
                    riskyOperation();
                } catch (const std::runtime_error& runtime) {
                    handle(runtime);
                } catch (const std::exception& ex) {
                    handle(ex);
                }
            """.trimIndent(),
            listOf("runtime", "ex")
        ),
        argumentSet(
            "extract catch clause with pointer parameter",
            """
                try { }
                catch (Exception* exc) { }
            """.trimIndent(),
            listOf("exc")
        ),
        argumentSet(
            "handle catch-all without parameter name",
            """
                try { }
                catch (...) { }
            """.trimIndent(),
            emptyList<String>()
        ),
        argumentSet(
            "extract from nested try-catch",
            """
                try {
                    try { }
                    catch (InnerException& inner) { }
                }
                catch (OuterException& outer) { }
            """.trimIndent(),
            listOf("inner", "outer")
        ),
        argumentSet(
            "extract catch with const value",
            """
                try { }
                catch (const MyException err) { }
            """.trimIndent(),
            listOf("err")
        )
    )

    @ParameterizedTest
    @MethodSource("lambdaCases")
    fun `should extract lambda captures and parameters`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun lambdaCases() = listOf(
        argumentSet("extract lambda variable identifier", "auto handler = [](int x) { return x * 2; };", listOf("handler", "x")),
        argumentSet("extract lambda capture by value", "auto lambda = [x]() { return x; };", listOf("lambda", "x")),
        argumentSet("extract lambda capture by reference", "auto lambda = [&y]() { y++; };", listOf("lambda", "y")),
        argumentSet(
            "extract multiple lambda captures",
            "auto lambda = [x, &y, z]() { return x + y + z; };",
            listOf("lambda", "x", "y", "z")
        ),
        argumentSet("extract lambda capture with initializer", "auto lambda = [ptr = std::move(value)]() { };", listOf("lambda", "ptr")),
        argumentSet("handle default capture by value", "auto lambda = [=]() { return x + y; };", listOf("lambda")),
        argumentSet("handle default capture by reference", "auto lambda = [&]() { x++; };", listOf("lambda")),
        argumentSet("extract mixed capture with defaults", "auto lambda = [=, &specific]() { };", listOf("lambda", "specific")),
        argumentSet("extract capture with reference and copy", "auto lambda = [&, copied]() { };", listOf("lambda", "copied")),
        argumentSet("handle empty lambda capture", "auto lambda = []() { };", listOf("lambda")),
        argumentSet(
            "extract nested lambda captures",
            """
                auto outer = [x]() {
                    auto inner = [y]() { };
                };
            """.trimIndent(),
            listOf("outer", "x", "inner", "y")
        ),
        argumentSet(
            "extract lambda with mutable keyword",
            "auto counter = [count]() mutable { return ++count; };",
            listOf("counter", "count")
        ),
        argumentSet("extract lambda parameters", "auto add = [](int x, int y) { return x + y; };", listOf("add", "x", "y")),
        argumentSet("extract generic lambda parameter", "auto process = [](auto&& item) { use(item); };", listOf("process", "item")),
        argumentSet(
            "extract lambda with captures and parameters",
            "auto closure = [&state](int input) { state += input; };",
            listOf("closure", "state", "input")
        ),
        argumentSet("handle lambda with no parameters", "auto noParams = []() { return 42; };", listOf("noParams")),
        argumentSet(
            "extract lambda with many parameters",
            "auto multiParam = [](int a, int b, int c, int d) { };",
            listOf("multiParam", "a", "b", "c", "d")
        ),
        argumentSet("extract template lambda parameters", "auto generic = []<typename T>(T val) { };", listOf("generic", "T", "val"))
    )

    @ParameterizedTest
    @MethodSource("commentCases")
    fun `should extract comment text`(code: String, expectedComments: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.comments).containsExactlyElementsOf(expectedComments)
    }

    fun commentCases() = listOf(
        argumentSet("extract single line comment", "// This is a comment\nint x;", listOf("This is a comment")),
        argumentSet("extract block comment", "/* This is a block comment */\nint x;", listOf("This is a block comment")),
        argumentSet(
            "extract doxygen comment",
            """
                /**
                 * Calculate the total price.
                 * @param count Number of items
                 */
                int calculate(int count) {
                    return count;
                }
            """.trimIndent(),
            listOf("Calculate the total price.\n@param count Number of items")
        )
    )

    @ParameterizedTest
    @MethodSource("stringCases")
    fun `should extract string and char literals`(code: String, expectedStrings: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.strings).containsExactlyElementsOf(expectedStrings)
    }

    fun stringCases() = listOf(
        argumentSet(
            "extract string literal",
            """
                int main() {
                    std::string message = "Hello World";
                    return 0;
                }
            """.trimIndent(),
            listOf("Hello World")
        ),
        argumentSet(
            "extract raw string literal",
            """
                int main() {
                    std::string message = R"(raw string content)";
                    return 0;
                }
            """.trimIndent(),
            listOf("raw string content")
        ),
        argumentSet(
            "extract raw string literal with delimiter",
            """
                int main() {
                    std::string message = R"delim(content with )parentheses)delim";
                    return 0;
                }
            """.trimIndent(),
            listOf("content with )parentheses")
        ),
        argumentSet(
            "extract char literal",
            """
                int main() {
                    char c = 'A';
                    return 0;
                }
            """.trimIndent(),
            listOf("A")
        )
    )

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
}
