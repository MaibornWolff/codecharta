package de.maibornwolff.treesitter.excavationsite.languages.csharp

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
class CSharpExtractionTest {
    @ParameterizedTest
    @MethodSource("typeDeclarationCases")
    fun `should extract type declaration identifiers`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun typeDeclarationCases() = listOf(
        argumentSet("extract class declaration identifier", "public class UserService {}", listOf("UserService")),
        argumentSet("extract interface declaration identifier", "public interface IOrderRepository {}", listOf("IOrderRepository")),
        argumentSet("extract struct declaration identifier", "public struct Point {}", listOf("Point")),
        argumentSet(
            "extract enum declaration and members",
            """
                public enum Status {
                    Pending,
                    Active,
                    Completed
                }
            """.trimIndent(),
            listOf("Status", "Pending", "Active", "Completed")
        ),
        argumentSet("extract record declaration identifier", "public record User(string Name, int Age);", listOf("User", "Name", "Age")),
        argumentSet(
            "extract delegate declaration identifier",
            "public delegate void EventHandler(object sender);",
            listOf("EventHandler", "sender")
        ),
        argumentSet(
            "extract identifiers from complex class",
            """
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
            """.trimIndent(),
            listOf(
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
        ),
        argumentSet(
            "handle nested classes",
            """
                public class Outer {
                    class Inner {
                        class Innermost {
                            string value;
                        }
                    }
                }
            """.trimIndent(),
            listOf("Outer", "Inner", "Innermost", "value")
        ),
        argumentSet(
            "handle deeply nested classes",
            """
                public class A {
                    class B {
                        class C {
                            class D {
                                string value;
                            }
                        }
                    }
                }
            """.trimIndent(),
            listOf("A", "B", "C", "D", "value")
        ),
        argumentSet(
            "handle record with primary constructor",
            """
                public record Person(string FirstName, string LastName) {
                    public string FullName => FirstName + LastName;
                }
            """.trimIndent(),
            listOf("Person", "FirstName", "LastName", "FullName")
        ),
        argumentSet("handle record struct", "public record struct Point(int X, int Y);", listOf("Point", "X", "Y")),
        argumentSet(
            "handle partial class",
            """
                public partial class Example {
                    private string partOne;
                }
            """.trimIndent(),
            listOf("Example", "partOne")
        ),
        argumentSet(
            "handle abstract class and method",
            """
                public abstract class Example {
                    public abstract void Process(string input);
                }
            """.trimIndent(),
            listOf("Example", "Process", "input")
        ),
        argumentSet(
            "handle global using statement",
            """
                global using System;
                public class Example {}
            """.trimIndent(),
            listOf("Example")
        ),
        argumentSet(
            "handle file-scoped namespace",
            """
                namespace MyNamespace;
                public class Example {
                    string value;
                }
            """.trimIndent(),
            listOf("Example", "value")
        )
    )

    @ParameterizedTest
    @MethodSource("memberCases")
    fun `should extract member identifiers`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun memberCases() = listOf(
        argumentSet(
            "extract method declaration identifier",
            """
                public class Example {
                    public void ProcessOrder() {}
                }
            """.trimIndent(),
            listOf("Example", "ProcessOrder")
        ),
        argumentSet(
            "extract constructor declaration identifier",
            """
                public class User {
                    public User() {}
                }
            """.trimIndent(),
            listOf("User", "User")
        ),
        argumentSet(
            "extract property declaration identifier",
            """
                public class Customer {
                    public string Name { get; set; }
                }
            """.trimIndent(),
            listOf("Customer", "Name")
        ),
        argumentSet(
            "extract field declaration identifiers",
            """
                public class Customer {
                    private string _customerName;
                    private int _customerAge;
                }
            """.trimIndent(),
            listOf("Customer", "_customerName", "_customerAge")
        ),
        argumentSet(
            "extract event declaration identifier",
            """
                public class Publisher {
                    public event EventHandler OnSaved;
                }
            """.trimIndent(),
            listOf("Publisher", "OnSaved")
        ),
        argumentSet(
            "handle indexer declaration",
            """
                public class Example {
                    public string this[int index] {
                        get { return items[index]; }
                        set { items[index] = value; }
                    }
                }
            """.trimIndent(),
            listOf("Example", "index")
        ),
        argumentSet(
            "handle async method",
            """
                public class Example {
                    public async Task<string> FetchDataAsync(string url) {
                        return await GetAsync(url);
                    }
                }
            """.trimIndent(),
            listOf("Example", "FetchDataAsync", "url")
        ),
        argumentSet(
            "handle expression-bodied method",
            """
                public class Example {
                    public int Double(int x) => x * 2;
                }
            """.trimIndent(),
            listOf("Example", "Double", "x")
        ),
        argumentSet(
            "handle expression-bodied property",
            """
                public class Example {
                    private string firstName;
                    private string lastName;
                    public string FullName => firstName + lastName;
                }
            """.trimIndent(),
            listOf("Example", "firstName", "lastName", "FullName")
        ),
        argumentSet(
            "handle init-only property",
            """
                public class Example {
                    public string Name { get; init; }
                }
            """.trimIndent(),
            listOf("Example", "Name")
        ),
        argumentSet(
            "handle explicit interface implementation",
            """
                public class Example : IDisposable {
                    void IDisposable.Dispose() {}
                }
            """.trimIndent(),
            listOf("Example", "Dispose")
        ),
        argumentSet(
            "handle operator overload",
            """
                public class Vector {
                    public int X;
                    public static Vector operator +(Vector a, Vector b) {
                        return new Vector();
                    }
                }
            """.trimIndent(),
            listOf("Vector", "X", "a", "b")
        ),
        argumentSet(
            "handle implicit and explicit conversion operators",
            """
                public class Meter {
                    public double Value;
                    public static implicit operator double(Meter m) => m.Value;
                    public static explicit operator Meter(double d) => new Meter();
                }
            """.trimIndent(),
            listOf("Meter", "Value", "m", "d")
        ),
        argumentSet(
            "handle finalizer",
            """
                public class Example {
                    ~Example() {
                        Cleanup();
                    }
                }
            """.trimIndent(),
            listOf("Example")
        ),
        argumentSet(
            "handle partial method",
            """
                public partial class Example {
                    partial void OnChanged(string value);
                }
            """.trimIndent(),
            listOf("Example", "OnChanged", "value")
        ),
        argumentSet(
            "handle virtual and override methods",
            """
                public class Base {
                    public virtual void Execute(string cmd) {}
                }
                public class Derived : Base {
                    public override void Execute(string cmd) {}
                }
            """.trimIndent(),
            listOf("Base", "Execute", "cmd", "Derived", "Execute", "cmd")
        ),
        argumentSet(
            "handle readonly field",
            """
                public class Example {
                    public readonly string Id;
                    public Example(string id) {
                        Id = id;
                    }
                }
            """.trimIndent(),
            listOf("Example", "Id", "Example", "id")
        ),
        argumentSet(
            "handle volatile field",
            """
                public class Example {
                    private volatile bool isRunning;
                }
            """.trimIndent(),
            listOf("Example", "isRunning")
        ),
        argumentSet(
            "handle nullable reference types",
            """
                public class Example {
                    string? nullableName;
                    int? nullableAge;
                }
            """.trimIndent(),
            listOf("Example", "nullableName", "nullableAge")
        )
    )

    @ParameterizedTest
    @MethodSource("parameterCases")
    fun `should extract parameter identifiers`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun parameterCases() = listOf(
        argumentSet(
            "extract parameter identifiers",
            """
                public class OrderService {
                    public void Save(Order order, Customer customer) {}
                }
            """.trimIndent(),
            listOf("OrderService", "Save", "order", "customer")
        ),
        argumentSet(
            "handle params parameter",
            """
                public class Example {
                    void Process(string first, params string[] rest) {}
                }
            """.trimIndent(),
            listOf("Example", "Process", "rest", "first")
        ),
        argumentSet(
            "handle out and ref parameters",
            """
                public class Example {
                    void Process(out int result, ref string data) {}
                }
            """.trimIndent(),
            listOf("Example", "Process", "result", "data")
        ),
        argumentSet(
            "handle extension method parameter",
            """
                public static class Extensions {
                    public static int WordCount(this string str) {
                        return str.Split(' ').Length;
                    }
                }
            """.trimIndent(),
            listOf("Extensions", "WordCount", "str")
        ),
        argumentSet(
            "handle attribute on parameter",
            """
                public class Example {
                    void Test([NotNull] string input) {}
                }
            """.trimIndent(),
            listOf("Example", "Test", "input")
        )
    )

    @ParameterizedTest
    @MethodSource("localVariableCases")
    fun `should extract local variable identifiers`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun localVariableCases() = listOf(
        argumentSet(
            "extract local variable declaration identifiers",
            """
                public class Example {
                    public void Calculate() {
                        int orderTotal = 0;
                        var customerCount = 10;
                    }
                }
            """.trimIndent(),
            listOf("Example", "Calculate", "orderTotal", "customerCount")
        ),
        argumentSet(
            "handle multiple variable declarations",
            """
                public class Example {
                    void Test() {
                        int a = 1, b = 2, c = 3;
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "a")
        ),
        argumentSet(
            "handle traditional for loop variable",
            """
                public class Example {
                    void Test() {
                        for (int i = 0; i < 10; i++) {
                            Process(i);
                        }
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "i")
        ),
        argumentSet(
            "extract foreach loop variable",
            """
                public class Example {
                    void Test() {
                        foreach (var item in items) {
                            Process(item);
                        }
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "item")
        ),
        argumentSet(
            "extract typed foreach loop variable",
            """
                public class Example {
                    void Test() {
                        foreach (string name in names) {
                            Process(name);
                        }
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "name")
        ),
        argumentSet(
            "extract catch clause exception variable",
            """
                public class Example {
                    void Test() {
                        try {
                            RiskyOperation();
                        } catch (Exception ex) {
                            Handle(ex);
                        }
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "ex")
        ),
        argumentSet(
            "extract multiple catch block variables",
            """
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
            """.trimIndent(),
            listOf("Example", "Test", "io", "sql", "ex")
        ),
        argumentSet(
            "extract using declaration variable",
            """
                public class Example {
                    void Test() {
                        using var stream = new FileStream("file", FileMode.Open);
                        Read(stream);
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "stream")
        ),
        argumentSet(
            "handle try-catch-finally with using",
            """
                public class Example {
                    void Test() {
                        using (var input = Open()) {
                            Read(input);
                        }
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "input")
        ),
        argumentSet(
            "handle tuple deconstruction",
            """
                public class Example {
                    void Test() {
                        var (name, age) = GetPerson();
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "name", "age")
        ),
        argumentSet(
            "handle nested tuple deconstruction",
            """
                public class Example {
                    void Test() {
                        var ((x, y), z) = GetNested();
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "x", "y", "z", "x", "y")
        ),
        argumentSet(
            "handle ref local variable",
            """
                public class Example {
                    void Test() {
                        int value = 10;
                        ref int refValue = ref value;
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "value", "refValue")
        ),
        argumentSet(
            "handle local function",
            """
                public class Example {
                    void Test() {
                        int LocalFunction(int x) {
                            return x * 2;
                        }
                        var result = LocalFunction(5);
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "LocalFunction", "x", "result")
        ),
        argumentSet(
            "handle static local function",
            """
                public class Example {
                    void Test() {
                        static int Add(int a, int b) => a + b;
                        var result = Add(1, 2);
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "Add", "a", "b", "result")
        ),
        argumentSet(
            "handle fixed statement",
            """
                public class Example {
                    unsafe void Test() {
                        fixed (int* ptr = array) {
                            Process(ptr);
                        }
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test")
        ),
        argumentSet(
            "handle lock statement",
            """
                public class Example {
                    private object lockObj = new object();
                    void Test() {
                        lock (lockObj) {
                            Process();
                        }
                    }
                }
            """.trimIndent(),
            listOf("Example", "lockObj", "Test")
        ),
        argumentSet(
            "handle stackalloc expression",
            """
                public class Example {
                    void Test() {
                        Span<int> numbers = stackalloc int[10];
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "numbers")
        ),
        argumentSet(
            "handle checked and unchecked expressions",
            """
                public class Example {
                    void Test() {
                        int checkedResult = checked(a + b);
                        int uncheckedResult = unchecked(c * d);
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "checkedResult", "uncheckedResult")
        ),
        argumentSet(
            "handle nameof expression in string",
            """
                public class Example {
                    void Validate(string param) {
                        if (param == null)
                            throw new ArgumentNullException(nameof(param));
                    }
                }
            """.trimIndent(),
            listOf("Example", "Validate", "param")
        ),
        argumentSet(
            "handle typeof expression",
            """
                public class Example {
                    void Test() {
                        var type = typeof(string);
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "type")
        )
    )

    @ParameterizedTest
    @MethodSource("lambdaCases")
    fun `should extract lambda parameters`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun lambdaCases() = listOf(
        argumentSet(
            "extract lambda parameter",
            """
                public class Example {
                    void Test() {
                        list.ForEach(item => Process(item));
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "item")
        ),
        argumentSet(
            "extract typed lambda parameters",
            """
                public class Example {
                    void Test() {
                        list.Select((string str) => str.ToUpper());
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "str")
        ),
        argumentSet(
            "extract multiple lambda parameters",
            """
                public class Example {
                    void Test() {
                        dict.ForEach((key, value) => Process(key, value));
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "key", "value")
        ),
        argumentSet(
            "extract lambda with no parameters",
            """
                public class Example {
                    void Test() {
                        Action a = () => DoSomething();
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "a")
        ),
        argumentSet(
            "handle nested lambdas",
            """
                public class Example {
                    void Test() {
                        list
                            .Select(outer => inner => Process(outer, inner));
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "outer", "inner")
        ),
        argumentSet(
            "handle chained method calls with lambdas",
            """
                public class Example {
                    void Test() {
                        list
                            .Where(item => item.IsValid())
                            .Select(valid => valid.Transform())
                            .ToList();
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "item", "valid")
        )
    )

    @ParameterizedTest
    @MethodSource("genericTypeParameterCases")
    fun `should extract generic type parameters`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun genericTypeParameterCases() = listOf(
        argumentSet("extract generic type parameter", "public class Box<T> {}", listOf("Box", "T")),
        argumentSet(
            "extract constrained generic type parameter",
            "public class Container<T> where T : IComparable<T> {}",
            listOf("Container", "T")
        ),
        argumentSet("extract multiple generic type parameters", "public class Pair<TKey, TValue> {}", listOf("Pair", "TKey", "TValue")),
        argumentSet(
            "extract method generic type parameter",
            """
                public class Example {
                    public T Transform<T>(object input) { return default; }
                }
            """.trimIndent(),
            listOf("Example", "Transform", "T", "input")
        ),
        argumentSet(
            "handle generic class with multiple constraints",
            """
                public class Example<T, U>
                    where T : class, new()
                    where U : struct { }
            """.trimIndent(),
            listOf("Example", "T", "U")
        ),
        argumentSet(
            "handle generic method with constraints",
            """
                public class Example {
                    public T Create<T>() where T : new() {
                        return new T();
                    }
                }
            """.trimIndent(),
            listOf("Example", "Create", "T")
        ),
        argumentSet(
            "handle covariant and contravariant type parameters",
            """
                public interface IProducer<out T> {
                    T Produce();
                }
                public interface IConsumer<in T> {
                    void Consume(T item);
                }
            """.trimIndent(),
            listOf("IProducer", "T", "Produce", "IConsumer", "T", "Consume", "item")
        )
    )

    @ParameterizedTest
    @MethodSource("patternMatchingCases")
    fun `should extract pattern variables`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun patternMatchingCases() = listOf(
        argumentSet(
            "extract is pattern variable",
            """
                public class Example {
                    void Test(object obj) {
                        if (obj is string str) {
                            Process(str);
                        }
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "obj", "str")
        ),
        argumentSet(
            "not extract from is expression without pattern variable",
            """
                public class Example {
                    void Test(object obj) {
                        if (obj is string) {
                            Process();
                        }
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "obj")
        ),
        argumentSet(
            "extract switch expression pattern variable",
            """
                public class Example {
                    int Test(object obj) {
                        return obj switch {
                            int num => num + 1,
                            string text => text.Length,
                            _ => 0
                        };
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "obj", "num", "text")
        ),
        argumentSet(
            "extract case pattern variable",
            """
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
            """.trimIndent(),
            listOf("Example", "Test", "obj", "num", "text")
        ),
        argumentSet(
            "handle discard in pattern",
            """
                public class Example {
                    void Test(object obj) {
                        if (obj is string _) {
                            Process();
                        }
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "obj")
        )
    )

    @ParameterizedTest
    @MethodSource("commentCases")
    fun `should extract comment text`(code: String, expectedComments: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.comments).containsExactlyElementsOf(expectedComments)
    }

    fun commentCases() = listOf(
        argumentSet("extract single line comment", "// This is a comment\npublic class Example {}", listOf("This is a comment")),
        argumentSet(
            "extract block comment",
            """
                /* This is a
                   block comment */
                public class Example {}
            """.trimIndent(),
            listOf("This is a\nblock comment")
        ),
        argumentSet(
            "extract xml documentation comment",
            """
                /// <summary>
                /// Documentation for the class
                /// </summary>
                public class Example {}
            """.trimIndent(),
            listOf("<summary>", "Documentation for the class", "</summary>")
        ),
        argumentSet(
            "extract multiple comments",
            """
                // First comment
                public class Example {
                    // Second comment
                    void Method() {}
                }
            """.trimIndent(),
            listOf("First comment", "Second comment")
        )
    )

    @ParameterizedTest
    @MethodSource("stringCases")
    fun `should extract string literals`(code: String, expectedStrings: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.strings).containsExactlyElementsOf(expectedStrings)
    }

    fun stringCases() = listOf(
        argumentSet(
            "extract string literal",
            """
                public class Example {
                    string message = "Hello World";
                }
            """.trimIndent(),
            listOf("Hello World")
        ),
        argumentSet(
            "extract verbatim string literal",
            """
                public class Example {
                    string path = @"C:\Users\Documents";
                }
            """.trimIndent(),
            listOf("C:\\Users\\Documents")
        ),
        argumentSet(
            "extract interpolated string",
            """
                public class Example {
                    void Test(string name) {
                        var msg = ${"$"}"Hello {name}";
                    }
                }
            """.trimIndent(),
            listOf("Hello {name}")
        ),
        argumentSet(
            "extract multiple strings",
            """
                public class Example {
                    string first = "Hello";
                    string second = "World";
                }
            """.trimIndent(),
            listOf("Hello", "World")
        ),
        argumentSet(
            "extract string from method argument",
            """
                public class Example {
                    void Test() {
                        Console.WriteLine("Test message");
                    }
                }
            """.trimIndent(),
            listOf("Test message")
        )
    )

    @ParameterizedTest
    @MethodSource("identifierAndStringCases")
    fun `should extract identifiers and strings side by side`(
        code: String,
        expectedIdentifiers: List<String>,
        expectedStrings: List<String>
    ) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
        assertThat(result.strings).containsExactlyElementsOf(expectedStrings)
    }

    fun identifierAndStringCases() = listOf(
        argumentSet(
            "extract using statement variable",
            """
                public class Example {
                    void Test() {
                        using (var stream = new FileStream("file", FileMode.Open)) {
                            Read(stream);
                        }
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "stream"),
            listOf("file")
        ),
        argumentSet(
            "not extract string from inside comments",
            """
                public class Example {
                    // string notExtracted = "hidden";
                    /* string alsoHidden = "invisible"; */
                }
            """.trimIndent(),
            listOf("Example"),
            emptyList<String>()
        ),
        argumentSet(
            "handle string with escaped quotes",
            """
                public class Example {
                    string escaped = "He said \"hello\"";
                }
            """.trimIndent(),
            listOf("Example", "escaped"),
            listOf("He said \\\"hello\\\"")
        ),
        argumentSet(
            "handle static and instance constructors",
            """
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
            """.trimIndent(),
            listOf("Example", "staticField", "instanceField", "Example", "Example"),
            listOf("init", "init")
        ),
        argumentSet(
            "handle switch with when clause",
            """
                public class Example {
                    string Test(object obj) {
                        return obj switch {
                            int num when num > 0 => "positive",
                            int num => "non-positive",
                            _ => "unknown"
                        };
                    }
                }
            """.trimIndent(),
            listOf("Example", "Test", "obj", "num", "num"),
            listOf("positive", "non-positive", "unknown")
        ),
        argumentSet(
            "handle default parameter value",
            """
                public class Example {
                    void Process(string name = "default", int count = 0) {}
                }
            """.trimIndent(),
            listOf("Example", "Process", "name", "count"),
            listOf("default")
        ),
        argumentSet(
            "handle sealed class and method",
            """
                public sealed class Example {
                    public sealed override string ToString() {
                        return "Example";
                    }
                }
            """.trimIndent(),
            listOf("Example", "ToString"),
            listOf("Example")
        ),
        argumentSet(
            "handle const field",
            """
                public class Example {
                    public const string DefaultName = "Unknown";
                    public const int MaxCount = 100;
                }
            """.trimIndent(),
            listOf("Example", "DefaultName", "MaxCount"),
            listOf("Unknown")
        ),
        argumentSet(
            "handle unicode identifiers",
            """
                public class Héllo {
                    string größe = "size";
                    void naïve() {}
                }
            """.trimIndent(),
            listOf("Héllo", "größe", "naïve"),
            listOf("size")
        ),
        argumentSet(
            "handle verbatim identifier",
            """
                public class Example {
                    string @class = "reserved";
                    void @if(string @event) {}
                }
            """.trimIndent(),
            listOf("Example", "@class", "@if", "@event"),
            listOf("reserved")
        )
    )

    @ParameterizedTest
    @MethodSource("separatedContextCases")
    fun `should keep identifiers, comments and strings apart`(
        code: String,
        expectedIdentifiers: List<String>,
        expectedComments: List<String>,
        expectedStrings: List<String>
    ) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
        assertThat(result.comments).containsExactlyElementsOf(expectedComments)
        assertThat(result.strings).containsExactlyElementsOf(expectedStrings)
    }

    fun separatedContextCases() = listOf(
        argumentSet("handle empty source code", "", emptyList<String>(), emptyList<String>(), emptyList<String>()),
        argumentSet(
            "correctly categorize extracted items by context",
            """
                // Comment about the class
                public class Example {
                    string name = "test";
                }
            """.trimIndent(),
            listOf("Example", "name"),
            listOf("Comment about the class"),
            listOf("test")
        ),
        argumentSet(
            "not extract comment text from inside strings",
            """
                public class Example {
                    string code = "// this is not a comment";
                    string block = "/* also not a comment */";
                }
            """.trimIndent(),
            listOf("Example", "code", "block"),
            emptyList<String>(),
            listOf("// this is not a comment", "/* also not a comment */")
        ),
        argumentSet("handle empty class body", "public class Empty { }", listOf("Empty"), emptyList<String>(), emptyList<String>())
    )

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
}
