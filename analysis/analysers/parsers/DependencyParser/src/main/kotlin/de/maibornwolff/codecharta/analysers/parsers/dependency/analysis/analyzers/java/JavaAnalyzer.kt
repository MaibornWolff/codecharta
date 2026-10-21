package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.java

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.BaseLanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.Declaration

class JavaAnalyzer(fileInfo: FileInfo) : BaseLanguageAnalyzer(fileInfo) {
    override val language = SupportedLanguage.JAVA

    override fun buildPathWithName(packagePath: List<String>, declaration: Declaration): Path =
        Path(packagePath + declaration.parentPath + declaration.name)
}
