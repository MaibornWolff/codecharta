package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.FileSummary
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.MetricType
import de.maibornwolff.codecharta.model.*
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import java.io.OutputStreamWriter

class SourceCodeComponentProjectBuilder(projectName: String) {

    private val projectBuilder = ProjectBuilder(projectName)

    fun build(): Project {
        return projectBuilder.build()
    }

    fun addComponentAsNode(fileSummary: FileSummary): SourceCodeComponentProjectBuilder {
        val node = MutableNode(fileSummary.name, attributes = hashMapOf(
                "lines_of_code" to fileSummary[MetricType.LoC],
                "rloc" to fileSummary[MetricType.RLoc])
        )
        val path = PathFactory.fromFileSystemPath(fileSummary.path)

        projectBuilder.insertByPath(path, node)
        return this
    }

    fun print(){
        ProjectSerializer.serializeProject(projectBuilder.build(), OutputStreamWriter(System.out))
    }
}