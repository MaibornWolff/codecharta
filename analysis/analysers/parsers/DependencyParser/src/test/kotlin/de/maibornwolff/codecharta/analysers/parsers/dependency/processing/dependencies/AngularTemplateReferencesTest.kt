package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.AngularMetadata
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.build
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.AngularDeclaration
import de.maibornwolff.treesitter.excavationsite.api.AngularSelector
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AngularTemplateReferencesTest {
    @Test
    fun `should resolve an element and a pipe name of an Angular template to the classes whose selector and name they match`() {
        // Arrange
        val template = angularTemplate(usedNames = setOf("goldCoins"), elements = listOf("app-torch"))
        val torch = typescriptClass(listOf("src", "torch_component", "TorchComponent"), selector = AngularSelector(element = "app-torch"))
        val goldCoins = typescriptClass(listOf("src", "pipes", "gold-coins_pipe", "GoldCoinsPipe"), templateNames = setOf("goldCoins"))

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(FileReport(listOf(template, torch, goldCoins))))

        // Assert
        val resolvedTemplate = resolvedNodes.first { it.language == SupportedLanguage.ANGULAR }
        assertThat(resolvedTemplate.resolvedNodeDependencies.internalDependencies)
            .containsExactlyInAnyOrder(Dependency(torch.pathWithName), Dependency(goldCoins.pathWithName))
    }

    @Test
    fun `should not resolve an element whose selector several classes declare or none does`() {
        // Arrange
        val template = angularTemplate(elements = listOf("app-torch", "router-outlet"))
        val torch =
            typescriptClass(listOf("lantern", "torch_component", "TorchComponent"), selector = AngularSelector(element = "app-torch"))
        val otherTorch =
            typescriptClass(listOf("dungeon", "torch_component", "DungeonTorch"), selector = AngularSelector(element = "app-torch"))

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(FileReport(listOf(template, torch, otherTorch))))

        // Assert
        val resolvedTemplate = resolvedNodes.first { it.language == SupportedLanguage.ANGULAR }
        assertThat(resolvedTemplate.resolvedNodeDependencies.internalDependencies).isEmpty()
    }

    @Test
    fun `should resolve an element to every class whose selector matches it`() {
        // Arrange
        val element = AngularSelector(element = "app-torch", attributes = mapOf("appGlow" to "", "appTip" to ""))
        val template = angularTemplate().copy(angular = AngularMetadata(AngularDeclaration(elements = listOf(element))))
        val torch = typescriptClass(listOf("src", "torch_component", "TorchComponent"), AngularSelector(element = "app-torch"))
        val glow = typescriptClass(listOf("src", "glow_directive", "GlowDirective"), AngularSelector(attributes = mapOf("appGlow" to "")))
        val tip = typescriptClass(listOf("src", "tip_directive", "TipDirective"), AngularSelector(attributes = mapOf("appTip" to "")))
        val buttonGlow =
            typescriptClass(listOf("src", "button_directive", "ButtonDirective"), AngularSelector("button", mapOf("appGlow" to "")))

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(FileReport(listOf(template, torch, glow, tip, buttonGlow))))

        // Assert
        val resolvedTemplate = resolvedNodes.first { it.language == SupportedLanguage.ANGULAR }
        assertThat(resolvedTemplate.resolvedNodeDependencies.internalDependencies).containsExactlyInAnyOrder(
            Dependency(torch.pathWithName),
            Dependency(glow.pathWithName),
            Dependency(tip.pathWithName)
        )
    }

    @Test
    fun `should resolve a selector several classes declare to the one its standalone component imports`() {
        // Arrange
        val template = angularTemplate(elements = listOf("app-torch"))
        val cave = typescriptClass(
            listOf("src", "cave_component", "CaveComponent"),
            AngularMetadata(AngularDeclaration(imports = listOf("DungeonTorch")), template.pathWithName)
        )
        val torch =
            typescriptClass(
                listOf("lantern", "torch_component", "TorchComponent"),
                AngularMetadata(AngularDeclaration(selectors = listOf(AngularSelector(element = "app-torch"))))
            )
        val dungeonTorch =
            typescriptClass(
                listOf("dungeon", "torch_component", "DungeonTorch"),
                AngularMetadata(AngularDeclaration(selectors = listOf(AngularSelector(element = "app-torch"))))
            )

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(FileReport(listOf(template, cave, torch, dungeonTorch))))

        // Assert
        val resolvedTemplate = resolvedNodes.first { it.language == SupportedLanguage.ANGULAR }
        assertThat(resolvedTemplate.resolvedNodeDependencies.internalDependencies).containsExactly(Dependency(dungeonTorch.pathWithName))
    }

    @Test
    fun `should resolve a selector several classes declare to the one the module of its component declares or imports`() {
        // Arrange
        val template = angularTemplate(elements = listOf("app-torch", "app-lantern"))
        val cave =
            typescriptClass(listOf("src", "cave_component", "CaveComponent"), AngularMetadata(AngularDeclaration(), template.pathWithName))
        val cellarModule = typescriptClass(
            listOf("src", "cellar_module", "CellarModule"),
            AngularMetadata(AngularDeclaration(declarations = listOf("CaveComponent", "TorchComponent"), imports = listOf("LightModule")))
        )
        val lightModule =
            typescriptClass(
                listOf("light", "light_module", "LightModule"),
                AngularMetadata(AngularDeclaration(exports = listOf("Lantern")))
            )
        val torch =
            typescriptClass(
                listOf("src", "torch_component", "TorchComponent"),
                AngularMetadata(AngularDeclaration(selectors = listOf(AngularSelector(element = "app-torch"))))
            )
        val otherTorch =
            typescriptClass(
                listOf("dungeon", "torch_component", "DungeonTorch"),
                AngularMetadata(AngularDeclaration(selectors = listOf(AngularSelector(element = "app-torch"))))
            )
        val lantern =
            typescriptClass(
                listOf("light", "lantern_component", "Lantern"),
                AngularMetadata(AngularDeclaration(selectors = listOf(AngularSelector(element = "app-lantern"))))
            )
        val otherLantern =
            typescriptClass(
                listOf("dungeon", "lantern_component", "OilLantern"),
                AngularMetadata(AngularDeclaration(selectors = listOf(AngularSelector(element = "app-lantern"))))
            )
        val nodes = listOf(template, cave, cellarModule, lightModule, torch, otherTorch, lantern, otherLantern)

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(FileReport(nodes)))

        // Assert
        val resolvedTemplate = resolvedNodes.first { it.language == SupportedLanguage.ANGULAR }
        assertThat(resolvedTemplate.resolvedNodeDependencies.internalDependencies)
            .containsExactlyInAnyOrder(Dependency(torch.pathWithName), Dependency(lantern.pathWithName))
    }

    @Test
    fun `should resolve a selector through modules that export each other`() {
        // Arrange
        val template = angularTemplate(elements = listOf("app-lantern"))
        val cave = typescriptClass(
            listOf("src", "cave_component", "CaveComponent"),
            AngularMetadata(AngularDeclaration(imports = listOf("LightModule")), template.pathWithName)
        )
        val lightModule = typescriptClass(
            listOf("light", "light_module", "LightModule"),
            AngularMetadata(AngularDeclaration(exports = listOf("FlameModule")))
        )
        val flameModule = typescriptClass(
            listOf("light", "flame_module", "FlameModule"),
            AngularMetadata(AngularDeclaration(exports = listOf("LightModule", "Lantern")))
        )
        val lantern =
            typescriptClass(
                listOf("light", "lantern_component", "Lantern"),
                AngularMetadata(AngularDeclaration(selectors = listOf(AngularSelector(element = "app-lantern"))))
            )
        val otherLantern = typescriptClass(
            listOf("dungeon", "lantern_component", "OilLantern"),
            AngularMetadata(AngularDeclaration(selectors = listOf(AngularSelector(element = "app-lantern"))))
        )
        val nodes = listOf(template, cave, lightModule, flameModule, lantern, otherLantern)

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(FileReport(nodes)))

        // Assert
        val resolvedTemplate = resolvedNodes.first { it.language == SupportedLanguage.ANGULAR }
        assertThat(resolvedTemplate.resolvedNodeDependencies.internalDependencies).containsExactly(Dependency(lantern.pathWithName))
    }

    @Test
    fun `should leave a selector several classes declare unresolved when the scope of its component does not decide`() {
        // Arrange
        val template = angularTemplate(elements = listOf("app-torch"))
        val cave = typescriptClass(
            listOf("src", "cave_component", "CaveComponent"),
            AngularMetadata(AngularDeclaration(imports = listOf("TorchComponent", "DungeonTorch")), template.pathWithName)
        )
        val torch =
            typescriptClass(
                listOf("lantern", "torch_component", "TorchComponent"),
                AngularMetadata(AngularDeclaration(selectors = listOf(AngularSelector(element = "app-torch"))))
            )
        val dungeonTorch =
            typescriptClass(
                listOf("dungeon", "torch_component", "DungeonTorch"),
                AngularMetadata(AngularDeclaration(selectors = listOf(AngularSelector(element = "app-torch"))))
            )

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(FileReport(listOf(template, cave, torch, dungeonTorch))))

        // Assert
        val resolvedTemplate = resolvedNodes.first { it.language == SupportedLanguage.ANGULAR }
        assertThat(resolvedTemplate.resolvedNodeDependencies.internalDependencies).isEmpty()
    }

    @Test
    fun `should not resolve a used type of other code by a template name`() {
        // Arrange
        val script = Node.build(
            pathWithName = Path(listOf("src", "vault", "Vault")),
            language = SupportedLanguage.TYPESCRIPT,
            usedTypes = setOf(Type.simple("goldCoins"))
        )
        val goldCoins = typescriptClass(listOf("src", "gold-coins_pipe", "GoldCoinsPipe"), templateNames = setOf("goldCoins"))

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(FileReport(listOf(script, goldCoins))))

        // Assert
        val resolvedScript = resolvedNodes.first { it.pathWithName.parts.last() == "Vault" }
        assertThat(resolvedScript.resolvedNodeDependencies.internalDependencies).isEmpty()
    }

    private fun angularTemplate(usedNames: Set<String> = emptySet(), elements: List<String> = emptyList()) = Node.build(
        pathWithName = Path(listOf("src", "cave_component_html")),
        physicalPath = "src/cave.component.html",
        nodeType = NodeType.SCRIPT,
        language = SupportedLanguage.ANGULAR,
        usedTypes = usedNames.map { Type.simple(it) }.toSet(),
        angular = AngularMetadata(AngularDeclaration(elements = elements.map { AngularSelector(element = it) }))
    )

    private fun typescriptClass(pathWithName: List<String>, templateNames: Set<String>) =
        typescriptClass(pathWithName, AngularMetadata(AngularDeclaration(templateNames = templateNames)))

    private fun typescriptClass(pathWithName: List<String>, selector: AngularSelector) =
        typescriptClass(pathWithName, AngularMetadata(AngularDeclaration(selectors = listOf(selector))))

    private fun typescriptClass(pathWithName: List<String>, angular: AngularMetadata) = Node.build(
        pathWithName = Path(pathWithName),
        physicalPath = pathWithName.dropLast(1).joinToString("/") + ".ts",
        language = SupportedLanguage.TYPESCRIPT,
        angular = angular
    )
}
