package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.splitNameToParts
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.AngularMetadata
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.AngularDeclaration
import de.maibornwolff.treesitter.excavationsite.api.Declaration

private const val INLINE_TEMPLATE_NAME = "template"

/**
 * The node path of the template file an Angular component names in its `templateUrl`, which is relative to the file of
 * the component. A template file node is named after its path, see `AngularTemplateAnalyzer`.
 */
internal fun templateFilePath(templateUrl: String, componentFile: String): Path {
    val templateFile = java.nio.file.Path
        .of(componentFile)
        .resolveSibling(templateUrl)
        .normalize()
    return Path(splitNameToParts(templateFile.toString()))
}

/** The node path of the inline template of an Angular component: a part of the component's own path. */
internal fun inlineTemplatePath(componentPath: Path): Path = componentPath + INLINE_TEMPLATE_NAME

/**
 * The inline template of an Angular component as a node in the template language, so the elements and pipe names it
 * uses resolve like those of a template file. It lives in the file of the component, so its edges leave that file.
 */
internal fun inlineTemplateNode(templateDeclarations: List<Declaration>, component: Node): Node = Node(
    pathWithName = inlineTemplatePath(component.pathWithName),
    physicalPath = component.physicalPath,
    nodeType = NodeType.SCRIPT,
    language = SupportedLanguage.ANGULAR,
    dependencies = emptySet(),
    usedTypes = templateDeclarations
        .flatMap { it.usedTypes }
        .map { it.toType() }
        .toSet(),
    angular = AngularMetadata(AngularDeclaration(elements = templateDeclarations.flatMap { it.angular?.elements.orEmpty() }))
)
