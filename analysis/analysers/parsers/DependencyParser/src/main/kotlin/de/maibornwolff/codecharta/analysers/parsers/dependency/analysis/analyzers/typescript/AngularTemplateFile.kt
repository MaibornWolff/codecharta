package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.splitNameToParts
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path

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
