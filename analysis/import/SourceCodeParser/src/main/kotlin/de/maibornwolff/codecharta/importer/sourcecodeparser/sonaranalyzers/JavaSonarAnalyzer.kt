package de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers

import com.sun.xml.bind.v2.ContextFactory.createContext
import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.FileMetrics
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import org.sonar.api.SonarQubeSide
import org.sonar.api.batch.fs.InputFile
import org.sonar.api.batch.rule.internal.ActiveRulesBuilder
import org.sonar.api.batch.sensor.internal.SensorContextTester
import org.sonar.api.batch.fs.internal.TestInputFileBuilder
import org.sonar.api.batch.rule.CheckFactory
import org.sonar.api.config.internal.MapSettings
import org.sonar.api.internal.SonarRuntimeImpl
import org.sonar.api.issue.NoSonarFilter
import org.sonar.api.measures.FileLinesContext
import org.sonar.api.measures.FileLinesContextFactory
import org.sonar.api.utils.Version
import org.sonar.java.DefaultJavaResourceLocator
import org.sonar.java.JavaClasspath
import org.sonar.java.JavaTestClasspath
import org.sonar.java.SonarComponents
import org.sonar.java.filters.PostAnalysisIssueFilter
import org.sonar.plugins.java.Java
import org.sonar.plugins.java.JavaSquidSensor
import java.io.File
import java.nio.charset.StandardCharsets

class JavaSonarAnalyzer(path:String) : SonarAnalyzer(path){

    override val FILE_EXTENSION = "java"

    // Minimal rules init
    private var activeRules = ActiveRulesBuilder().build()
    private var mapSettings = MapSettings()

    private lateinit var javaClasspath: JavaClasspath
    private lateinit var sonarComponents: SonarComponents


    override fun createContext() {
        sensorContext = SensorContextTester.create(baseDir)
        sensorContext.setRuntime(SonarRuntimeImpl.forSonarQube(Version.create(6,0), SonarQubeSide.SERVER))
        javaClasspath = JavaClasspath(mapSettings.asConfig(), sensorContext.fileSystem())
    }

    override fun buildSonarComponents(){
        val checkFactory = CheckFactory(this.activeRules)
        val javaTestClasspath = JavaTestClasspath(mapSettings.asConfig(), sensorContext.fileSystem())
        val fileLinesContext = mock(FileLinesContext::class.java)
        val fileLinesContextFactory = mock(FileLinesContextFactory::class.java)
        `when`(fileLinesContextFactory.createFor(any(InputFile::class.java))).thenReturn(fileLinesContext)
        sonarComponents = SonarComponents(fileLinesContextFactory, sensorContext.fileSystem(), javaClasspath, javaTestClasspath, checkFactory)
        sonarComponents.setSensorContext(this.sensorContext)
    }

    override fun scanFiles(fileList: List<String>) : Map<String, FileMetrics>{
        var metricsMap: MutableMap<String, FileMetrics> = HashMap()
        for (file in fileList){
            createContext()
            buildSonarComponents()
            addFileToContext(file)
            executeScan()
            val metrics = retrieveMetrics(file)
            metricsMap[file] = metrics
        }
        return metricsMap
    }

    override fun addFileToContext(fileName: String) {
        val inputFile = TestInputFileBuilder.create("moduleKey", fileName)
                .setModuleBaseDir(baseDir.toPath())
                .setCharset(StandardCharsets.UTF_8)
                .setType(InputFile.Type.MAIN)
                .setLanguage(Java.KEY)
                .initMetadata(fileContent(File("$baseDir/$fileName"), StandardCharsets.UTF_8))
                .build()
        sensorContext.fileSystem().add(inputFile)
    }

    override fun executeScan() {
        val javaSquidSensor = JavaSquidSensor(
                sonarComponents,
                sonarComponents.fileSystem,
                DefaultJavaResourceLocator(sonarComponents.fileSystem, javaClasspath),
                mapSettings.asConfig(),
                NoSonarFilter(),
                PostAnalysisIssueFilter(sonarComponents.fileSystem))
        javaSquidSensor.execute(sensorContext)
    }
}