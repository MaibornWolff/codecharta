package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.angular

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.BaseLanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.AngularMetadata
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.EmbeddedDeclarations

/**
 * A template is one node named after its file, the file ending included, so it never shares a path with the module of
 * its component. It uses the pipe names it names and carries its elements, which the resolver matches to the classes
 * declaring them.
 */
class AngularTemplateAnalyzer(fileInfo: FileInfo) : BaseLanguageAnalyzer(fileInfo) {
    override val language = SupportedLanguage.ANGULAR

    override fun buildPathWithName(packagePath: List<String>, declaration: Declaration): Path = fileInfo.physicalPathAsPath()

    override fun nodesOf(declaration: Declaration, node: Node, embedded: List<EmbeddedDeclarations>): List<Node> =
        listOf(node.copy(angular = declaration.angular?.let { AngularMetadata(it) }))
}
