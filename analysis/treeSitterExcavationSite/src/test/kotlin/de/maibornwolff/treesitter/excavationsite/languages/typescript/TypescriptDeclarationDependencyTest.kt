package de.maibornwolff.treesitter.excavationsite.languages.typescript

import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource

class TypescriptDeclarationDependencyTest {
    @ParameterizedTest
    @MethodSource("declarationCases")
    fun `should extract declarations with their types`(code: String, expectedDeclarations: List<Pair<String, DeclarationType>>) {
        // Act
        val result = analyzeTypescript(code)

        // Assert
        assertThat(result.declarations.map { it.name to it.type }).containsExactlyInAnyOrderElementsOf(expectedDeclarations)
    }

    @ParameterizedTest
    @MethodSource("declarationUsedTypeCases")
    fun `should extract used types per declaration`(code: String, declarationName: String, expectedUsedTypes: List<String>) {
        // Act
        val result = analyzeTypescript(code)

        // Assert
        assertThat(result.usedTypeNamesOf(declarationName)).containsExactlyInAnyOrderElementsOf(expectedUsedTypes)
    }

    @ParameterizedTest
    @MethodSource("ambientModuleCases")
    fun `should extract declarations inside declare module with parentPath`(
        code: String,
        expectedDeclaration: Pair<String, DeclarationType>,
        expectedParentPath: List<String>
    ) {
        // Act
        val result = analyzeTypescript(code)

        // Assert
        assertThat(result.declarations).hasSize(1)
        assertThat(result.declarations[0].name to result.declarations[0].type).isEqualTo(expectedDeclaration)
        assertThat(result.declarations[0].parentPath).containsExactlyElementsOf(expectedParentPath)
    }

