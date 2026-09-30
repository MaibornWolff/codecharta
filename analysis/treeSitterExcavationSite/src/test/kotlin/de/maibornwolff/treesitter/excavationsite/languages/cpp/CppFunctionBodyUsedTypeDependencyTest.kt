package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource

class CppFunctionBodyUsedTypeDependencyTest {
    @ParameterizedTest
    @MethodSource("castCases", "instantiationCases", "typeOperandAndThrowCases", "outOfClassMethodCases")
    fun `should extract used types of function bodies`(code: String, declarationName: String, expectedUsedTypes: List<UsedType>) {
        // Act
        val result = analyzeCpp(code)

        // Assert
        assertThat(result.usedTypesOf(declarationName)).containsExactlyInAnyOrderElementsOf(expectedUsedTypes)
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
        val result = analyzeCpp(code)

        // Assert
        assertThat(result.usedTypesOf("Widget").map { it.name }.toSet()).containsExactlyInAnyOrder(
            "Base",
            "Wrapped",
            "Counter",
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
            "Init"
        )
    }

    companion object {
        private val VOID = UsedType(name = "void")

        @JvmStatic
        fun castCases(): List<Arguments> = listOf(
            argumentSet(
                "C-style cast",
                "class Container {\n    void doWork(void* p) {\n        auto result = (Foo)p;\n    }\n};",
                "Container",
                listOf(UsedType(name = "Foo"), VOID)
            ),
            explicitCast("static_cast"),
            explicitCast("reinterpret_cast"),
            explicitCast("const_cast"),
            argumentSet(
                "both source and target type of dynamic_cast",
                "class Container {\n    void doWork(Base* b) {\n        auto d = dynamic_cast<Derived*>(b);\n    }\n};",
                "Container",
                listOf(UsedType(name = "Base"), UsedType(name = "Derived"), VOID)
            )
        )

        @JvmStatic
        fun instantiationCases(): List<Arguments> = listOf(
            argumentSet("new expression", containerMethodWith("auto p = new Foo();"), "Container", listOf(UsedType(name = "Foo"), VOID)),
            argumentSet(
                "template type of new expression",
                containerMethodWith("auto p = new Vec<Foo>();"),
                "Container",
                listOf(UsedType(name = "Vec", genericTypes = listOf(UsedType(name = "Foo"))), VOID)
            ),
            argumentSet(
                "template argument of template function call",
                containerMethodWith("auto x = make<Foo>();"),
                "Container",
                listOf(UsedType(name = "Foo"), VOID)
            ),
            argumentSet(
                "rightmost segment and scope of single-scope qualified call",
                containerMethodWith("Catch::registerTest();"),
                "Container",
                listOf(UsedType(name = "Catch"), UsedType(name = "registerTest", namespacePrefix = listOf("Catch")), VOID)
            ),
            argumentSet(
                "multi-segment prefix and outermost scope of qualified call",
                containerMethodWith("A::B::C::helper();"),
                "Container",
                listOf(UsedType(name = "helper", namespacePrefix = listOf("A", "B", "C")), UsedType(name = "A"), VOID)
            ),
            argumentSet(
                "bare-identifier callee nested in argument list as constructor call",
                "class Container {\n    void doWork(List& l) {\n        l.add(Widget(x));\n    }\n};",
                "Container",
                listOf(UsedType(name = "List"), UsedType(name = "Widget"), VOID)
            ),
            argumentSet(
                "no bare-identifier callee at statement level",
                containerMethodWith("helperFunction();"),
                "Container",
                listOf(VOID)
            )
        )

        @JvmStatic
        fun typeOperandAndThrowCases(): List<Arguments> = listOf(
            argumentSet(
                "sizeof with pointer type",
                containerMethodWith("auto s = sizeof(Foo*);"),
                "Container",
                listOf(UsedType(name = "Foo"), VOID)
            ),
            argumentSet("alignof", containerMethodWith("auto a = alignof(Foo);"), "Container", listOf(UsedType(name = "Foo"), VOID)),
            argumentSet(
                "bare-identifier callee of throw statement",
                containerMethodWith("throw MyException(x);"),
                "Container",
                listOf(UsedType(name = "MyException"), VOID)
            ),
            argumentSet(
                "qualified callee and its scope of throw statement",
                containerMethodWith("throw std::runtime_error(\"x\");"),
                "Container",
                listOf(UsedType(name = "std"), UsedType(name = "runtime_error", namespacePrefix = listOf("std")), VOID)
            ),
            argumentSet(
                "template-function callee and its argument of throw statement",
                containerMethodWith("throw make_ex<Detail>();"),
                "Container",
                listOf(UsedType(name = "Detail"), UsedType(name = "make_ex", genericTypes = listOf(UsedType(name = "Detail"))), VOID)
            )
        )

        @JvmStatic
        fun outOfClassMethodCases(): List<Arguments> = listOf(
            argumentSet(
                "parameter types of out-of-class method",
                "void Container::doWork(Foo f, Bar b) {}",
                "Container",
                listOf(UsedType(name = "Foo"), UsedType(name = "Bar"), VOID)
            ),
            argumentSet(
                "parameter types of out-of-class constructor without return type",
                "Executor::Executor(const Settings& settings, ErrorLogger& errorLogger) {}",
                "Executor",
                listOf(UsedType(name = "Settings"), UsedType(name = "ErrorLogger"))
            ),
            argumentSet(
                "local variable types of out-of-class method body",
                "void Container::doWork() {\n    Foo local;\n}",
                "Container",
                listOf(UsedType(name = "Foo"), VOID)
            ),
            argumentSet(
                "used types merged across overloaded out-of-class methods",
                "void Container::doWork(Foo f) {}\nvoid Container::doWork(Bar b) {}",
                "Container",
                listOf(UsedType(name = "Foo"), UsedType(name = "Bar"), VOID)
            )
        )

        private fun explicitCast(castName: String): Arguments = argumentSet(
            castName,
            "class Container {\n    void doWork(Foo* p) {\n        auto x = $castName<Foo*>(p);\n    }\n};",
            "Container",
            listOf(UsedType(name = "Foo"), VOID)
        )
    }
}
