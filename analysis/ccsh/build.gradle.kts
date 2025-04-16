plugins {
    application
}

application {
    applicationName = "ccsh"
    mainClass = "de.maibornwolff.codecharta.ccsh.Ccsh"
}

dependencies {
    implementation(project(":model"))

    val projects =
        listOf(
            ":analysers:importers:CodeMaatImporter",
            ":analysers:importers:CoverageImporter",
            ":analysers:importers:CSVImporter",
            ":analysers:filters:StructureModifier",
            ":analysers:parsers:SVNLogParser",
            ":analysers:importers:SonarImporter",
            ":analysers:parsers:SourceCodeParser",
            ":analysers:importers:TokeiImporter",
            ":analysers:filters:MergeFilter",
            ":analysers:filters:EdgeFilter",
            ":analysers:tools:ValidationTool",
            ":analysers:exporters:CSVExporter",
            ":analysers:parsers:GitLogParser",
            ":analysers:parsers:RawTextParser",
            ":analysers:tools:InspectionTool",
            ":analysers:AnalyserInterface",
            ":dialogProvider",
            ":analysers:importers:SourceMonitorImporter"
        )

    projects.forEach {
        val projectDependency = project(it)
        implementation(projectDependency)
    }

    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.junit.jupiter.api)
}

tasks.jar {
    archiveBaseName.set(application.applicationName)
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
    manifest {
        attributes(
            "Main-Class" to application.mainClass,
            "Implementation-Title" to "CodeCharta ccsh",
            "Implementation-Version" to project.version
        )
    }
    isZip64 = true
    exclude("META-INF/*.RSA", "META-INF/*.SF", "META-INF/*.DSA")
    from({
        configurations.runtimeClasspath.get().filter { it.isDirectory }.plus(
            configurations.runtimeClasspath.get().files.map { zipTree(it) }
        )
    })
}

tasks.named<CreateStartScripts>("startScripts") {
    doLast {
        windowsScript.writeText(
            windowsScript
                .readText()
                .replace(Regex("set CLASSPATH=.*"), "set CLASSPATH=.;%APP_HOME%/lib/*")
        )
        unixScript.writeText(
            unixScript
                .readText()
                .replace(Regex("DEFAULT_JVM_OPTS=.*"), "")
                .replace("#!/usr/bin/env sh", "")
        )
    }
}

tasks.named<Test>("test") {
    useJUnitPlatform()
}
