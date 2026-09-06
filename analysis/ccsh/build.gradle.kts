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
            ":analysers:importers:TokeiImporter",
            ":analysers:filters:MergeFilter",
            ":analysers:filters:EdgeFilter",
            ":analysers:tools:ValidationTool",
            ":analysers:exporters:CSVExporter",
            ":analysers:parsers:GitLogParser",
            ":analysers:parsers:RawTextParser",
            ":analysers:tools:InspectionTool",
            ":analysers:tools:ConvertTool",
            ":analysers:AnalyserInterface",
            ":analysers:parsers:UnifiedParser",
            ":dialogProvider",
            ":analysers:importers:SourceMonitorImporter",
            ":analysers:importers:DependaChartaImporter",
            ":analysers:parsers:DomainLanguageParser",
            ":analysers:parsers:DependencyParser"
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
    // The `from` below unpacks the resolved files, which carry no task provenance, so the modules whose
    // jars end up inside the fat jar have to be declared as producers here.
    dependsOn(configurations.runtimeClasspath)
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
