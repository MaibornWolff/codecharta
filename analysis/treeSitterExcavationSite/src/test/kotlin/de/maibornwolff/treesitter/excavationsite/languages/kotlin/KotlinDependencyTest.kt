package de.maibornwolff.treesitter.excavationsite.languages.kotlin

import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.api.UsedType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class KotlinDependencyTest {
    @Nested
    inner class PackageExtraction {
        @Test
        fun `should extract multi-segment package path`() {
            // Arrange
            val code = """
            package com.example.service

            class MyService
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            assertThat(result.packagePath).containsExactly("com", "example", "service")
        }

        @Test
        fun `should extract single-segment package path`() {
            // Arrange
            val code = """
            package mypackage

            class MyService
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            assertThat(result.packagePath).containsExactly("mypackage")
        }

        @Test
        fun `should return empty package path when no package declaration`() {
            // Arrange
            val code = "class MyService"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            assertThat(result.packagePath).isEmpty()
        }
    }

    @Nested
    inner class ImportExtraction {
        @Test
        fun `should extract single import`() {
            // Arrange
            val code = """
            import java.util.List

            class MyService
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly("java", "util", "List")
            assertThat(result.imports[0].isWildcard).isFalse()
        }

        @Test
        fun `should extract multiple imports`() {
            // Arrange
            val code = """
            import java.util.List
            import java.util.Map
            import java.io.File

            class MyService
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            assertThat(result.imports).hasSize(3)
            assertThat(result.imports[0].path).containsExactly("java", "util", "List")
            assertThat(result.imports[1].path).containsExactly("java", "util", "Map")
            assertThat(result.imports[2].path).containsExactly("java", "io", "File")
        }

        @Test
        fun `should extract wildcard import`() {
            // Arrange
            val code = """
            import java.util.*

            class MyService
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly("java", "util")
            assertThat(result.imports[0].isWildcard).isTrue()
        }

        @Test
        fun `should extract aliased import`() {
            // Arrange
            val code = """
            import com.example.util.StringUtils as Utils

            class MyService
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly("com", "example", "util", "StringUtils")
            assertThat(result.imports[0].isWildcard).isFalse()
        }

        @Test
        fun `should return empty imports when no import declarations`() {
            // Arrange
            val code = """
            package com.example

            class MyService
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            assertThat(result.imports).isEmpty()
        }
    }

    @Nested
    inner class DeclarationExtraction {
        @Test
        fun `should extract all declaration types`() {
            // Arrange
            val code = """
            package com.example

            class RegularClass
            data class DataClass(val name: String)
            enum class Color { RED, GREEN, BLUE }
            interface Drawable { fun draw() }
            annotation class MyAnnotation
            object Singleton
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            assertThat(result.declarations).hasSize(6)
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName["RegularClass"]?.type).isEqualTo(DeclarationType.CLASS)
            assertThat(byName["DataClass"]?.type).isEqualTo(DeclarationType.CLASS)
            assertThat(byName["Color"]?.type).isEqualTo(DeclarationType.ENUM)
            assertThat(byName["Drawable"]?.type).isEqualTo(DeclarationType.INTERFACE)
            assertThat(byName["MyAnnotation"]?.type).isEqualTo(DeclarationType.ANNOTATION)
            assertThat(byName["Singleton"]?.type).isEqualTo(DeclarationType.CLASS)
        }

        @Test
        fun `should return empty declarations when no type declarations`() {
            // Arrange
            val code = """
            package com.example

            fun topLevelFunction() {}
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            assertThat(result.declarations).isEmpty()
        }

        @Test
        fun `should extract property types`() {
            // Arrange
            val code = """
            package com.example

            class MyClass {
                val name: String = ""
                var count: Int = 0
                lateinit var service: MyService
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            val usedTypes = result.declarations.first().usedTypes
            assertThat(usedTypes).containsExactlyInAnyOrder(
                UsedType("String"),
                UsedType("Int"),
                UsedType("MyService")
            )
        }

        @Test
        fun `should extract nullable property types`() {
            // Arrange
            val code = """
            package com.example

            class MyClass {
                val name: String? = null
                var count: Int? = null
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            val usedTypes = result.declarations.first().usedTypes
            assertThat(usedTypes).containsExactlyInAnyOrder(
                UsedType("String"),
                UsedType("Int")
            )
        }

        @Test
        fun `should extract class parameter types`() {
            // Arrange
            val code = """
            package com.example

            data class Person(val name: String, val age: Int, val address: Address)
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            val usedTypes = result.declarations.first().usedTypes
            assertThat(usedTypes).containsExactlyInAnyOrder(
                UsedType("String"),
                UsedType("Int"),
                UsedType("Address")
            )
        }

        @Test
        fun `should extract inheritance types`() {
            // Arrange
            val code = """
            package com.example

            class Child : Base(), Printable, Serializable
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            val usedTypes = result.declarations.first().usedTypes
            assertThat(usedTypes).containsExactlyInAnyOrder(
                UsedType("Base"),
                UsedType("Printable"),
                UsedType("Serializable")
            )
        }

        @Test
        fun `should extract function return and parameter types`() {
            // Arrange
            val code = """
            package com.example

            class Service {
                fun process(name: String, count: Int): Boolean { return true }
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            val usedTypes = result.declarations.first().usedTypes
            assertThat(usedTypes).containsExactlyInAnyOrder(
                UsedType("String"),
                UsedType("Int"),
                UsedType("Boolean")
            )
        }

        @Test
        fun `should extract annotation types`() {
            // Arrange
            val code = """
            package com.example

            class Annotated {
                @Inject
                lateinit var service: MyService

                @Deprecated("use other")
                fun process() {}
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            val usedTypes = result.declarations.first().usedTypes
            assertThat(usedTypes).containsExactlyInAnyOrder(
                UsedType("Inject"),
                UsedType("MyService"),
                UsedType("Deprecated")
            )
        }

        @Test
        fun `should extract constructor call types with uppercase heuristic`() {
            // Arrange
            val code = """
            package com.example

            class Builder {
                fun build() {
                    val obj = MyObject()
                    val list = ArrayList<String>()
                }
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            val usedTypes = result.declarations.first().usedTypes
            assertThat(usedTypes).containsExactlyInAnyOrder(
                UsedType("MyObject"),
                UsedType("ArrayList", listOf(UsedType("String")))
            )
        }

        @Test
        fun `should extract call expression types with uppercase heuristic`() {
            // Arrange
            val code = """
            package com.example

            class Service {
                fun process() {
                    ServiceFactory.create()
                    helper.process()
                }
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert — ServiceFactory.create extracted from both call_expression and navigation_expression
            val usedTypes = result.declarations.first().usedTypes
            assertThat(usedTypes).containsExactlyInAnyOrder(
                UsedType("ServiceFactory"),
                UsedType("ServiceFactory.create")
            )
        }

        @Test
        fun `should extract navigation expression types without call suffix`() {
            // Arrange
            val code = """
            package com.example

            class Formatter {
                fun format() {
                    val pad = Padding.NONE
                    val names = DayOfWeekNames.ENGLISH
                    val fmt = Formats.ISO
                    val lower = helper.value
                }
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            val usedTypes = result.declarations.first().usedTypes
            assertThat(usedTypes).containsExactlyInAnyOrder(
                UsedType("Padding"),
                UsedType("DayOfWeekNames"),
                UsedType("Formats")
            )
        }

        @Test
        fun `should extract generic types`() {
            // Arrange
            val code = """
            package com.example

            class Container {
                val items: List<String> = emptyList()
                val mapping: Map<String, List<Int>> = emptyMap()
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            val usedTypes = result.declarations.first().usedTypes
            assertThat(usedTypes).containsExactlyInAnyOrder(
                UsedType("List", listOf(UsedType("String"))),
                UsedType("Map", listOf(UsedType("String"), UsedType("List", listOf(UsedType("Int")))))
            )
        }

        @Test
        fun `should handle star projections`() {
            // Arrange
            val code = """
            package com.example

            class Container {
                val items: List<*> = emptyList<Any>()
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            val usedTypes = result.declarations.first().usedTypes
            assertThat(usedTypes).containsExactlyInAnyOrder(UsedType("List"))
        }

        @Test
        fun `should extract first segment from dotted user types`() {
            // Arrange — DC legacy extracts only the first type_identifier from dotted user_type nodes;
            // the resolver handles matching simple names to full qualified paths
            val code = """
            package com.example

            class Formatter : DateTimeFormatBuilder.WithDate() {
                lateinit var unit: DateTimeUnit.DateBased
                fun format(directive: UnicodeFormat.Directive): AbstractWith.Builder {
                    return AbstractWith.Builder()
                }
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert — only first segments from type positions, full dotted names from call/nav expressions
            val usedTypes = result.declarations.first().usedTypes
            assertThat(usedTypes).containsExactlyInAnyOrder(
                UsedType("DateTimeFormatBuilder"),
                UsedType("DateTimeUnit"),
                UsedType("UnicodeFormat"),
                UsedType("AbstractWith"),
                UsedType("AbstractWith.Builder")
            )
        }

        @Test
        fun `should extract first segment from dotted user types with generics`() {
            // Arrange
            val code = """
            package com.example

            class Container {
                lateinit var items: Outer.Inner<String>
                lateinit var mapping: Outer.Inner<String, Nested.Type<Int>>
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert — only first type_identifier segment, generics still extracted
            val usedTypes = result.declarations.first().usedTypes
            assertThat(usedTypes).containsExactlyInAnyOrder(
                UsedType("Outer", listOf(UsedType("String"))),
                UsedType("Outer", listOf(UsedType("String"), UsedType("Nested", listOf(UsedType("Int")))))
            )
        }

        @Test
        fun `should extract qualified navigation expression types`() {
            // Arrange
            val code = """
            package com.example

            class Formatter {
                fun format() {
                    DateTimeFormatBuilder.WithTime.create()
                    UnicodeFormat.Directive.DateBased.format()
                    helper.process()
                }
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert — matches DC behavior: all navigation expression levels + full call text
            val usedTypes = result.declarations.first().usedTypes
            assertThat(usedTypes).containsExactlyInAnyOrder(
                UsedType("DateTimeFormatBuilder.WithTime.create"),
                UsedType("DateTimeFormatBuilder.WithTime"),
                UsedType("DateTimeFormatBuilder"),
                UsedType("UnicodeFormat.Directive.DateBased.format"),
                UsedType("UnicodeFormat.Directive.DateBased"),
                UsedType("UnicodeFormat.Directive"),
                UsedType("UnicodeFormat")
            )
        }

        @Test
        fun `should extract qualified constructor call types`() {
            // Arrange
            val code = """
            package com.example

            class Factory {
                fun create() {
                    val inner = Outer.Inner()
                    val simple = MyClass()
                    val lower = helper.build()
                }
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            val usedTypes = result.declarations.first().usedTypes
            assertThat(usedTypes).containsExactlyInAnyOrder(
                UsedType("Outer.Inner"),
                UsedType("Outer"),
                UsedType("MyClass")
            )
        }

        @Test
        fun `should extract generic types from qualified constructor calls`() {
            // Arrange
            val code = """
            package com.example

            class Factory {
                fun create() {
                    val typed = Outer.Inner<String>()
                    val multi = Container.Builder<String, Int>()
                    val simple = MyClass<Boolean>()
                }
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            val usedTypes = result.declarations.first().usedTypes
            assertThat(usedTypes).containsExactlyInAnyOrder(
                UsedType("Outer.Inner", listOf(UsedType("String"))),
                UsedType("Outer"),
                UsedType("Container.Builder", listOf(UsedType("String"), UsedType("Int"))),
                UsedType("Container"),
                UsedType("MyClass", listOf(UsedType("Boolean")))
            )
        }

        @Test
        fun `should find nested declarations recursively`() {
            // Arrange
            val code = """
            package com.example

            class Outer {
                val outerField: OuterType = OuterType()

                class Inner {
                    val innerField: InnerType = InnerType()
                }

                enum class Status { ACTIVE, INACTIVE }
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            assertThat(result.declarations).hasSize(3)
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName["Outer"]?.type).isEqualTo(DeclarationType.CLASS)
            assertThat(byName["Inner"]?.type).isEqualTo(DeclarationType.CLASS)
            assertThat(byName["Status"]?.type).isEqualTo(DeclarationType.ENUM)

            // Parent paths for nested declarations
            assertThat(byName["Outer"]?.parentPath).isEmpty()
            assertThat(byName["Inner"]?.parentPath).containsExactly("Outer")
            assertThat(byName["Status"]?.parentPath).containsExactly("Outer")

            // Outer includes its own types AND all nested types (leakage is expected)
            assertThat(byName["Outer"]?.usedTypes).containsExactlyInAnyOrder(
                UsedType("OuterType"),
                UsedType("InnerType")
            )
            assertThat(byName["Inner"]?.usedTypes).containsExactlyInAnyOrder(UsedType("InnerType"))
        }

        @Test
        fun `should not treat companion objects as declarations`() {
            // Arrange
            val code = """
            package com.example

            class MyClass {
                companion object {
                    const val DEFAULT = "default"
                    fun create(): MyClass = MyClass()
                }
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations.first().name).isEqualTo("MyClass")
        }

        @Test
        fun `should extract used types from object declarations`() {
            // Arrange
            val code = """
            package com.example

            object AppConfig : Config(), Serializable {
                val name: String = ""
                fun initialize(): Result { return Result() }
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            assertThat(result.declarations).hasSize(1)
            val declaration = result.declarations.first()
            assertThat(declaration.name).isEqualTo("AppConfig")
            assertThat(declaration.type).isEqualTo(DeclarationType.CLASS)
            assertThat(declaration.usedTypes).containsExactlyInAnyOrder(
                UsedType("Config"),
                UsedType("Serializable"),
                UsedType("String"),
                UsedType("Result")
            )
        }

        @Test
        fun `should extract sealed class nested types as separate declarations`() {
            // Arrange
            val code = """
            package com.example

            sealed class Result {
                data class Success(val value: String) : Result()
                data class Error(val message: String) : Result()
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            assertThat(result.declarations).hasSize(3)
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName["Result"]?.type).isEqualTo(DeclarationType.CLASS)
            assertThat(byName["Success"]?.type).isEqualTo(DeclarationType.CLASS)
            assertThat(byName["Error"]?.type).isEqualTo(DeclarationType.CLASS)
            assertThat(byName["Result"]?.parentPath).isEmpty()
            assertThat(byName["Success"]?.parentPath).containsExactly("Result")
            assertThat(byName["Error"]?.parentPath).containsExactly("Result")
            assertThat(byName["Success"]?.usedTypes).containsExactlyInAnyOrder(
                UsedType("String"),
                UsedType("Result")
            )
        }

        @Test
        fun `should extract empty file with no declarations`() {
            // Arrange
            val code = ""

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            assertThat(result.packagePath).isEmpty()
            assertThat(result.imports).isEmpty()
            assertThat(result.declarations).isEmpty()
        }

        @Test
        fun `should extract class with no used types`() {
            // Arrange
            val code = """
            package com.example

            class Empty
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations.first().usedTypes).isEmpty()
        }

        @Test
        fun `should include all descendant types at each nesting level`() {
            // Arrange
            val code = """
            package com.example

            class Root {
                val rootField: RootType = RootType()

                class Level1 {
                    val level1Field: Level1Type = Level1Type()

                    class Level2 {
                        val level2Field: Level2Type = Level2Type()
                    }
                }
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert
            assertThat(result.declarations).hasSize(3)
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName["Root"]?.parentPath).isEmpty()
            assertThat(byName["Level1"]?.parentPath).containsExactly("Root")
            assertThat(byName["Level2"]?.parentPath).containsExactly("Root", "Level1")
            assertThat(byName["Root"]?.usedTypes).containsExactlyInAnyOrder(
                UsedType("RootType"),
                UsedType("Level1Type"),
                UsedType("Level2Type")
            )
            assertThat(byName["Level1"]?.usedTypes).containsExactlyInAnyOrder(
                UsedType("Level1Type"),
                UsedType("Level2Type")
            )
            assertThat(byName["Level2"]?.usedTypes).containsExactlyInAnyOrder(UsedType("Level2Type"))
        }
    }

    @Nested
    inner class CompletenessCheck {
        @Test
        fun `should extract all dependency types from a realistic multi-declaration file`() {
            // Arrange
            val code = """
            package com.example.domain

            import java.util.List
            import java.util.Map
            import java.io.*

            @Fightable
            class Creature(val id: CreatureId, val type: CreatureType) : BaseEntity(), Serializable, Comparable<Creature> {
                private val speeds: Map<SpeedType, Speed> = emptyMap()

                fun calculateDamage(armor: ArmorClass): List<HitPoints> {
                    Logger.info("attacking")
                    return DamageCalculator().compute()
                }
            }

            enum class CreatureKind { DRAGON, GOBLIN }

            annotation class Fightable

            interface Movable : Locomotion {
                fun getSpeed(type: SpeedType): Speed
            }

            object CreatureRegistry : Registry(), Serializable {
                val creatures: List<Creature> = emptyList()
            }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.KOTLIN)

            // Assert - Package
            assertThat(result.packagePath).containsExactly("com", "example", "domain")

            // Assert - Imports
            assertThat(result.imports).hasSize(3)
            assertThat(result.imports[0].path).containsExactly("java", "util", "List")
            assertThat(result.imports[1].path).containsExactly("java", "util", "Map")
            assertThat(result.imports[2].path).containsExactly("java", "io")
            assertThat(result.imports[2].isWildcard).isTrue()

            // Assert - All 5 declaration types found
            assertThat(result.declarations).hasSize(5)
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName["Creature"]?.type).isEqualTo(DeclarationType.CLASS)
            assertThat(byName["CreatureKind"]?.type).isEqualTo(DeclarationType.ENUM)
            assertThat(byName["Fightable"]?.type).isEqualTo(DeclarationType.ANNOTATION)
            assertThat(byName["Movable"]?.type).isEqualTo(DeclarationType.INTERFACE)
            assertThat(byName["CreatureRegistry"]?.type).isEqualTo(DeclarationType.CLASS)

            // Assert - Creature used types (class params, properties, generics, inheritance,
            //          annotations, function params/returns, constructor calls, call expressions)
            // Note: entries like "DamageCalculator()" and "DamageCalculator().compute" preserve full
            // navigation expression text (including parentheses) to match DC legacy concatenation order
            assertThat(byName["Creature"]?.usedTypes).containsExactlyInAnyOrder(
                UsedType("Fightable"),
                UsedType("BaseEntity"),
                UsedType("Serializable"),
                UsedType("Comparable", listOf(UsedType("Creature"))),
                UsedType("CreatureId"),
                UsedType("CreatureType"),
                UsedType("Map", listOf(UsedType("SpeedType"), UsedType("Speed"))),
                UsedType("ArmorClass"),
                UsedType("List", listOf(UsedType("HitPoints"))),
                UsedType("Logger"),
                UsedType("Logger.info"),
                UsedType("DamageCalculator"),
                UsedType("DamageCalculator().compute"),
                UsedType("DamageCalculator()")
            )

            // Assert - Movable scoped separately
            assertThat(byName["Movable"]?.usedTypes).containsExactlyInAnyOrder(
                UsedType("Locomotion"),
                UsedType("Speed"),
                UsedType("SpeedType")
            )

            // Assert - CreatureRegistry (object with inheritance + properties)
            assertThat(byName["CreatureRegistry"]?.usedTypes).containsExactlyInAnyOrder(
                UsedType("Registry"),
                UsedType("Serializable"),
                UsedType("List", listOf(UsedType("Creature")))
            )
        }
    }

    @Nested
    inner class ApiSupportCheck {
        @Test
        fun `should report Kotlin as supported for dependency analysis`() {
            // Act & Assert
            assertThat(TreeSitterDependencies.isDependencyAnalysisSupported(Language.KOTLIN)).isTrue()
        }
    }
}