    companion object {
        private val NO_DECLARATIONS = emptyList<Pair<String, DeclarationType>>()
        private const val EXPORT_DEFAULT_OF_LOCAL_VARIABLE = "const events = { EventEmitter }\nexport default events"
        private const val EXPORT_DEFAULT_OF_LOCAL_ABSTRACT_CLASS = "abstract class Base {}\nexport default Base"
        private const val MULTIPLE_VARIABLE_DECLARATORS = "export const a: TypeA = 1, b: TypeB = 2"
        private const val EXPORTED_NAMESPACE = "export namespace EngineArgs { export type ApplyMigrations = { foo: string } }"
        private val NON_EXPORTED_FUNCTION =
            """
            import { Logger } from './logger'

            function logVisit(visitor: string): void {
                const logger = new Logger()
                logger.log(visitor)
            }
            """.trimIndent()

        @JvmStatic
        fun declarationCases(): List<Arguments> = listOf(
            argumentSet("class", "export class Foo {}", listOf("Foo" to DeclarationType.CLASS)),
            argumentSet("interface", "export interface IFoo {}", listOf("IFoo" to DeclarationType.INTERFACE)),
            argumentSet("enum", "export enum Color { RED, GREEN, BLUE }", listOf("Color" to DeclarationType.ENUM)),
            argumentSet("function", "export function greet(name: string): void {}", listOf("greet" to DeclarationType.FUNCTION)),
            argumentSet(
                "function signature without body",
                "export function greet(name: string): void;",
                listOf("greet" to DeclarationType.FUNCTION)
            ),
            argumentSet(
                "generator function",
                "export function* generate(): Generator<number> { yield 1 }",
                listOf("generate" to DeclarationType.FUNCTION)
            ),
            argumentSet("type alias as CLASS", "export type Id = string", listOf("Id" to DeclarationType.CLASS)),
            argumentSet("const variable", "export const greeting: string = 'hello'", listOf("greeting" to DeclarationType.VARIABLE)),
            argumentSet("var variable", "export var counter = 0", listOf("counter" to DeclarationType.VARIABLE)),
            argumentSet(
                "abstract class as CLASS",
                "export abstract class AbstractBase { abstract doWork(): void }",
                listOf("AbstractBase" to DeclarationType.CLASS)
            ),
            argumentSet(
                "multiple declarations",
                """
                    export class Foo {}
                    export interface IBar {}
                    export enum Baz { A, B }
                """.trimIndent(),
                listOf("Foo" to DeclarationType.CLASS, "IBar" to DeclarationType.INTERFACE, "Baz" to DeclarationType.ENUM)
            ),
            argumentSet(
                "multiple variable declarators from one const statement",
                MULTIPLE_VARIABLE_DECLARATORS,
                listOf("a" to DeclarationType.VARIABLE, "b" to DeclarationType.VARIABLE)
            ),
            argumentSet(
                "simple re-export as REEXPORT",
                "export { MyReexportedClass } from './MyInternalClass'",
                listOf("MyReexportedClass" to DeclarationType.REEXPORT)
            ),
            argumentSet(
                "aliased re-export named by its alias",
                "export { MyReexportedClass as MRC } from './MyInternalClass'",
                listOf("MRC" to DeclarationType.REEXPORT)
            ),
            argumentSet(
                "default re-export named by its alias",
                "export { default as validationMixin } from './mixins/validation.mixin'",
                listOf("validationMixin" to DeclarationType.REEXPORT)
            ),
            argumentSet(
                "one REEXPORT per specifier",
                "export { A, B } from './utils'",
                listOf("A" to DeclarationType.REEXPORT, "B" to DeclarationType.REEXPORT)
            ),
            argumentSet("wildcard re-export as REEXPORT", "export * from './utils'", listOf("*" to DeclarationType.REEXPORT)),
            argumentSet(
                "export default of undeclared identifier as REEXPORT",
                "export default MyDefaultExport;",
                listOf("DEFAULT_EXPORT" to DeclarationType.REEXPORT)
            ),
            argumentSet(
                "export default call expression as REEXPORT",
                "export default defineConfig({})",
                listOf("DEFAULT_EXPORT" to DeclarationType.REEXPORT)
            ),
            argumentSet(
                "export default object literal as REEXPORT",
                "export default { performance }",
                listOf("DEFAULT_EXPORT" to DeclarationType.REEXPORT)
            ),
            argumentSet(
                "DEFAULT_EXPORT typed like the locally declared variable",
                EXPORT_DEFAULT_OF_LOCAL_VARIABLE,
                listOf("events" to DeclarationType.VARIABLE, "DEFAULT_EXPORT" to DeclarationType.VARIABLE)
            ),
            argumentSet(
                "DEFAULT_EXPORT typed like the locally declared abstract class",
                EXPORT_DEFAULT_OF_LOCAL_ABSTRACT_CLASS,
                listOf("Base" to DeclarationType.CLASS, "DEFAULT_EXPORT" to DeclarationType.CLASS)
            ),
            argumentSet(
                "no DEFAULT_EXPORT for inline export default class",
                "export default class Foo {}",
                listOf("Foo" to DeclarationType.CLASS)
            ),
            argumentSet(
                "no DEFAULT_EXPORT for inline export default function",
                "export default function foo() {}",
                listOf("foo" to DeclarationType.FUNCTION)
            ),
            argumentSet(
                "only the outer class of a nested class expression",
                """
                    export class Outer {
                        inner = class Inner {}
                    }
                """.trimIndent(),
                listOf("Outer" to DeclarationType.CLASS)
            ),
            argumentSet(
                "no const declaration inside function body",
                """
                    export function foo() {
                        const x = 5
                    }
                """.trimIndent(),
                listOf("foo" to DeclarationType.FUNCTION)
            ),
            argumentSet(
                "no const declaration inside class body",
                """
                    export class Foo {
                        doSomething() {
                            const x = 5
                        }
                    }
                """.trimIndent(),
                listOf("Foo" to DeclarationType.CLASS)
            ),
            argumentSet("non-exported function", NON_EXPORTED_FUNCTION, listOf("logVisit" to DeclarationType.FUNCTION)),
            argumentSet("no declarations for imports-only file", "import { Foo } from './foo'", NO_DECLARATIONS),
            argumentSet("exported namespace as UNKNOWN", EXPORTED_NAMESPACE, listOf("EngineArgs" to DeclarationType.UNKNOWN)),
            argumentSet("no namespace without export keyword", "namespace Foo {}", NO_DECLARATIONS),
            argumentSet(
                "no declarations for glob pattern declare module",
                """declare module "*.md" {}""",
                NO_DECLARATIONS
            ),
            argumentSet(
                "no declarations for empty declare module body",
                """declare module "MyModule" {}""",
                NO_DECLARATIONS
            )
        )

        @JvmStatic
        fun declarationUsedTypeCases(): List<Arguments> = listOf(
            argumentSet(
                "simple re-export uses the re-exported name",
                "export { MyReexportedClass } from './MyInternalClass'",
                "MyReexportedClass",
                listOf("MyReexportedClass")
            ),
            argumentSet(
                "aliased re-export uses the original name",
                "export { MyReexportedClass as MRC } from './MyInternalClass'",
                "MRC",
                listOf("MyReexportedClass")
            ),
            argumentSet(
                "default re-export uses DEFAULT_EXPORT",
                "export { default as validationMixin } from './mixins/validation.mixin'",
                "validationMixin",
                listOf("DEFAULT_EXPORT")
            ),
            argumentSet("wildcard re-export uses nothing", "export * from './utils'", "*", emptyList<String>()),
            argumentSet(
                "export default of undeclared identifier uses the identifier",
                "export default MyDefaultExport;",
                "DEFAULT_EXPORT",
                listOf("MyDefaultExport")
            ),
            argumentSet(
                "export default call expression uses nothing",
                "export default defineConfig({})",
                "DEFAULT_EXPORT",
                emptyList<String>()
            ),
            argumentSet(
                "export default object literal uses nothing",
                "export default { performance }",
                "DEFAULT_EXPORT",
                emptyList<String>()
            ),
            argumentSet(
                "DEFAULT_EXPORT of local variable uses the variable",
                EXPORT_DEFAULT_OF_LOCAL_VARIABLE,
                "DEFAULT_EXPORT",
                listOf("events")
            ),
            argumentSet(
                "DEFAULT_EXPORT of local abstract class uses the class",
                EXPORT_DEFAULT_OF_LOCAL_ABSTRACT_CLASS,
                "DEFAULT_EXPORT",
                listOf("Base")
            ),
            argumentSet("first variable declarator uses its own type", MULTIPLE_VARIABLE_DECLARATORS, "a", listOf("TypeA")),
            argumentSet("second variable declarator uses its own type", MULTIPLE_VARIABLE_DECLARATORS, "b", listOf("TypeB")),
            argumentSet("non-exported function uses the types of its body", NON_EXPORTED_FUNCTION, "logVisit", listOf("Logger")),
            argumentSet("exported namespace uses nothing", EXPORTED_NAMESPACE, "EngineArgs", emptyList<String>())
        )

        @JvmStatic
        fun ambientModuleCases(): List<Arguments> = listOf(
            argumentSet(
                "function",
                """
                    declare module "MyModule" {
                        export function myFunction(): void;
                    }
                """.trimIndent(),
                "myFunction" to DeclarationType.FUNCTION,
                listOf("MyModule")
            ),
            argumentSet(
                "class",
                """
                    declare module "MyModule" {
                        export class MyClass {}
                    }
                """.trimIndent(),
                "MyClass" to DeclarationType.CLASS,
                listOf("MyModule")
            ),
            argumentSet(
                "scoped module name split into path segments",
                """
                    declare module "@scope/pkg" {
                        export function myFunction(): void;
                    }
                """.trimIndent(),
                "myFunction" to DeclarationType.FUNCTION,
                listOf("@scope", "pkg")
            )
        )
    }
}
