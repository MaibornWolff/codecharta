package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_DEFAULT_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.ImportKind
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class MemberImportsTest {
    @TempDir
    lateinit var analysisRoot: File

    private fun node(vararg usedTypes: String) = Node(
        pathWithName = Path(listOf("app", "draw")),
        physicalPath = "app.ts",
        nodeType = NodeType.FUNCTION,
        language = SupportedLanguage.TYPESCRIPT,
        dependencies = emptySet(),
        usedTypes = usedTypes.map { Type.simple(it) }.toSet()
    )

    private fun defaultImportOf(moduleFile: File, binding: String): MemberImports {
        val memberImports = MemberImports(analysisRoot)
        val import = ImportDeclaration(
            path = listOf(".", moduleFile.nameWithoutExtension, TSE_DEFAULT_EXPORT_NAME),
            isWildcard = false,
            kind = ImportKind.MEMBER,
            bindingName = binding
        )
        memberImports.targetOf(import, moduleFile, Path(listOf(moduleFile.nameWithoutExtension)))
        return memberImports
    }

    @Test
    fun `should write a qualified name behind a default import as the path of its member, each shorter one a fallback`() {
        // Arrange
        val geo = File(
            analysisRoot,
            "geo.ts"
        ).apply { writeText("export namespace Shapes { export class Circle {} }\nexport default Shapes") }
        val memberImports = defaultImportOf(geo, "Geo")

        // Act
        val nodes = memberImports.rewrite(listOf(node("Geo.Circle")))

        // Assert
        val use = nodes.single().usedTypes.single()
        assertThat(use.name).isEqualTo("geo.Shapes.Circle")
        assertThat(use.fallbacks.map { it.name }).containsExactly("geo.Shapes")
    }

    @Test
    fun `should write a use of a named import as the path of the export it names`() {
        // Arrange
        val model = File(analysisRoot, "model.ts").apply { writeText("export class Model {}") }
        val memberImports = MemberImports(analysisRoot)
        val import =
            ImportDeclaration(path = listOf(".", "model", "Model"), isWildcard = false, kind = ImportKind.MEMBER, bindingName = "Model")

        // Act
        val target = memberImports.targetOf(import, model, Path(listOf("model")))
        val nodes = memberImports.rewrite(listOf(node("Model", "Model.create")))

        // Assert
        assertThat(target).isEqualTo(Path(listOf("model", "Model")))
        assertThat(nodes.single().usedTypes.map { it.name }).containsExactly("model.Model", "model.Model.create")
    }

    @Test
    fun `should write a use of a renamed import under its local name as the path of the export it names`() {
        // Arrange
        val model = File(analysisRoot, "model.ts").apply { writeText("export class Model {}") }
        val memberImports = MemberImports(analysisRoot)
        val import =
            ImportDeclaration(path = listOf(".", "model", "Model"), isWildcard = false, kind = ImportKind.MEMBER, bindingName = "Base")
        memberImports.targetOf(import, model, Path(listOf("model")))

        // Act
        val nodes = memberImports.rewrite(listOf(node("Base", "Model")))

        // Assert
        assertThat(nodes.single().usedTypes.map { it.name }).containsExactly("model.Model", "Model")
    }

    @Test
    fun `should leave a qualified name alone whose first segment no import binds`() {
        // Arrange
        val geo = File(analysisRoot, "geo.ts").apply { writeText("export default class Shape {}") }
        val memberImports = defaultImportOf(geo, "Geo")

        // Act
        val nodes = memberImports.rewrite(listOf(node("Other.Geo")))

        // Assert
        val use = nodes.single().usedTypes.single()
        assertThat(use.name).isEqualTo("Other.Geo")
        assertThat(use.fallbacks).isEmpty()
    }

    @Test
    fun `should write a name behind a namespace import as the path of its member, no shorter one than the module's export`() {
        // Arrange
        val lib = File(analysisRoot, "models/lib.ts").apply {
            parentFile.mkdirs()
            writeText("export namespace Shapes { export class Circle {} }")
        }
        val memberImports = MemberImports(analysisRoot)
        val import = ImportDeclaration(path = listOf(".", "lib"), isWildcard = true, bindingName = "ns")
        memberImports.targetOf(import, lib, Path(listOf("models", "lib")))

        // Act
        val nodes = memberImports.rewrite(listOf(node("ns.Shapes.Circle", "ns")))

        // Assert
        val uses = nodes.single().usedTypes.associateBy { it.name }
        assertThat(uses.keys).containsExactlyInAnyOrder("models.lib.Shapes.Circle", "ns")
        assertThat(uses.getValue("models.lib.Shapes.Circle").fallbacks.map { it.name }).containsExactly("models.lib.Shapes")
    }

    @Test
    fun `should walk a name behind a namespace import through a module the module exports as a name`() {
        // Arrange
        File(analysisRoot, "shapes.ts").writeText("export class Circle {}")
        val lib = File(analysisRoot, "lib.ts").apply { writeText("export * as figures from './shapes'") }
        val memberImports = MemberImports(analysisRoot)
        memberImports.targetOf(
            ImportDeclaration(path = listOf(".", "lib"), isWildcard = true, bindingName = "ns"),
            lib,
            Path(listOf("lib"))
        )
        val namedImport =
            ImportDeclaration(path = listOf(".", "lib", "figures"), isWildcard = false, kind = ImportKind.MEMBER, bindingName = "figures")
        memberImports.targetOf(namedImport, lib, Path(listOf("lib")))

        // Act
        val nodes = memberImports.rewrite(listOf(node("ns.figures.Circle", "figures.Circle")))

        // Assert
        val uses = nodes.single().usedTypes
        assertThat(uses.map { it.name }).containsExactly("shapes.Circle")
        assertThat(uses.single().fallbacks).isEmpty()
    }

    @Test
    fun `should write a member read through a default binding of a module without a default declaration as its export`() {
        // Arrange
        val module = File(analysisRoot, "a.js").apply { writeText("class Svc {}\nfunction helper() {}\nmodule.exports = { Svc, helper }") }
        val memberImports = defaultImportOf(module, "lib")

        // Act
        val nodes = memberImports.rewrite(listOf(node("lib.helper")))

        // Assert
        val use = nodes.single().usedTypes.single()
        assertThat(use.name).isEqualTo("a.helper")
        assertThat(use.fallbacks).isEmpty()
    }
}
