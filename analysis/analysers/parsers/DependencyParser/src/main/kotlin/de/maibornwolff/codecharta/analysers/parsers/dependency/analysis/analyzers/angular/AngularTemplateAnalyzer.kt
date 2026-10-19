package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.angular

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.BaseLanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.Declaration

/**
 * A template is one node named after its file, the file ending included, so it never shares a path with the module of
 * its component. It uses the selectors and pipe names it names, which the resolver matches to the classes declaring them.
 */
class AngularTemplateAnalyzer(fileInfo: FileInfo) : BaseLanguageAnalyzer(fileInfo) {
    override val language = SupportedLanguage.ANGULAR

    override fun buildPathWithName(packagePath: List<String>, declaration: Declaration): Path = fileInfo.physicalPathAsPath()
}
