package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.bundler

import de.maibornwolff.treesitter.excavationsite.api.AliasPathStart
import de.maibornwolff.treesitter.excavationsite.api.BundlerAlias
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import java.io.File

object BundlerConfigParser {
    private const val WORKING_DIRECTORY = "."

    fun parse(configFile: File): BundlerConfigData? {
        if (!configFile.exists()) {
            return null
        }
        val aliases = TreeSitterDependencies
            .bundlerAliases(configFile.readText())
            .associate { alias -> alias.name to targetOf(alias, configFile.parentFile) }
        return if (aliases.isEmpty()) null else BundlerConfigData(aliases)
    }

    private fun targetOf(alias: BundlerAlias, configDirectory: File): String = when (alias.pathStart) {
        AliasPathStart.AS_WRITTEN -> alias.pathParts.single()
        AliasPathStart.CONFIG_DIRECTORY -> canonicalPathOf(alias.pathParts, configDirectory)
        AliasPathStart.WORKING_DIRECTORY -> canonicalPathOf(alias.pathParts, File(WORKING_DIRECTORY))
    }

    private fun canonicalPathOf(pathParts: List<String>, startDirectory: File): String =
        pathParts.fold(startDirectory) { directory, part -> directory.resolve(part) }.canonicalPath
}
