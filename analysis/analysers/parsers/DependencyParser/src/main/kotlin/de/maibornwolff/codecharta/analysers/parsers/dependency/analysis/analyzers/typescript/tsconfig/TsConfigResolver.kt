package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.tsconfig

import de.maibornwolff.codecharta.util.Logger
import java.io.File
import java.util.Collections
import java.util.Optional
import java.util.concurrent.ConcurrentHashMap

class TsConfigResolver {
    // Analysis runs multi-threaded, so the caches must be safe for concurrent access.
    private val cache: MutableMap<String, TsConfigData?> = Collections.synchronizedMap(mutableMapOf())

    // Caches the upward config-file lookup per starting directory so the directory walk runs once
    // per directory instead of once per bare import (Optional models the "no config found" result,
    // which ConcurrentHashMap cannot store as null).
    private val lookupCache = ConcurrentHashMap<String, Optional<File>>()

    companion object {
        private const val TSCONFIG_FILENAME = "tsconfig.json"
        private const val JSCONFIG_FILENAME = "jsconfig.json"
        private const val JSON_EXTENSION = ".json"
        private const val CURRENT_DIRECTORY = "."
    }

    fun findTsConfig(sourceFile: File): TsConfigResult? {
        val tsconfigFile = findTsConfigFile(sourceFile) ?: return null
        val data = resolveWithInheritance(tsconfigFile) ?: return null
        return TsConfigResult(data, tsconfigFile)
    }

    private fun findTsConfigFile(sourceFile: File): File? {
        val startDir = (if (sourceFile.isDirectory) sourceFile else sourceFile.parentFile) ?: return null
        val cached = lookupCache.computeIfAbsent(startDir.absolutePath) {
            Optional.ofNullable(walkForConfigFile(startDir))
        }
        return cached.orElse(null)
    }

    private fun walkForConfigFile(startDir: File): File? {
        var currentDir: File? = startDir

        while (currentDir != null) {
            // Prefer tsconfig.json if it exists, otherwise use jsconfig.json
            val tsconfigFile = currentDir.resolve(TSCONFIG_FILENAME)
            if (tsconfigFile.exists()) {
                return tsconfigFile
            }

            val jsconfigFile = currentDir.resolve(JSCONFIG_FILENAME)
            if (jsconfigFile.exists()) {
                return jsconfigFile
            }

            currentDir = currentDir.parentFile
        }

        return null
    }

    private fun getCachedOrParse(tsconfigFile: File): TsConfigData? {
        val absolutePath = tsconfigFile.absolutePath
        return cache.getOrPut(absolutePath) {
            TsConfigParser.parse(tsconfigFile)
        }
    }

    /**
     * The merged config is expressed relative to [tsconfigFile]'s directory, the way TypeScript reads it:
     * `baseUrl` is relative to the config that defines it, and `paths` are relative to the effective
     * `baseUrl` or, without one, to the config that defines them. An inherited entry is therefore
     * rebased onto the child before merging.
     */
    private fun resolveWithInheritance(tsconfigFile: File): TsConfigData? {
        val config = getCachedOrParse(tsconfigFile) ?: return null

        if (config.extends == null) {
            return config
        }

        val parentFile = resolveExtendsPath(tsconfigFile, config.extends)
        if (parentFile == null) {
            Logger.warn { "${tsconfigFile.path} extends '${config.extends}', which was not found; its path aliases are ignored" }
            return config
        }

        val parentConfig = resolveWithInheritance(parentFile) ?: return config
        return mergeConfigs(parentConfig, parentFile.parentFile, config, tsconfigFile.parentFile)
    }

    // TypeScript appends `.json` when the named file does not exist, so `"extends": "./tsconfig.base"` works.
    private fun resolveExtendsPath(tsconfigFile: File, extendsPath: String): File? {
        val named = if (File(extendsPath).isAbsolute) File(extendsPath) else tsconfigFile.parentFile.resolve(extendsPath)
        if (named.exists()) return named
        val withJsonExtension = File(named.path + JSON_EXTENSION)
        return withJsonExtension.takeIf { !named.path.endsWith(JSON_EXTENSION) && it.exists() }
    }

    private fun mergeConfigs(parent: TsConfigData, parentDir: File, child: TsConfigData, childDir: File): TsConfigData {
        val parentOptions = parent.compilerOptions ?: return child
        val childOptions = child.compilerOptions ?: CompilerOptions()

        val baseUrl = childOptions.baseUrl ?: parentOptions.baseUrl?.let { rebase(it, parentDir, childDir) }
        val parentPaths = parentOptions.paths.orEmpty().mapValues { (_, targets) ->
            if (baseUrl == null) targets.map { rebase(it, parentDir, childDir) } else targets
        }
        val mergedPaths = parentPaths + childOptions.paths.orEmpty()

        return TsConfigData(
            compilerOptions = CompilerOptions(baseUrl = baseUrl, paths = mergedPaths.ifEmpty { null }),
            extends = null
        )
    }

    private fun rebase(path: String, from: File, to: File): String {
        val absolute = from.absoluteFile.resolve(path).normalize()
        val relative = absolute.relativeToOrNull(to.absoluteFile.normalize())?.invariantSeparatorsPath ?: return absolute.path
        return relative.ifEmpty { CURRENT_DIRECTORY }
    }
}
