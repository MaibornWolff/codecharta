package de.maibornwolff.treesitter.excavationsite.languages.typescript

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class TypescriptNamespaceImportUsedTypeTest {
    @Test
    fun `should recognize lowercase namespace alias usages and the member they read as usedTypes`() {
        // Arrange
        val code = """
            import * as ns from './utils'
            export class Bar {
                doWork() { ns.method() }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

        // Assert
        val usedTypeNames = result.declarations.first { it.name == "Bar" }.usedTypes.map { it.name }
        assertThat(usedTypeNames).containsExactlyInAnyOrder("ns", "ns.method")
    }

    @Test
    fun `should report a constructor called through a namespace import with the namespace`() {
        // Arrange
        val code = """
            import * as types from './types'
            export class Consumer {
                log(): void { new types.Logger() }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

        // Assert
        val usedTypeNames = result.declarations.first { it.name == "Consumer" }.usedTypes.map { it.name }
        assertThat(usedTypeNames).containsExactlyInAnyOrder("types", "types.Logger")
    }

    @Test
    fun `should report a member chain read through a namespace import as one name`() {
        // Arrange
        val code = """
            import * as types from './types'
            export class Consumer {
                create() { return types.Animal.create() }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

        // Assert
        val usedTypeNames = result.declarations.first { it.name == "Consumer" }.usedTypes.map { it.name }
        assertThat(usedTypeNames).containsExactlyInAnyOrder("types", "types.Animal.create")
    }

    @Test
    fun `should report a member chain read through an upper-case namespace import as one name`() {
        // Arrange
        val code = """
            import * as Types from './types'
            export class Consumer {
                create() { return Types.Animal.create() }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

        // Assert
        val usedTypeNames = result.declarations.first { it.name == "Consumer" }.usedTypes.map { it.name }
        assertThat(usedTypeNames).containsExactlyInAnyOrder("Types", "Types.Animal.create")
    }

    @Test
    fun `should report a member read through a namespace import, not one of a named import`() {
        // Arrange
        val code = """
            import * as models from './models/user'
            import { defaults } from './defaults'
            export function make(): unknown { return models.create() + defaults.size }
        """.trimIndent()

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

        // Assert
        assertThat(result.declarations.single().usedTypes.map { it.name }).containsExactlyInAnyOrder("models", "models.create", "defaults")
    }

    @Test
    fun `should report a qualified type as one name, also through a namespace import`() {
        // Arrange
        val code = """
            import * as lib from './lib'
            import { Shapes } from './geo'
            export class Draw implements lib.Drawable {
                circle?: Shapes.Circle
                shape?: lib.shapes.Square
            }
        """.trimIndent()

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

        // Assert
        assertThat(result.declarations.single().usedTypes.map { it.name }).containsExactlyInAnyOrder(
            "lib.Drawable",
            "Shapes.Circle",
            "lib.shapes.Square"
        )
    }
}
