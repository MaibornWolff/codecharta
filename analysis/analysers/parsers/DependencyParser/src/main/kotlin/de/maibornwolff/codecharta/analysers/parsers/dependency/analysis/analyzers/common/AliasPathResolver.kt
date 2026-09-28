package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.bundler.BundlerAliasResolver
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.bundler.BundlerConfigResolver
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.federation.FederationAliasResolver
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.federation.FederationConfigResolver
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.model.DirectImport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.tsconfig.PathAliasResolver
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.tsconfig.TsConfigResolver
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import java.io.File

/**
 * Resolves bare (non-relative) import specifiers to project-relative paths using a fallback chain:
 * 1. tsconfig.json / jsconfig.json path aliases
 * 2. Bundler config aliases (webpack, vite, vue.config)
 * 3. Module Federation remotes
 *
 * Returns null if no alias config matches, so callers leave the import unresolved (as before).
 *
 * TSE's per-file API (`analyze(content, language)`) has no access to the file path, project root,
 * or config files, so this project-level resolution lives in DC. The wrapped resolvers cache parsed
 * configs by absolute path; this object is shared across the (multi-threaded) analysis run, and the
 * underlying caches are synchronized.
 */
object AliasPathResolver {
    private val tsConfigResolver = TsConfigResolver()
    private val bundlerConfigResolver = BundlerConfigResolver()
    private val federationConfigResolver = FederationConfigResolver()

    /**
     * @param importString the bare import specifier as written in source (e.g. "@shared/utils")
     * @param fileInfo the file containing the import; must carry a non-null analysisRoot
     * @return the resolved project-relative Path, or null if no alias config applies
     */
    fun resolve(importString: String, fileInfo: FileInfo): Path? {
        val analysisRoot = fileInfo.analysisRoot ?: return null
        val sourceFile = analysisRoot.resolve(fileInfo.physicalPath)
        val import = DirectImport(importString)

        return tryTsConfig(import, sourceFile, analysisRoot)
            ?: tryBundler(import, sourceFile, analysisRoot)
            ?: tryFederation(import, sourceFile, analysisRoot)
    }

    private fun tryTsConfig(import: DirectImport, sourceFile: File, analysisRoot: File): Path? {
        val tsConfigResult = tsConfigResolver.findTsConfig(sourceFile) ?: return null
        return PathAliasResolver.resolve(
            import,
            tsConfigResult.data,
            tsConfigResult.file.parentFile,
            analysisRoot
        )
    }

    private fun tryBundler(import: DirectImport, sourceFile: File, analysisRoot: File): Path? {
        val bundlerResult = bundlerConfigResolver.findBundlerConfig(sourceFile) ?: return null
        return BundlerAliasResolver.resolve(import, bundlerResult.data, analysisRoot)
    }

    private fun tryFederation(import: DirectImport, sourceFile: File, analysisRoot: File): Path? {
        val federationResult = federationConfigResolver.findConsumerConfig(sourceFile) ?: return null
        return FederationAliasResolver.resolve(
            import,
            federationResult,
            federationConfigResolver,
            analysisRoot
        )
    }
}
