package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.federation

import java.io.File
import java.util.Collections
import java.util.Optional
import java.util.concurrent.ConcurrentHashMap

/**
 * Finds package.json files with Module Federation configuration.
 * Caches parsed configs for performance. The caches are thread-safe because the analysis
 * run is multi-threaded and this resolver is shared via AliasPathResolver.
 */
class FederationConfigResolver {
    private val cache: MutableMap<String, FederationConfigData?> = Collections.synchronizedMap(mutableMapOf())

    // Caches the upward package.json lookup per starting directory so the directory walk runs once
    // per directory instead of once per bare import (Optional models the "no config found" result,
    // which ConcurrentHashMap cannot store as null).
    private val lookupCache = ConcurrentHashMap<String, Optional<File>>()

    companion object {
        private const val PACKAGE_JSON = "package.json"
    }

    /**
     * Find the federation config for a consumer module (has remotes).
     */
    fun findConsumerConfig(sourceFile: File): FederationConfigResult? {
        val packageJsonFile = findPackageJsonWithFederation(sourceFile) ?: return null
        val data = getCachedOrParse(packageJsonFile) ?: return null

        if (!data.hasRemotes()) {
            return null
        }

        return FederationConfigResult(
            data = data,
            packageJsonFile = packageJsonFile,
            moduleDir = packageJsonFile.parentFile
        )
    }

    /**
     * Find a producer module by its federation name in a monorepo.
     * Searches sibling directories of the consumer module.
     */
    fun findProducerModule(consumerModuleDir: File, producerModuleName: String): FederationConfigResult? {
        val modulesDir = consumerModuleDir.parentFile ?: return null

        // Search sibling directories for a module with matching federation.name
        val siblingDirs = modulesDir.listFiles { file -> file.isDirectory } ?: return null

        for (siblingDir in siblingDirs) {
            val packageJson = siblingDir.resolve(PACKAGE_JSON)
            if (!packageJson.exists()) {
                continue
            }

            val data = getCachedOrParse(packageJson) ?: continue

            // Match by federation.name or directory name
            if (data.name == producerModuleName || siblingDir.name == producerModuleName) {
                if (data.hasExposes()) {
                    return FederationConfigResult(
                        data = data,
                        packageJsonFile = packageJson,
                        moduleDir = siblingDir
                    )
                }
            }
        }

        return null
    }

    private fun findPackageJsonWithFederation(sourceFile: File): File? {
        val startDir = (if (sourceFile.isDirectory) sourceFile else sourceFile.parentFile) ?: return null
        val cached = lookupCache.computeIfAbsent(startDir.absolutePath) {
            Optional.ofNullable(walkForFederationPackageJson(startDir))
        }
        return cached.orElse(null)
    }

    private fun walkForFederationPackageJson(startDir: File): File? {
        var currentDir: File? = startDir

        while (currentDir != null) {
            val packageJson = currentDir.resolve(PACKAGE_JSON)
            if (packageJson.exists()) {
                val data = getCachedOrParse(packageJson)
                if (data != null && (data.hasRemotes() || data.hasExposes())) {
                    return packageJson
                }
            }
            currentDir = currentDir.parentFile
        }

        return null
    }

    private fun getCachedOrParse(packageJsonFile: File): FederationConfigData? {
        val absolutePath = packageJsonFile.absolutePath
        return cache.getOrPut(absolutePath) {
            FederationConfigParser.parse(packageJsonFile)
        }
    }
}
