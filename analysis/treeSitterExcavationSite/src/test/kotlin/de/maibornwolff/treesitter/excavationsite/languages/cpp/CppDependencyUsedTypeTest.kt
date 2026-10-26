package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.shared.domain.TypeUsage
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class CppDependencyUsedTypeTest {
    @Test
    fun `should mark a globally qualified type with a leading scope segment`() {
        // Arrange
        val code = "struct U { ::Config config; ::a::b::C deep; a::D relative; };"

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.CPP)

        // Assert
        assertThat(result.declarations.single().usedTypes).containsExactlyInAnyOrder(
            UsedType(name = "Config", namespacePrefix = listOf("::")),
            UsedType(name = "C", namespacePrefix = listOf("::", "a", "b")),
            UsedType(name = "D", namespacePrefix = listOf("a"))
        )
    }

    @Test
    fun `should report no use of a template parameter`() {
        // Arrange
        val code = "template <class Creature, typename U = int, class... Rest> struct Box { Creature c; U u; Speed s; };"

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.CPP)

        // Assert
        assertThat(result.declarations.single().usedTypes.map { it.name }).containsExactly("Speed")
    }

    @Test
    fun `should report no use of a class the enclosing function declares before`() {
        // Arrange
        val code = """
            struct User {
                int count() {
                    Node before{0};
                    struct Node { int local; };
                    Node node{1};
                    return node.local;
                }
            };
        """.trimIndent()

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.CPP)

        // Assert
        assertThat(result.declarations.map { it.name }).containsExactly("User")
        assertThat(result.declarations.single().usedTypes.map { it.name }).containsExactlyInAnyOrder("Node", "int")
    }

    @Test
    fun `should leave the type a member alias names to the alias and give a function alias to its declaration`() {
        // Arrange
        val code = "struct Repo { using Entity = CreatureEntity; void f() { using Row = RowEntity; } };"

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.CPP)

        // Assert
        assertThat(
            result.declarations.single { it.name == "Repo" }.usedTypes.map { it.name }
        ).containsExactlyInAnyOrder("RowEntity", "void")
    }

    @Test
    fun `should report a class tag without a body as a use that declares it in its namespace if nothing visible does`() {
        // Arrange
        val code = "namespace g { struct Nest { struct Roost *held; enum Kind kind; }; }"

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.CPP)

        // Assert
        assertThat(result.declarations.single().usedTypes).containsExactlyInAnyOrder(
            UsedType(name = "Roost", fallbacks = listOf(UsedType(name = "Roost", namespacePrefix = listOf("::", "g")))),
            UsedType(name = "Kind", fallbacks = listOf(UsedType(name = "Kind", namespacePrefix = listOf("::", "g"))))
        )
    }

    @Test
    fun `should report a qualified name in an expression as a use with its qualifier`() {
        // Arrange
        val code = "struct Mover : game::Base { int pace = static_cast<int>(SpeedType::WALKING); int f() { return Speed::MAX; } };"

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.CPP)

        // Assert
        assertThat(result.declarations.single().usedTypes).containsExactlyInAnyOrder(
            UsedType(name = "Base", namespacePrefix = listOf("game"), usage = TypeUsage.INHERITANCE),
            UsedType(name = "WALKING", namespacePrefix = listOf("SpeedType")),
            UsedType(name = "MAX", namespacePrefix = listOf("Speed")),
            UsedType(name = "int")
        )
    }

    @Nested
    inner class Inheritance {
        @Test
        fun `should extract a single public base class as an inherited type`() {
            // Arrange
            val code = """
                class Parent {};
                class Child : public Parent {};
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val child = result.declarations.single { it.name == "Child" }
            assertThat(child.usedTypes).containsExactly(UsedType(name = "Parent", usage = TypeUsage.INHERITANCE))
        }

        @Test
        fun `should extract all base classes of multiple inheritance as inherited types`() {
            // Arrange
            val code = """
                class Child : public Base1, protected Base2 {};
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val child = result.declarations.single { it.name == "Child" }
            assertThat(child.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Base1", usage = TypeUsage.INHERITANCE),
                UsedType(name = "Base2", usage = TypeUsage.INHERITANCE)
            )
        }

        @Test
        fun `should extract a template specialization as an inherited type and its argument as a use`() {
            // Arrange
            val code = """
                class Child : public Base<int> {};
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val child = result.declarations.single { it.name == "Child" }
            assertThat(child.usedTypes).containsExactly(
                UsedType(name = "Base", genericTypes = listOf(UsedType(name = "int")), usage = TypeUsage.INHERITANCE)
            )
        }
    }

    @Nested
    inner class MethodReturnAndParameterTypes {
        @Test
        fun `should extract method return type and parameter types`() {
            // Arrange
            val code = """
                class Service {
                    Result doWork(Input arg, Other o) {}
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val svc = result.declarations.single { it.name == "Service" }
            assertThat(svc.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Result"),
                UsedType(name = "Input"),
                UsedType(name = "Other")
            )
        }

        @Test
        fun `should extract param types from pure method declaration in header`() {
            // Arrange
            val code = """
                class Service {
                    Result process(Input arg, Other o);
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val svc = result.declarations.single { it.name == "Service" }
            assertThat(svc.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Result"),
                UsedType(name = "Input"),
                UsedType(name = "Other")
            )
        }

        @Test
        fun `should extract trailing return type`() {
            // Arrange
            val code = """
                class Service {
                    auto doWork() -> Foo {}
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val svc = result.declarations.single { it.name == "Service" }
            assertThat(svc.usedTypes).containsExactly(UsedType(name = "Foo"))
        }
    }

    @Nested
    inner class TypeAliases {
        @Test
        fun `should give the type a member typedef names to the alias`() {
            // Arrange
            val code = """
                class Container {
                    typedef Foo Bar;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            val alias = result.declarations.single { it.name == "Bar" }
            assertThat(container.usedTypes).isEmpty()
            assertThat(alias.usedTypes).containsExactly(UsedType(name = "Foo"))
        }

        @Test
        fun `should give the template type a member typedef names to the alias`() {
            // Arrange
            val code = """
                class Container {
                    typedef Vec<Foo> Items;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            val alias = result.declarations.single { it.name == "Items" }
            assertThat(container.usedTypes).isEmpty()
            assertThat(alias.usedTypes).containsExactly(UsedType(name = "Vec", genericTypes = listOf(UsedType(name = "Foo"))))
        }

        @Test
        fun `should give the type a member using alias names to the alias`() {
            // Arrange
            val code = """
                class Container {
                    using Bar = Foo;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            val alias = result.declarations.single { it.name == "Bar" }
            assertThat(container.usedTypes).isEmpty()
            assertThat(alias.usedTypes).containsExactly(UsedType(name = "Foo"))
        }

        @Test
        fun `should give the template type a member using alias names to the alias`() {
            // Arrange
            val code = """
                class Container {
                    using Items = Vec<Foo>;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            val alias = result.declarations.single { it.name == "Items" }
            assertThat(container.usedTypes).isEmpty()
            assertThat(alias.usedTypes).containsExactly(UsedType(name = "Vec", genericTypes = listOf(UsedType(name = "Foo"))))
        }
    }

    @Nested
    inner class TemplateConstraints {
        @Test
        fun `should extract type from requires clause on template class`() {
            // Arrange
            val code = """
                template<typename T>
                requires Foo<T>
                class Container {};
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactly(
                UsedType(name = "Foo")
            )
        }

        @Test
        fun `should extract both sides of constraint conjunction`() {
            // Arrange
            val code = """
                template<typename T>
                requires Foo<T> && Bar<T>
                class Container {};
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Foo"),
                UsedType(name = "Bar")
            )
        }

        @Test
        fun `should extract both sides of constraint disjunction`() {
            // Arrange
            val code = """
                template<typename T>
                requires Foo<T> || Bar<T>
                class Container {};
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Foo"),
                UsedType(name = "Bar")
            )
        }
    }

    @Nested
    inner class FieldAndVariableTypes {
        @Test
        fun `should extract type from member field declaration`() {
            // Arrange
            val code = """
                class Container {
                    Foo field_;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactly(UsedType(name = "Foo"))
        }

        @Test
        fun `should extract template type from member field declaration`() {
            // Arrange
            val code = """
                class Container {
                    Vec<Foo> items_;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactly(
                UsedType(name = "Vec", genericTypes = listOf(UsedType(name = "Foo")))
            )
        }

        @Test
        fun `should extract type from local variable declaration inside method body`() {
            // Arrange
            val code = """
                class Container {
                    void doWork() {
                        Foo local;
                    }
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Foo"),
                UsedType(name = "void")
            )
        }

        @Test
        fun `should extract qualified type from member field declaration`() {
            // Arrange — qualified_identifier as a declaration's type (e.g. tinyxml2::XMLDocument doc)
            // is the dominant pattern for std::* and cross-namespace field/var types in real C++.
            val code = """
                class Container {
                    tinyxml2::XMLDocument doc_;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactly(
                UsedType(name = "XMLDocument", namespacePrefix = listOf("tinyxml2"))
            )
        }
    }

    @Nested
    inner class NamespacedTemplateGenerics {
        @Test
        fun `should extract simple generic from namespaced template as nested generic type`() {
            // Arrange — tree-sitter-cpp parses std::list<Foo> as qualified_identifier whose name
            // field is a template_type, not another qualified_identifier. Walker must dispatch
            // through extractTemplateType when the chain exits on a template_type leaf.
            val code = """
                class Container {
                    std::list<Foo> items_;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactly(
                UsedType(name = "list", namespacePrefix = listOf("std"), genericTypes = listOf(UsedType(name = "Foo")))
            )
        }

        @Test
        fun `should extract qualified generic from namespaced template as nested generic type`() {
            // Arrange — the cppcheck exemplar: std::list<ErrorMessage::FileLocation>.
            val code = """
                class Container {
                    std::list<ErrorMessage::FileLocation> callStack_;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactly(
                UsedType(
                    name = "list",
                    namespacePrefix = listOf("std"),
                    genericTypes = listOf(
                        UsedType(name = "FileLocation", namespacePrefix = listOf("ErrorMessage"))
                    )
                )
            )
        }

        @Test
        fun `should extract both type arguments from two-argument namespaced template`() {
            // Arrange
            val code = """
                class Container {
                    std::map<Key, Value> items_;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactly(
                UsedType(
                    name = "map",
                    namespacePrefix = listOf("std"),
                    genericTypes = listOf(UsedType(name = "Key"), UsedType(name = "Value"))
                )
            )
        }

        @Test
        fun `should extract nested namespaced templates recursively`() {
            // Arrange — std::shared_ptr<std::string>: both container and inner are namespaced.
            val code = """
                class Container {
                    std::shared_ptr<std::string> payload_;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactly(
                UsedType(
                    name = "shared_ptr",
                    namespacePrefix = listOf("std"),
                    genericTypes = listOf(
                        UsedType(name = "string", namespacePrefix = listOf("std"))
                    )
                )
            )
        }

        @Test
        fun `should extract namespaced template from method return type`() {
            // Arrange — same pattern when used as a method return type rather than field.
            val code = """
                class Container {
                    std::list<ErrorMessage::FileLocation> getCallStack();
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactly(
                UsedType(
                    name = "list",
                    namespacePrefix = listOf("std"),
                    genericTypes = listOf(
                        UsedType(name = "FileLocation", namespacePrefix = listOf("ErrorMessage"))
                    )
                )
            )
        }
    }

    @Nested
    inner class FriendDeclarations {
        @Test
        fun `should extract friend class type`() {
            // Arrange
            val code = """
                class Container {
                    friend class Tester;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactly(UsedType(name = "Tester"))
        }

        @Test
        fun `should extract qualified friend class type`() {
            // Arrange
            val code = """
                class Container {
                    friend class Outer::Tester;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactly(
                UsedType(name = "Tester", namespacePrefix = listOf("Outer"))
            )
        }
    }

    @Nested
    inner class InClassUsingDeclarations {
        @Test
        fun `should extract base class from using declaration inside class body`() {
            // Arrange
            val code = """
                class Derived : public Base {
                    using Base::method;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val derived = result.declarations.single { it.name == "Derived" }
            assertThat(derived.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Base"),
                UsedType(name = "Base", usage = TypeUsage.INHERITANCE)
            )
        }

        @Test
        fun `should capture namespace prefix on multi-segment qualified using declaration`() {
            // Arrange
            val code = """
                class Derived {
                    using Outer::Inner::method;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val derived = result.declarations.single { it.name == "Derived" }
            assertThat(derived.usedTypes).containsExactly(
                UsedType(name = "Inner", namespacePrefix = listOf("Outer"))
            )
        }

        @Test
        fun `should not extract using declaration nested in member function body as in-class type`() {
            // Arrange — using std::cout is local to doWork's block scope, not Container's class scope.
            val code = """
                class Container {
                    void doWork() {
                        using std::cout;
                    }
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactly(UsedType(name = "void"))
        }
    }

    @Nested
    inner class BoundaryExclusion {
        @Test
        fun `should not leak nested class types into outer used types`() {
            // Arrange
            val code = """
                class Outer {
                    class Inner {
                        Foo innerField;
                    };
                    Bar outerField;
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val outer = result.declarations.single { it.name == "Outer" }
            val inner = result.declarations.single { it.name == "Inner" }
            assertThat(outer.usedTypes).containsExactly(UsedType(name = "Bar"))
            assertThat(inner.usedTypes).containsExactly(UsedType(name = "Foo"))
        }
    }

    @Test
    fun `should extract used types from every category in a comprehensive class`() {
        // Arrange
        val code = """
            class Widget : public Base {
                using BaseAlias = Wrapped;
                typedef Counter Count;
                Field field_;
                friend class Friend;

                Widget() : field_{Init::Value} {}

                Result doWork(Param p) {
                    Local local;
                    auto casted = static_cast<Casted>(local);
                    auto created = new Created();
                    Namespace::helper();
                    auto s = sizeof(Sized*);
                }
            };
        """.trimIndent()

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.CPP)

        // Assert
        val widget = result.declarations.single { it.name == "Widget" }
        assertThat(widget.usedTypes.map { it.name }.toSet()).containsExactlyInAnyOrder(
            "Base",
            "Field",
            "Friend",
            "Result",
            "Param",
            "Local",
            "Casted",
            "Created",
            "Namespace",
            "helper",
            "Sized",
            "Init",
            "Value"
        )
    }
}
