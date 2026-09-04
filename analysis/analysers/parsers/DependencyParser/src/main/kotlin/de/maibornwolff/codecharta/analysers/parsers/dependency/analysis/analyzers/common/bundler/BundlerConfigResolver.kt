package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.bundler

import java.io.File
import java.util.Collections
import java.util.Optional
import java.util.concurrent.ConcurrentHashMap

/**
 * Finds bundler config files (webpack, vite, vue) by walking up from a source file.
 * Caches parsed configs for performance. The caches are thread-safe because the analysis
 * run is multi-threaded and this resolver is shared via AliasPathResolver.
 */
class BundlerConfigResolver {
    private val cache: MutableMap<String, BundlerConfigData?> = Collections.synchronizedMap(mutableMapOf())

    // Caches the upward config-file lookup per starting directory so the directory walk runs once
    // per directory instead of once per bare import (Optional models the "no config found" result,
    // which ConcurrentHashMap cannot store as null).
    private val lookupCache = ConcurrentHashMap<String, Optional<File>>()

    companion object {
        // Priority order: Vite (modern) > Vue CLI > Webpack (legacy)
        private val CONFIG_FILENAMES = listOf(
            "vite.config.ts",
            "vite.config.js",
            "vue.config.js",
            "webpack.config.js"
        )
    }

    fun findBundlerConfig(sourceFile: File): BundlerConfigResult? {
        val configFile = findConfigFile(sourceFile) ?: return null
        val data = getCachedOrParse(configFile) ?: return null
        return BundlerConfigResult(data, configFile)
    }

    private fun findConfigFile(sourceFile: File): File? {
        val startDir = (if (sourceFile.isDirectory) sourceFile else sourceFile.parentFile) ?: return null
        val cached = lookupCache.computeIfAbsent(startDir.absolutePath) {
            Optional.ofNullable(walkForConfigFile(startDir))
        }
        return cached.orElse(null)
    }

    private fun walkForConfigFile(startDir: File): File? {
        var currentDir: File? = startDir

        while (currentDir != null) {
            for (filename in CONFIG_FILENAMES) {
                val configFile = currentDir.resolve(filename)
                if (configFile.exists()) {
                    return configFile
                }
            }
            currentDir = currentDir.parentFile
        }

        return null
    }

    private fun getCachedOrParse(configFile: File): BundlerConfigData? {
        val absolutePath = configFile.absolutePath
        return cache.getOrPut(absolutePath) {
            BundlerConfigParser.parse(configFile)
        }
    }
}
