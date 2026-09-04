package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.tsconfig

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

    private fun resolveWithInheritance(tsconfigFile: File): TsConfigData? {
        val config = getCachedOrParse(tsconfigFile) ?: return null

        if (config.extends == null) {
            return config
        }

        val parentFile = resolveExtendsPath(tsconfigFile, config.extends)
        if (!parentFile.exists()) {
            return config
        }

        val parentConfig = resolveWithInheritance(parentFile) ?: return config

        return mergeConfigs(parentConfig, config)
    }

    private fun resolveExtendsPath(tsconfigFile: File, extendsPath: String): File = if (File(extendsPath).isAbsolute) {
        File(extendsPath)
    } else {
        tsconfigFile.parentFile.resolve(extendsPath)
    }

    private fun mergeConfigs(parent: TsConfigData, child: TsConfigData): TsConfigData {
        val parentOptions = parent.compilerOptions
        val childOptions = child.compilerOptions

        if (parentOptions == null) {
            return child
        }

        if (childOptions == null) {
            return TsConfigData(
                compilerOptions = parentOptions,
                extends = null
            )
        }

        val mergedPaths = mutableMapOf<String, List<String>>()
        parentOptions.paths?.let { mergedPaths.putAll(it) }
        childOptions.paths?.let { mergedPaths.putAll(it) }

        val mergedCompilerOptions = CompilerOptions(
            baseUrl = childOptions.baseUrl ?: parentOptions.baseUrl,
            paths = if (mergedPaths.isEmpty()) null else mergedPaths
        )

        return TsConfigData(
            compilerOptions = mergedCompilerOptions,
            extends = null
        )
    }
}
