package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource

class CppMemberUsedTypeDependencyTest {
    @ParameterizedTest
    @MethodSource(
        "inheritanceCases",
        "methodSignatureCases",
        "constructorInitializerCases",
        "typeAliasCases",
        "templateConstraintCases",
        "fieldAndVariableCases",
        "namespacedTemplateCases",
        "friendAndUsingCases"
    )
    fun `should extract used types of class`(code: String, declarationName: String, expectedUsedTypes: List<UsedType>) {
        // Act
        val result = analyzeCpp(code)

        // Assert
        assertThat(result.usedTypesOf(declarationName)).containsExactlyInAnyOrderElementsOf(expectedUsedTypes)
    }

    companion object {
        private val NESTED_CLASS_WITH_FIELDS =
            """
            class Outer {
                class Inner {
                    Foo innerField;
                };
                Bar outerField;
            };
            """.trimIndent()

        @JvmStatic
        fun inheritanceCases(): List<Arguments> = listOf(
            argumentSet(
                "single public base class",
                "class Parent {};\nclass Child : public Parent {};",
                "Child",
                listOf(UsedType(name = "Parent"))
            ),
            argumentSet(
                "all base classes of multiple inheritance",
                "class Child : public Base1, protected Base2 {};",
                "Child",
                listOf(UsedType(name = "Base1"), UsedType(name = "Base2"))
            ),
            argumentSet(
                "template specialization as base class",
                "class Child : public Base<int> {};",
                "Child",
                listOf(UsedType(name = "Base", genericTypes = listOf(UsedType(name = "int"))))
            )
        )

        @JvmStatic
        fun methodSignatureCases(): List<Arguments> = listOf(
            argumentSet(
                "method return type and parameter types",
                "class Service {\n    Result doWork(Input arg, Other o) {}\n};",
                "Service",
                listOf(UsedType(name = "Result"), UsedType(name = "Input"), UsedType(name = "Other"))
            ),
            argumentSet(
                "parameter types of pure method declaration in header",
                "class Service {\n    Result process(Input arg, Other o);\n};",
                "Service",
                listOf(UsedType(name = "Result"), UsedType(name = "Input"), UsedType(name = "Other"))
            ),
            argumentSet(
                "trailing return type",
                "class Service {\n    auto doWork() -> Foo {}\n};",
                "Service",
                listOf(UsedType(name = "Foo"))
            )
        )

        @JvmStatic
        fun constructorInitializerCases(): List<Arguments> = listOf(
            argumentSet(
                "second-to-last segment of qualified constant in brace initializer",
                "class Foo {\n    Foo() : type_{A::B::GLOBAL_CONSTANT} {}\n};",
                "Foo",
                listOf(UsedType(name = "B", namespacePrefix = listOf("A")))
            ),
            argumentSet(
                "single namespace segment of qualified constant in brace initializer",
                "class Foo {\n    Foo() : type_{A::GLOBAL_CONSTANT} {}\n};",
                "Foo",
                listOf(UsedType(name = "A"))
            ),
            argumentSet(
                "qualified identifier in base class argument list",
                """
                    class FooClass : public BarClass {
                        FooClass(int base, int bonus)
                            : BarClass(base, bonus, A::B::C::GLOBAL_CONSTANT) {}
                    };
                """.trimIndent(),
                "FooClass",
                listOf(UsedType(name = "BarClass"), UsedType(name = "C", namespacePrefix = listOf("A", "B")), UsedType(name = "int"))
            ),
            argumentSet(
                "nothing extra for initializer list without qualified identifiers",
                """
                    class FooClass : public BarClass {
                        FooClass(int base, int bonus) : BarClass(base, bonus) {}
                    };
                """.trimIndent(),
                "FooClass",
                listOf(UsedType(name = "BarClass"), UsedType(name = "int"))
            ),
            argumentSet(
                "qualified identifier of nested call expression in argument list",
                "class Foo {\n    Foo() : member_(X::make()) {}\n};",
                "Foo",
                listOf(UsedType(name = "X"), UsedType(name = "make", namespacePrefix = listOf("X")))
            )
        )

        @JvmStatic
        fun typeAliasCases(): List<Arguments> = listOf(
            argumentSet("aliased type of typedef", containerWith("typedef Foo Bar;"), "Container", listOf(UsedType(name = "Foo"))),
            argumentSet(
                "template aliased type of typedef",
                containerWith("typedef Vec<Foo> Items;"),
                "Container",
                listOf(UsedType(name = "Vec", genericTypes = listOf(UsedType(name = "Foo"))))
            ),
            argumentSet("aliased type of using alias", containerWith("using Bar = Foo;"), "Container", listOf(UsedType(name = "Foo"))),
            argumentSet(
                "template aliased type of using alias",
                containerWith("using Items = Vec<Foo>;"),
                "Container",
                listOf(UsedType(name = "Vec", genericTypes = listOf(UsedType(name = "Foo"))))
            )
        )

        @JvmStatic
        fun templateConstraintCases(): List<Arguments> = listOf(
            argumentSet(
                "requires clause on template class",
                "template<typename T>\nrequires Foo<T>\nclass Container {};",
                "Container",
                listOf(UsedType(name = "Foo", genericTypes = listOf(UsedType(name = "T"))))
            ),
            argumentSet(
                "both sides of constraint conjunction",
                "template<typename T>\nrequires Foo<T> && Bar<T>\nclass Container {};",
                "Container",
                listOf(
                    UsedType(name = "Foo", genericTypes = listOf(UsedType(name = "T"))),
                    UsedType(name = "Bar", genericTypes = listOf(UsedType(name = "T")))
                )
            ),
            argumentSet(
                "both sides of constraint disjunction",
                "template<typename T>\nrequires Foo<T> || Bar<T>\nclass Container {};",
                "Container",
                listOf(
                    UsedType(name = "Foo", genericTypes = listOf(UsedType(name = "T"))),
                    UsedType(name = "Bar", genericTypes = listOf(UsedType(name = "T")))
                )
            )
        )

        @JvmStatic
        fun fieldAndVariableCases(): List<Arguments> = listOf(
            argumentSet("member field type", containerWith("Foo field_;"), "Container", listOf(UsedType(name = "Foo"))),
            argumentSet(
                "template member field type",
                containerWith("Vec<Foo> items_;"),
                "Container",
                listOf(UsedType(name = "Vec", genericTypes = listOf(UsedType(name = "Foo"))))
            ),
            argumentSet(
                "qualified member field type",
                containerWith("tinyxml2::XMLDocument doc_;"),
                "Container",
                listOf(UsedType(name = "XMLDocument", namespacePrefix = listOf("tinyxml2")))
            ),
            argumentSet(
                "local variable type inside method body",
                containerMethodWith("Foo local;"),
                "Container",
                listOf(UsedType(name = "Foo"), UsedType(name = "void"))
            ),
            argumentSet(
                "outer class fields without nested class fields",
                NESTED_CLASS_WITH_FIELDS,
                "Outer",
                listOf(UsedType(name = "Bar"))
            ),
            argumentSet("nested class fields", NESTED_CLASS_WITH_FIELDS, "Inner", listOf(UsedType(name = "Foo")))
        )

        @JvmStatic
        fun namespacedTemplateCases(): List<Arguments> = listOf(
            argumentSet(
                "simple generic of namespaced template",
                containerWith("std::list<Foo> items_;"),
                "Container",
                listOf(UsedType(name = "list", namespacePrefix = listOf("std"), genericTypes = listOf(UsedType(name = "Foo"))))
            ),
            argumentSet(
                "qualified generic of namespaced template",
                containerWith("std::list<ErrorMessage::FileLocation> callStack_;"),
                "Container",
                listOf(stdListOfFileLocations())
            ),
            argumentSet(
                "both type arguments of two-argument namespaced template",
                containerWith("std::map<Key, Value> items_;"),
                "Container",
                listOf(
                    UsedType(
                        name = "map",
                        namespacePrefix = listOf("std"),
                        genericTypes = listOf(UsedType(name = "Key"), UsedType(name = "Value"))
                    )
                )
            ),
            argumentSet(
                "nested namespaced templates recursively",
                containerWith("std::shared_ptr<std::string> payload_;"),
                "Container",
                listOf(
                    UsedType(
                        name = "shared_ptr",
                        namespacePrefix = listOf("std"),
                        genericTypes = listOf(UsedType(name = "string", namespacePrefix = listOf("std")))
                    )
                )
            ),
            argumentSet(
                "namespaced template as method return type",
                containerWith("std::list<ErrorMessage::FileLocation> getCallStack();"),
                "Container",
                listOf(stdListOfFileLocations())
            )
        )

        @JvmStatic
        fun friendAndUsingCases(): List<Arguments> = listOf(
            argumentSet("friend class type", containerWith("friend class Tester;"), "Container", listOf(UsedType(name = "Tester"))),
            argumentSet(
                "qualified friend class type",
                containerWith("friend class Outer::Tester;"),
                "Container",
                listOf(UsedType(name = "Tester", namespacePrefix = listOf("Outer")))
            ),
            argumentSet(
                "base class of using declaration inside class body",
                "class Derived : public Base {\n    using Base::method;\n};",
                "Derived",
                listOf(UsedType(name = "Base"))
            ),
            argumentSet(
                "namespace prefix of multi-segment qualified using declaration",
                "class Derived {\n    using Outer::Inner::method;\n};",
                "Derived",
                listOf(UsedType(name = "Inner", namespacePrefix = listOf("Outer")))
            ),
            argumentSet(
                "nothing for using declaration in member function body",
                containerMethodWith("using std::cout;"),
                "Container",
                listOf(UsedType(name = "void"))
            )
        )

        private fun stdListOfFileLocations() = UsedType(
            name = "list",
            namespacePrefix = listOf("std"),
            genericTypes = listOf(UsedType(name = "FileLocation", namespacePrefix = listOf("ErrorMessage")))
        )
    }
}
