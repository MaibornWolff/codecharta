package de.maibornwolff.treesitter.excavationsite.languages.csharp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CSharpDeclarationExtractionTest {
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
