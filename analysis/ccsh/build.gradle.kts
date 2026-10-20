plugins {
    application
}

val nativeAccessFlag = "--enable-native-access=ALL-UNNAMED"
val minimumJavaVersion: Int by rootProject.extra

// Below Java 17 the JVM rejects the native access flag of the start scripts before the launcher runs, so the launcher
// only has to load on Java 11, the oldest release javac compiles for without warning it is obsolete.
val launcherJavaVersion = 11
val launcher: SourceSet by sourceSets.creating

// The JVM decodes file names with the charset of LC_CTYPE, a value it does not let -Dsun.jnu.encoding override, and
// cannot open a file whose name that charset cannot decode. macOS JVMs always decode file names as UTF-8.
val utf8FileNamesGuard =
    """
    if ! "${'$'}darwin" ; then
        case "${'$'}{LC_ALL:-${'$'}{LC_CTYPE:-${'$'}{LANG:-}}}" in
            *.[Uu][Tt][Ff]-8* | *.[Uu][Tt][Ff]8* ) ;;
            * ) if [ -n "${'$'}{LC_ALL:-}" ] ; then export LC_ALL=C.UTF-8 ; else export LC_CTYPE=C.UTF-8 ; fi ;;
        esac
    fi
    """.trimIndent()

application {
    applicationName = "ccsh"
    mainClass = "de.maibornwolff.codecharta.ccsh.launcher.CcshLauncher"
    applicationDefaultJvmArgs = listOf(nativeAccessFlag)
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
            ":analysers:tools:GateTool",
            ":analysers:tools:AnalyseTool",
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

    testImplementation(launcher.output)
    testImplementation(libs.junit.jupiter.api)
    testImplementation(libs.archunit.junit5)
}

tasks.named<JavaCompile>(launcher.compileJavaTaskName) {
    options.release.set(launcherJavaVersion)
}

tasks.named<ProcessResources>(launcher.processResourcesTaskName) {
    inputs.property("minimumJavaVersion", minimumJavaVersion)
    filesMatching("**/launcher.properties") {
        expand("minimumJavaVersion" to minimumJavaVersion)
    }
}

tasks.jar {
    archiveBaseName.set(application.applicationName)
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
    manifest {
        attributes(
            "Main-Class" to application.mainClass,
            "Implementation-Title" to "CodeCharta ccsh",
            "Implementation-Version" to project.version,
            "Enable-Native-Access" to "ALL-UNNAMED"
        )
    }
    isZip64 = true
    exclude("META-INF/*.RSA", "META-INF/*.SF", "META-INF/*.DSA")
    // The `from` below unpacks the resolved files, which carry no task provenance, so the modules whose
    // jars end up inside the fat jar have to be declared as producers here.
    dependsOn(configurations.runtimeClasspath)
    from(launcher.output)
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
                .replace(Regex("set CLASSPATH=.*"), "set CLASSPATH=%APP_HOME%/lib/*")
        )
        unixScript.writeText(
            unixScript
                .readText()
                .replace(Regex("DEFAULT_JVM_OPTS=.*")) {
                    "DEFAULT_JVM_OPTS=\"$nativeAccessFlag \${DEFAULT_JVM_OPTS:-}\"\n\n$utf8FileNamesGuard"
                }.replace("#!/usr/bin/env sh", "")
        )
    }
}

tasks.named<Test>("test") {
    useJUnitPlatform()
    systemProperty("minimumJavaVersion", minimumJavaVersion)
}
