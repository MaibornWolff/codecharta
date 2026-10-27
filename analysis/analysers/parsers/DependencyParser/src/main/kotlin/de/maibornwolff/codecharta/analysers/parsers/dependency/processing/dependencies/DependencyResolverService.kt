package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileScopedPaths
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.ProjectNames
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.TypeOfUsage
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.resolveTypes
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.NodeInformation
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.dictionaries.CSharpStandardLibrary
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.dictionaries.CppStandardLibrary
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.dictionaries.EmptyStandardLibrary
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.dictionaries.GoStandardLibrary
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.dictionaries.JavaStandardLibrary
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.dictionaries.KotlinStandardLibrary
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.dictionaries.StandardLibrary

class DependencyResolverService {
    companion object {
        private val BASE_TYPE_USAGES = setOf(TypeOfUsage.INHERITANCE, TypeOfUsage.IMPLEMENTATION)

        fun resolveNodes(fileReports: Collection<FileReport>): Collection<Node> {
            val nodes = AngularTemplateReferences.qualify(fileReports.flatMap { it.nodes })
            val nodesByScope = nodes.groupBy { it.language.nameScope }
            val dictionaryByScope = nodesByScope.mapValues { (_, scopedNodes) -> getDictionary(scopedNodes) }
            val knownNodePathsByScope = nodesByScope.mapValues { (_, scopedNodes) -> getKnownNodePaths(scopedNodes) }
            val baseTypeNamesByScope = nodesByScope.mapValues { (_, scopedNodes) -> getBaseTypeNames(scopedNodes) }
            val fileScopedPaths = getFileScopedPaths(nodes)
            val projectNamesByLanguage = nodes.map { it.language }.distinct().associateWith { language ->
                val scope = language.nameScope
                ProjectNames(
                    dictionaryByScope.getValue(scope),
                    standardLibraryFor(language).get(),
                    knownNodePathsByScope.getValue(scope),
                    fileScopedPaths,
                    baseTypeNamesByScope.getValue(scope)
                )
            }
            val resolvedNodes = nodes.map { node ->
                node.resolveTypes(projectNamesByLanguage.getValue(node.language), LanguageRules.namesOf(node.language))
            }
            val rulesInUse = resolvedNodes.map { LanguageRules.namesOf(it.language) }.distinct()
            return rulesInUse.fold(resolvedNodes) { current, rules -> rules.afterResolution(current) }
        }

        // An implementation part depends on the class of its own path, which is no cycle
        fun mapNodeInfo(node: Node): NodeInformation {
            val id = node.pathWithName.withDots()
            return NodeInformation(
                id = id,
                dependencies = node.resolvedNodeDependencies.internalDependencies
                    .map { it.withDots() }
                    .filterTo(HashSet()) { it != id }
            )
        }

        fun getDictionary(nodes: List<Node>) = nodes.map { it.pathWithName }.groupBy { it.parts.last() }

        fun getKnownNodePaths(nodes: List<Node>) = nodes.map { it.pathWithName.withDots() }.toSet()

        private fun getBaseTypeNames(nodes: List<Node>): Map<String, List<String>> = nodes
            .groupBy(
                { it.pathWithName.withDots() }
            ) { node -> node.usedTypes.filter { it.usageSource in BASE_TYPE_USAGES }.map { it.name } }
            .mapValues { (_, baseTypesOfEachCopy) -> baseTypesOfEachCopy.flatten().distinct() }

        private fun getFileScopedPaths(nodes: List<Node>): FileScopedPaths {
            val visibleEverywhere = nodes.filterNot { it.isFileScoped }.mapTo(HashSet()) { it.pathWithName.withDots() }
            val filesByPath = nodes
                .filter { it.isFileScoped && it.pathWithName.withDots() !in visibleEverywhere }
                .groupBy({ it.pathWithName.withDots() }, { it.physicalPath })
                .mapValues { (_, files) -> files.toSet() }
            return FileScopedPaths(filesByPath)
        }

        private fun standardLibraryFor(language: SupportedLanguage): StandardLibrary = when (language) {
            SupportedLanguage.JAVA -> JavaStandardLibrary()
            SupportedLanguage.C_SHARP -> CSharpStandardLibrary()
            SupportedLanguage.TYPESCRIPT -> EmptyStandardLibrary()
            SupportedLanguage.JAVASCRIPT -> EmptyStandardLibrary()
            SupportedLanguage.PHP -> EmptyStandardLibrary()
            SupportedLanguage.GO -> GoStandardLibrary()
            SupportedLanguage.PYTHON -> EmptyStandardLibrary()
            SupportedLanguage.CPP -> CppStandardLibrary()
            SupportedLanguage.KOTLIN -> KotlinStandardLibrary()
            SupportedLanguage.VUE -> EmptyStandardLibrary()
            SupportedLanguage.DELPHI -> EmptyStandardLibrary()
            SupportedLanguage.RUST -> EmptyStandardLibrary()
            SupportedLanguage.ANGULAR -> EmptyStandardLibrary()
            SupportedLanguage.SQL -> EmptyStandardLibrary()
        }
    }
}
