package de.maibornwolff.treesitter.excavationsite.languages.csharp

import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.api.UsedType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class CSharpDependencyTest {
    @Nested
    inner class NamespaceExtraction {
        @Test
        fun `should extract file-scoped namespace path`() {
            // Arrange
            val code = """
                namespace My.Great.Namespace;

                public class MyClass {}
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.packagePath).containsExactly("My", "Great", "Namespace")
        }

        @Test
        fun `should extract single-segment file-scoped namespace`() {
            // Arrange
            val code = """
                namespace MyNamespace;

                public class MyClass {}
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.packagePath).containsExactly("MyNamespace")
        }

        @Test
        fun `should return empty package path when no namespace declaration`() {
            // Arrange
            val code = "public class MyClass {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.packagePath).isEmpty()
        }

        @Test
        fun `should extract file-scoped namespace when traditional namespaces also present`() {
            // Arrange
            val code = """
                namespace My.FileScoped;

                public class MyClass {}
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.packagePath).containsExactly("My", "FileScoped")
        }

        @Test
        fun `should extract traditional namespace as package path`() {
            // Arrange
            val code = """
                namespace My.Traditional.Namespace {
                    public class MyClass {}
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.packagePath).containsExactly("My", "Traditional", "Namespace")
        }

        @Test
        fun `should extract file-scoped namespace inside preprocessor directive`() {
            // Arrange
            val code = """
                #if NET6_0_OR_GREATER
                namespace System.Threading;

                public class Lock {}
                #endif
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.packagePath).containsExactly("System", "Threading")
        }

        @Test
        fun `should extract namespace and parentPath for declarations inside preprocessor directive`() {
            // Arrange
            val code = """
                #if SOME_CONDITION
                namespace My.Namespace;

                public class MyClass {
                    public void DoSomething() {}
                }
                #endif
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.packagePath).containsExactly("My", "Namespace")
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("MyClass")
            assertThat(result.declarations[0].parentPath).containsExactly("My", "Namespace")
        }

        @Test
        fun `should extract nested traditional namespaces as aggregated parentPath`() {
            // Arrange
            val code = """
                namespace Outer {
                    namespace Inner {
                        public class MyClass {}
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("MyClass")
            assertThat(result.declarations[0].parentPath).containsExactly("Outer", "Inner")
        }

        @Test
        fun `should aggregate deeply nested traditional namespaces into parentPath`() {
            // Arrange
            val code = """
                namespace A.B {
                    namespace C {
                        namespace D.E {
                            public class MyClass {}
                        }
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("MyClass")
            assertThat(result.declarations[0].parentPath).containsExactly("A", "B", "C", "D", "E")
        }

        @Test
        fun `should extract namespace for class with access modifier split across preprocessor directives`() {
            // Arrange
            val code = """
                #if SOME_CONDITION
                namespace My.Namespace;

                #if OTHER_CONDITION
                internal
                #else
                public
                #endif
                sealed class Outer {
                    public class Inner { }
                }
                #endif
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.packagePath).containsExactly("My", "Namespace")
            assertThat(result.declarations).hasSize(2)
            assertThat(result.declarations[0].name).isEqualTo("Outer")
            assertThat(result.declarations[0].parentPath).containsExactly("My", "Namespace")
            assertThat(result.declarations[1].name).isEqualTo("Inner")
            assertThat(result.declarations[1].parentPath).containsExactly("My", "Namespace", "Outer")
        }

        @Test
        fun `should extract first traditional namespace when multiple exist`() {
            // Arrange
            val code = """
                namespace NamespaceA {
                    public class ClassA {}
                }
                namespace NamespaceB {
                    public class ClassB {}
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.packagePath).containsExactly("NamespaceA")
        }

        @Test
        fun `should leave parentPath empty for global-scope declaration coexisting with traditional namespace`() {
            // Arrange
            val code = """
                public class GlobalClass {}

                namespace My.Namespace {
                    public class ScopedClass {}
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.declarations).hasSize(2)
            val global = result.declarations.first { it.name == "GlobalClass" }
            val scoped = result.declarations.first { it.name == "ScopedClass" }
            assertThat(global.parentPath).isEmpty()
            assertThat(scoped.parentPath).containsExactly("My", "Namespace")
        }
    }

    @Nested
    inner class UsingDirectiveExtraction {
        @Test
        fun `should extract single using directive`() {
            // Arrange
            val code = """
                using System;

                public class MyClass {}
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly("System")
            assertThat(result.imports[0].isWildcard).isTrue()
        }

        @Test
        fun `should extract multiple using directives`() {
            // Arrange
            val code = """
                using System;
                using System.Collections.Generic;
                using Microsoft.Extensions.Options;

                public class MyClass {}
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.imports).hasSize(3)
            assertThat(result.imports[0].path).containsExactly("System")
            assertThat(result.imports[1].path).containsExactly("System", "Collections", "Generic")
            assertThat(result.imports[2].path).containsExactly("Microsoft", "Extensions", "Options")
            assertThat(result.imports).allMatch { it.isWildcard }
        }

        @Test
        fun `should extract namespace-scoped using directives with namespacePath`() {
            // Arrange
            val code = """
                namespace MyNamespace {
                    using Microsoft.Extensions.Options;

                    public class MyClass {}
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly("Microsoft", "Extensions", "Options")
            assertThat(result.imports[0].isWildcard).isTrue()
            assertThat(result.imports[0].namespacePath).containsExactly("MyNamespace")
        }

        @Test
        fun `should set empty namespacePath for global using directives`() {
            // Arrange
            val code = """
                using System;

                namespace MyNamespace {
                    using Microsoft.Extensions.Options;

                    public class MyClass {}
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.imports).hasSize(2)
            assertThat(result.imports[0].path).containsExactly("System")
            assertThat(result.imports[0].namespacePath).isEmpty()
            assertThat(result.imports[1].path).containsExactly("Microsoft", "Extensions", "Options")
            assertThat(result.imports[1].namespacePath).containsExactly("MyNamespace")
        }

        @Test
        fun `should scope using directives to their namespace only`() {
            // Arrange
            val code = """
                namespace NamespaceA {
                    using System;
                    using Microsoft.Extensions.Options;

                    public class ClassA {}
                }

                namespace NamespaceB {
                    public class ClassB {}
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.imports).hasSize(2)
            assertThat(result.imports).allMatch { it.namespacePath == listOf("NamespaceA") }
        }

        @Test
        fun `should extract aliased using directives`() {
            // Arrange
            val code = """
                using Alias = System.Collections.Generic;

                public class MyClass {}
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly("System", "Collections", "Generic")
            assertThat(result.imports[0].isWildcard).isTrue()
        }

        @Test
        fun `should return empty imports when no using directives`() {
            // Arrange
            val code = "public class MyClass {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.imports).isEmpty()
        }

        @Test
        fun `should extract using directive inside nested namespace with aggregated namespacePath`() {
            // Arrange
            val code = """
                namespace Outer {
                    namespace Inner {
                        using Microsoft.Extensions.Options;

                        public class MyClass {}
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly("Microsoft", "Extensions", "Options")
            assertThat(result.imports[0].namespacePath).containsExactly("Outer", "Inner")
        }

        @Test
        fun `should extract using directive inside namespace wrapped in preprocessor directive`() {
            // Arrange
            val code = """
                #if SOME_CONDITION
                namespace My.Namespace {
                    using Microsoft.Extensions.Options;

                    public class MyClass {}
                }
                #endif
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly("Microsoft", "Extensions", "Options")
            assertThat(result.imports[0].namespacePath).containsExactly("My", "Namespace")
        }
    }

    @Nested
    inner class DeclarationExtraction {
        @Test
        fun `should extract class declaration`() {
            // Arrange
            val code = """
                namespace MyNamespace;

                public class MyClass {}
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("MyClass")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.CLASS)
        }

        @Test
        fun `should extract struct declaration`() {
            // Arrange
            val code = """
                namespace MyNamespace;

                public struct MyStruct {}
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("MyStruct")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.CLASS)
        }

        @Test
        fun `should extract record declaration`() {
            // Arrange
            val code = """
                namespace MyNamespace;

                public record MyRecord(string Name);
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("MyRecord")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.RECORD)
        }

        @Test
        fun `should extract interface declaration`() {
            // Arrange
            val code = """
                namespace MyNamespace;

                public interface IMyInterface {}
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("IMyInterface")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.INTERFACE)
        }

        @Test
        fun `should extract enum declaration`() {
            // Arrange
            val code = """
                namespace MyNamespace;

                public enum MyEnum { A, B }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("MyEnum")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.ENUM)
        }

        @Test
        fun `should extract delegate declaration`() {
            // Arrange
            val code = """
                namespace MyNamespace;

                public delegate void MyDelegate(int x);
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("MyDelegate")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.INTERFACE)
        }

        @Test
        fun `should extract multiple declarations`() {
            // Arrange
            val code = """
                namespace MyNamespace;

                public class MyClass {}
                public interface IMyInterface {}
                public enum MyEnum { A }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.declarations).hasSize(3)
            assertThat(result.declarations.map { it.name }).containsExactly("MyClass", "IMyInterface", "MyEnum")
            assertThat(result.declarations.map { it.type }).containsExactly(
                DeclarationType.CLASS,
                DeclarationType.INTERFACE,
                DeclarationType.ENUM
            )
        }

        @Test
        fun `should extract declarations from traditional namespace with parentPath`() {
            // Arrange
            val code = """
                namespace My.Traditional.Namespace {
                    public class MyClass {}
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("MyClass")
            assertThat(result.declarations[0].parentPath).containsExactly("My", "Traditional", "Namespace")
        }

        @Test
        fun `should extract declarations from file-scoped namespace with parentPath`() {
            // Arrange
            val code = """
                namespace My.FileScoped;

                public class MyClass {}
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("MyClass")
            assertThat(result.declarations[0].parentPath).containsExactly("My", "FileScoped")
        }

        @Test
        fun `should extract declarations from multiple namespaces with correct parentPaths`() {
            // Arrange
            val code = """
                namespace NamespaceA {
                    public class ClassA {}
                }

                namespace NamespaceB {
                    public class ClassB {}
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.declarations).hasSize(2)
            assertThat(result.declarations[0].name).isEqualTo("ClassA")
            assertThat(result.declarations[0].parentPath).containsExactly("NamespaceA")
            assertThat(result.declarations[1].name).isEqualTo("ClassB")
            assertThat(result.declarations[1].parentPath).containsExactly("NamespaceB")
        }

        @Test
        fun `should extract nested declarations in traditional namespace with combined parentPath`() {
            // Arrange
            val code = """
                namespace My.Traditional {
                    public class Outer {
                        public class Inner {}
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.declarations).hasSize(2)
            assertThat(result.declarations[0].name).isEqualTo("Outer")
            assertThat(result.declarations[0].parentPath).containsExactly("My", "Traditional")
            assertThat(result.declarations[1].name).isEqualTo("Inner")
            assertThat(result.declarations[1].parentPath).containsExactly("My", "Traditional", "Outer")
        }

        @Test
        fun `should extract nested declarations with parentPath`() {
            // Arrange
            val code = """
                namespace MyNamespace;

                public class Outer {
                    public class Inner {}
                    public enum InnerEnum { X }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.declarations).hasSize(3)
            assertThat(result.declarations[0].name).isEqualTo("Outer")
            assertThat(result.declarations[0].parentPath).containsExactly("MyNamespace")
            assertThat(result.declarations[1].name).isEqualTo("Inner")
            assertThat(result.declarations[1].parentPath).containsExactly("MyNamespace", "Outer")
            assertThat(result.declarations[2].name).isEqualTo("InnerEnum")
            assertThat(result.declarations[2].parentPath).containsExactly("MyNamespace", "Outer")
        }

        @Test
        fun `should extract deeply nested declarations with full parentPath chain`() {
            // Arrange
            val code = """
                namespace MyNamespace;

                public class Outer {
                    public class Middle {
                        public class Inner {}
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.declarations).hasSize(3)
            assertThat(result.declarations[0].name).isEqualTo("Outer")
            assertThat(result.declarations[0].parentPath).containsExactly("MyNamespace")
            assertThat(result.declarations[1].name).isEqualTo("Middle")
            assertThat(result.declarations[1].parentPath).containsExactly("MyNamespace", "Outer")
            assertThat(result.declarations[2].name).isEqualTo("Inner")
            assertThat(result.declarations[2].parentPath).containsExactly("MyNamespace", "Outer", "Middle")
        }

        @Test
        fun `should return empty declarations when no type declarations`() {
            // Arrange
            val code = """
                namespace MyNamespace;
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            assertThat(result.declarations).isEmpty()
        }
    }

    @Nested
    inner class UsedTypeExtraction {
        @Nested
        inner class ConstructorParameters {
            @Test
            fun `should extract constructor parameter types`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    public class MyClass {
                        public MyClass(string name, IService service) { }
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).containsExactlyInAnyOrder(
                    UsedType("string"),
                    UsedType("IService")
                )
            }

            @Test
            fun `should extract primary constructor parameter types`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    public class MyClass(int id, ILogger logger) { }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).containsExactlyInAnyOrder(
                    UsedType("int"),
                    UsedType("ILogger")
                )
            }
        }

        @Nested
        inner class MethodTypes {
            @Test
            fun `should extract method return type and parameter types`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    public class MyClass {
                        public string GetName(int id) { return ""; }
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).containsExactlyInAnyOrder(
                    UsedType("string"),
                    UsedType("int")
                )
            }

            @Test
            fun `should extract void return type`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    public class MyClass {
                        public void DoSomething(MyParam param) { }
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).containsExactlyInAnyOrder(
                    UsedType("void"),
                    UsedType("MyParam")
                )
            }
        }

        @Nested
        inner class TypeCasts {
            @Test
            fun `should extract cast expression types`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    public class MyClass {
                        public void Test() { var x = (CastType) obj; }
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).containsExactlyInAnyOrder(
                    UsedType("void"),
                    UsedType("CastType")
                )
            }

            @Test
            fun `should extract as expression types`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    public class MyClass {
                        public void Test() { var x = obj as AsType; }
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).containsExactlyInAnyOrder(
                    UsedType("void"),
                    UsedType("AsType")
                )
            }
        }

        @Nested
        inner class GenericTypes {
            @Test
            fun `should extract generic type arguments`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    public class MyClass {
                        private List<string> _items;
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).containsExactlyInAnyOrder(
                    UsedType("List", listOf(UsedType("string"))),
                    UsedType("string")
                )
            }

            @Test
            fun `should extract generic type constraints`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    public class MyClass<T> where T : IFoobar { }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).containsExactlyInAnyOrder(UsedType("IFoobar"))
            }
        }

        @Nested
        inner class InheritanceTypes {
            @Test
            fun `should extract base class and interface types`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    public class MyClass : BaseClass, IInterface { }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).containsExactlyInAnyOrder(
                    UsedType("BaseClass"),
                    UsedType("IInterface")
                )
            }
        }

        @Nested
        inner class VariableTypes {
            @Test
            fun `should extract field types`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    public class MyClass {
                        private MyFieldType _field;
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).containsExactlyInAnyOrder(UsedType("MyFieldType"))
            }

            @Test
            fun `should filter var from variable types`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    public class MyClass {
                        public void Test() { var x = 42; }
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).noneMatch { it.name == "var" }
            }
        }

        @Nested
        inner class ObjectCreationTypes {
            @Test
            fun `should extract object creation types`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    public class MyClass {
                        public void Test() { var x = new CreatedType(); }
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).containsExactlyInAnyOrder(
                    UsedType("void"),
                    UsedType("CreatedType")
                )
            }
        }

        @Nested
        inner class MemberAccessTypes {
            @Test
            fun `should extract static member access types with uppercase filter`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    public class MyClass {
                        public void Test() { MyStaticType.DoSomething(); }
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).containsExactlyInAnyOrder(
                    UsedType("void"),
                    UsedType("MyStaticType")
                )
            }

            @Test
            fun `should extract chained qualified member access types`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    public class MyClass {
                        public void Test() { var x = Console.Style.Plain; }
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).containsExactlyInAnyOrder(
                    UsedType("void"),
                    UsedType("Console.Style"),
                    UsedType("Console")
                )
            }

            @Test
            fun `should extract member access in null-coalescing expression`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    public class MyClass {
                        public void Test() {
                            Style? value = null;
                            var x = value ?? Spectre.Console.Style.Plain;
                        }
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).containsExactlyInAnyOrder(
                    UsedType("void"),
                    UsedType("Style"),
                    UsedType("Spectre.Console.Style"),
                    UsedType("Spectre.Console"),
                    UsedType("Spectre")
                )
            }

            @Test
            fun `should not extract lowercase member access as type`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    public class MyClass {
                        public void Test() { myVariable.DoSomething(); }
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).noneMatch { it.name == "myVariable" }
            }
        }

        @Nested
        inner class ArrayParameterTypes {
            @Test
            fun `should extract array parameter element type`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    public class MyClass {
                        public void Test(params MyType[] items) { }
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).containsExactlyInAnyOrder(
                    UsedType("void"),
                    UsedType("MyType")
                )
            }
        }

        @Nested
        inner class AttributeTypes {
            @Test
            fun `should extract attribute types with suffix duplication`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    [Obsolete]
                    public class MyClass { }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).containsExactlyInAnyOrder(
                    UsedType("Obsolete"),
                    UsedType("ObsoleteAttribute")
                )
            }

            @Test
            fun `should extract qualified attribute types`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    [System.Diagnostics.CodeAnalysis.SuppressMessage("Category", "Id")]
                    public class MyClass { }
                """.trimIndent()

                // Act

                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).containsExactlyInAnyOrder(
                    UsedType("System.Diagnostics.CodeAnalysis.SuppressMessage"),
                    UsedType("System.Diagnostics.CodeAnalysis.SuppressMessageAttribute")
                )
            }
        }

        @Nested
        inner class IsTypeChecking {
            @Test
            fun `should extract is-pattern expression types`() {
                // Arrange
                val code = """
                    namespace MyNamespace;
                    public class MyClass {
                        public void Test() { if (obj is CheckedType ct) {} }
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

                // Assert
                assertThat(result.declarations[0].usedTypes).containsExactlyInAnyOrder(
                    UsedType("void"),
                    UsedType("CheckedType")
                )
            }
        }

        @Test
        fun `should extract all used type categories in correct order`() {
            // Arrange
            val code = """
                namespace MyNamespace;

                [MyAttribute]
                public class MyClass<T> : BaseClass, IInterface where T : IConstraint {
                    private MyFieldType _field;
                    public MyClass(ParamType param) {}
                    public ReturnType MyMethod(ArgType arg) {
                        var x = new CreatedType();
                        var y = (CastType) obj;
                        var z = obj as AsType;
                        if (obj is CheckedType ct) {}
                        MyStaticType.DoSomething();
                        List<GenericArg> items = null;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

            // Assert
            val usedTypes = result.declarations[0].usedTypes
            assertThat(usedTypes).containsExactly(
                UsedType("ParamType"),
                UsedType("ArgType"),
                UsedType("ReturnType"),
                UsedType("CastType"),
                UsedType("AsType"),
                UsedType("GenericArg"),
                UsedType("IConstraint"),
                UsedType("BaseClass"),
                UsedType("IInterface"),
                UsedType("MyFieldType"),
                UsedType("List", listOf(UsedType("GenericArg"))),
                UsedType("CreatedType"),
                UsedType("MyStaticType"),
                UsedType("MyAttribute"),
                UsedType("MyAttributeAttribute"),
                UsedType("CheckedType")
            )
        }
    }
}
