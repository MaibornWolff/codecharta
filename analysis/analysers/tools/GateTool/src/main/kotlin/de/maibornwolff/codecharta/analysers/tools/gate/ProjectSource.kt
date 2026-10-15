package de.maibornwolff.codecharta.analysers.tools.gate

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.tools.gate.analysis.ConfiguredAnalyser
import de.maibornwolff.codecharta.analysers.tools.gate.analysis.ProjectAnalyser
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateException
import de.maibornwolff.codecharta.analysers.tools.gate.report.counted
import de.maibornwolff.codecharta.analysers.tools.gate.rules.AnalysedProject
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import java.io.File
import java.util.Locale
import kotlin.time.DurationUnit
import kotlin.time.measureTimedValue

class LoadedProject(val project: AnalysedProject, val analyserNames: List<String>)

class ProjectSource(
    private val options: GateOptions,
    private val console: GateConsole,
    private val createAnalysers: () -> List<AnalyserInterface>
) {
    fun load(config: GateConfig): LoadedProject = options.mapFile?.let(::readMap) ?: analyse(config)

    fun outputFolder(config: GateConfig): File = GateConfig.resolve(options.projectFolder, config.output)

    private fun readMap(mapFile: File): LoadedProject {
        if (!mapFile.isFile) throw GateException("The map ${mapFile.path} does not exist.")
        val project =
            try {
                mapFile.inputStream().use { ProjectDeserializer.deserializeProject(it) }
            } catch (exception: Exception) {
                throw GateException("${mapFile.path} is not a readable cc.json map: ${exception.message}")
            }
        val loaded = LoadedProject(AnalysedProject(project), emptyList())
        console.printSeparated("Map read: ${counted(loaded.project.files.size, "file")} from ${mapFile.path}")
        return loaded
    }

    private fun analyse(config: GateConfig): LoadedProject {
        val analysers = console.whileAnalysing { applicableAnalysers(config) }
        val analyserNames = analysers.map { it.analyser.name }
        console.printInPlaceOfAnalyserOutput("Analysing ${analysisFolder(config).path} with ${analyserNames.joinToString()} ...")
        val (project, duration) = measureTimedValue { console.whileAnalysing { analyseAndKeepMap(analysers, config) } }
        val loaded = LoadedProject(AnalysedProject(project), analyserNames)
        val seconds = String.format(Locale.ROOT, "%.1f", duration.toDouble(DurationUnit.SECONDS))
        console.printSeparated(
            "Analysis done: ${counted(loaded.project.files.size, "file")} with ${analyserNames.joinToString()} in $seconds s"
        )
        return loaded
    }

    private fun analyseAndKeepMap(analysers: List<ConfiguredAnalyser>, config: GateConfig): Project {
        val outputFolder = outputFolder(config)
        val project = ProjectAnalyser().analyse(analysisFolder(config), analysers, outputFolder, config.parallel)
        outputFolder.mkdirs()
        ProjectSerializer.serializeToFileOrStream(project, File(outputFolder, MAP_FILE_NAME).path, console.output, true)
        return project
    }

    private fun applicableAnalysers(config: GateConfig): List<ConfiguredAnalyser> = createAnalysers()
        .filter { config.isAnalyserEnabled(it.name) && it.isApplicable(analysisFolder(config).path) }
        .map { ConfiguredAnalyser(it, config.argumentsFor(it.name)) }

    private fun analysisFolder(config: GateConfig): File =
        config.input?.let { GateConfig.resolve(options.projectFolder, it) } ?: options.projectFolder

    companion object {
        private const val MAP_FILE_NAME = "map.cc.json"
    }
}
