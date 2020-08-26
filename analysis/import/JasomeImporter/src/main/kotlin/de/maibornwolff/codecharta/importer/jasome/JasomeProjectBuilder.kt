package de.maibornwolff.codecharta.importer.jasome

import de.maibornwolff.codecharta.importer.jasome.model.Class
import de.maibornwolff.codecharta.importer.jasome.model.Package
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.math.BigDecimal

class JasomeProjectBuilder() {

    private val projectBuilder = ProjectBuilder()

    fun add(jasomeProject: de.maibornwolff.codecharta.importer.jasome.model.Project): JasomeProjectBuilder {
        jasomeProject.packages.orEmpty().forEach { this.add(it) }
        return this
    }

    fun add(jasomePackage: Package): JasomeProjectBuilder {
        if (!jasomePackage.name.isNullOrBlank()) {
            val nodeForPackage = createNode(jasomePackage)
            val parentPath = createPathByPackageName(jasomePackage.name!!).parent
            projectBuilder.insertByPath(parentPath, nodeForPackage)
        }
        jasomePackage.classes.orEmpty()
            .forEach { this.add(jasomePackage.name ?: "", it) }
        return this
    }

    fun add(packageName: String, jasomeClass: Class): JasomeProjectBuilder {
        val nodeForClass = createNode(jasomeClass)
        val parentPath = createPathByPackageName(packageName)
        runBlocking(Dispatchers.Default) {
            launch {
                projectBuilder.insertByPath(parentPath, nodeForClass)
            }
        }
        return this
    }

    private fun createPathByPackageName(packageName: String): Path {
        return PathFactory.fromFileSystemPath(packageName, '.')
    }

    private fun createNode(jasomePackage: Package): MutableNode {
        val attributes =
            jasomePackage.metrics
                ?.filter { !it.name.isNullOrBlank() && !it.value.isNullOrBlank() }
                ?.associateBy({ it.name!! }, { convertMetricValue(it.value) }) ?: mapOf()
        return MutableNode(jasomePackage.name!!.substringAfterLast('.'), NodeType.Folder, attributes)
    }

    private fun createNode(jasomeClass: Class): MutableNode {
        val attributes =
            jasomeClass.metrics
                ?.filter { !it.name.isNullOrBlank() && !it.value.isNullOrBlank() }
                ?.associateBy({ it.name!! }, { convertMetricValue(it.value) }) ?: mapOf()
        return MutableNode(jasomeClass.name ?: "", NodeType.File, attributes)
    }

    private fun convertMetricValue(value: String?): BigDecimal {
        return value?.replace(',', '.', false)?.toBigDecimal() ?: BigDecimal.ZERO
    }

    fun build(): Project {
        return projectBuilder.build()
    }
}
