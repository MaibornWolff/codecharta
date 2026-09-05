package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_DEFAULT_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.resolveImportPath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.stripSourceFileExtension
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.withoutFileSuffix
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.defaultImportPath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue.queries.ScriptBlock
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue.queries.VueScriptExtractorQuery
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue.queries.VueTemplateComponentUsageQuery
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.treesitter.TSNode
import org.treesitter.TSParser
import org.treesitter.TreeSitterVue

// VueAnalyzer implements LanguageAnalyzer directly rather than extending BaseLanguageAnalyzer
// because Vue files require a two-pass analysis: first a TSQuery parse of the Vue SFC structure
// (to extract the <script> and <template> blocks), then a TSE analysis of the script content.
// BaseLanguageAnalyzer assumes a single TSE pass over the raw file content, which doesn't apply here.
class VueAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    private val vue = TreeSitterVue()
    private val scriptExtractorQuery = VueScriptExtractorQuery(vue)
    private val templateComponentUsageQuery = VueTemplateComponentUsageQuery(vue)

    override fun analyze(): FileReport {
        val rootNode = parseCode(fileInfo.content)
        val componentPath = fileInfo.physicalPathAsPath().withoutFileSuffix("vue")

        val scriptBlocks = scriptExtractorQuery.execute(rootNode, fileInfo.content).filter { it.content.isNotEmpty() }
        val templateComponents = templateComponentUsageQuery.execute(rootNode, fileInfo.content)

        val scriptResults = scriptBlocks.map { analyzeScript(it) }
        val scriptDependencies = scriptResults.flatMap { (dependencies, _) -> dependencies }.toSet()
        val scriptUsedTypes = scriptResults.flatMap { (_, usedTypes) -> usedTypes }.toSet()

        val templateDependencies = templateComponents
            .map { componentName ->
                Dependency(path = Path.fromStringWithDots(componentName))
            }.toSet()

        val templateUsedTypes = templateComponents.map { Type.simple(it) }.toSet()

        val componentNode = Node(
            pathWithName = componentPath,
            physicalPath = fileInfo.physicalPath,
            language = fileInfo.language,
            nodeType = NodeType.CLASS,
            dependencies = scriptDependencies + templateDependencies,
            usedTypes = templateUsedTypes + scriptUsedTypes
        )

        return FileReport(nodes = listOf(componentNode))
    }

    private fun analyzeScript(scriptBlock: ScriptBlock): Pair<Set<Dependency>, Set<Type>> {
        val tseLanguage = tseLanguageFor(scriptBlock.lang)
        val tseResult = TreeSitterDependencies.analyze(scriptBlock.content, tseLanguage)
        val dependencies = tseResult.imports
            .map { import ->
                val resolvedPath = resolveImportPath(import.defaultImportPath(), fileInfo)
                Dependency(path = Path(resolvedPath), isWildcard = import.isWildcard)
            }.toSet()
        val usedTypes = tseResult.imports
            .filter { !it.isWildcard && it.path.isNotEmpty() }
            .mapNotNull { import ->
                val specifier = import.defaultImportPath().last().stripSourceFileExtension()
                if (specifier.isEmpty() || specifier == TSE_DEFAULT_EXPORT_NAME) null else Type.simple(specifier)
            }.toSet()
        return Pair(dependencies, usedTypes)
    }

    private fun tseLanguageFor(lang: String?): Language = when (lang?.lowercase()) {
        "ts" -> Language.TYPESCRIPT
        "tsx" -> Language.TSX
        else -> Language.JAVASCRIPT
    }

    private fun parseCode(vueCode: String): TSNode {
        val parser = TSParser()
        parser.language = vue
        val tree = parser.parseString(null, vueCode)
        return tree.rootNode
    }
}
