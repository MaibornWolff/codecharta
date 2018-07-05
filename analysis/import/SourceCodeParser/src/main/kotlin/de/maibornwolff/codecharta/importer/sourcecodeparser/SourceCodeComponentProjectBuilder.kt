package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.common.core.FileSummary
import de.maibornwolff.codecharta.importer.sourcecodeparser.common.core.Metric
import de.maibornwolff.codecharta.model.*
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import java.io.OutputStreamWriter

class SourceCodeComponentProjectBuilder(projectName: String) {

    private val projectBuilder = ProjectBuilder(projectName)

    fun build(): Project {
        return projectBuilder.build()
    }

    fun addComponentAsNode(fileSummary: FileSummary): SourceCodeComponentProjectBuilder{
        val node = MutableNode(fileSummary.name, attributes = hashMapOf(
                "lines_of_code" to fileSummary[Metric.LoC],
                "rloc" to fileSummary[Metric.RLoc])
        )
        val path = PathFactory.fromFileSystemPath(fileSummary.path)

        projectBuilder.insertByPath(path, node)
        return this
    }

    fun print(){
        ProjectSerializer.serializeProject(projectBuilder.build(), OutputStreamWriter(System.out))
    }
}