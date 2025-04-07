import org.jetbrains.kotlin.gradle.dsl.KotlinJvmProjectExtension
import org.sonarqube.gradle.SonarExtension

buildscript {
    repositories {
        mavenCentral()
        maven(url = "https://plugins.gradle.org/m2/")
        maven(url = "https://jitpack.io")
    }
}

plugins {
    id("distribution")
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.sonarqube)
    alias(libs.plugins.ktlint)
    alias(libs.plugins.cyclonedx)
}

allprojects {
    group = "de.maibornwolff.codecharta"
    version = property("currentVersion") as String

    repositories {
        addAll(rootProject.buildscript.repositories)
    }

    apply(plugin = "jacoco")
    apply(plugin = rootProject.libs.plugins.sonarqube.get().pluginId)

    configure<JacocoPluginExtension> {
        toolVersion = rootProject.libs.versions.jacoco.get()
    }
}

subprojects {
    apply(plugin = "kotlin")
    apply(plugin = rootProject.libs.plugins.ktlint.get().pluginId)

    dependencies {
        implementation(rootProject.libs.kotlin.logging.jvm)
        implementation(rootProject.libs.kotlinx.coroutines.core)
        testImplementation(rootProject.libs.junit.jupiter.api)
        testImplementation(rootProject.libs.junit.jupiter.engine)
        testImplementation(rootProject.libs.junit.jupiter.params)
        testImplementation(rootProject.libs.assertj.core)
        testImplementation(rootProject.libs.mockk)
        testImplementation(rootProject.libs.junit.platform.runner)
    }

    tasks.test {
        testLogging {
            events("passed", "skipped", "failed")
        }
        finalizedBy(tasks.named("jacocoTestReport"))
    }

    tasks.named("jacocoTestReport") {
        dependsOn(tasks.named("test"))
    }

    configure<KotlinJvmProjectExtension> {
        jvmToolchain(11)
    }
}

distributions {
    main {
        distributionBaseName = "codecharta-analysis"
        contents {
            from("../LICENSE.md")
            from("CHANGELOG.md")
            from("README.md")

            project.subprojects.forEach { subproject ->
                subproject.plugins.withType(ApplicationPlugin::class.java) {
                    into("bin") {
                        subproject.tasks.findByName("startScripts").let {
                            from(it!!.outputs.files) {
                                filePermissions {
                                    user {
                                        read = true
                                        write = true
                                        execute = true
                                    }
                                    group {
                                        read = true
                                        write = false
                                        execute = true
                                    }
                                    other {
                                        read = true
                                        write = false
                                        execute = true
                                    }
                                }
                            }
                        }
                    }
                    into("lib") {
                        subproject.tasks.findByName("jar").let {
                            from(it!!.outputs.files)
                        }
                    }
                }
            }

            // deprecated ccsh
            from("dist/ccsh")
        }
    }
}

tasks.register<Exec>("integrationTest") {
    group = "verification"
    description = "Runs our golden test script."
    if ((System.getProperties().getProperty("os.name") as String).lowercase().contains("windows")) {
        println("In order to run the integration tests a bash script is executed.")
        println("Make sure to use a shell with bash capability (e.g. GitBash) to run this task.")
        executable("cmd")
        workingDir("test")
        args("/c", "bash -c './golden_test.sh $version'")
    } else {
        executable("sh")
        workingDir("test")
        args("-c", "./golden_test.sh $version")
    }
}

tasks.named<JacocoReport>("jacocoTestReport") {
    dependsOn(tasks.build, rootProject.subprojects.map { it.tasks.named("jacocoTestReport") })

    executionData.setFrom(
        fileTree(project.rootDir) {
            include("**/build/jacoco/*.exec")
        }
    )

    project.subprojects.forEach {
        sourceSets(it.sourceSets.getByName("main"))
    }

    reports {
        xml.required.set(true)
        html.required.set(false)
    }

    classDirectories.setFrom(
        files(
            classDirectories.files.map {
                fileTree(it) {
                    exclude("**/AttributeDescriptors**")
                }
            }
        )
    )
}

configure<SonarExtension> {
    properties {
        property("sonar.coverage.jacoco.xmlReportPaths", "${project.rootDir}/build/reports/jacoco/test/jacocoTestReport.xml")
        property("sonar.exclusions", "**/*AttributeDescriptors*")
    }
}

tasks.named("sonar") {
    dependsOn("build", "jacocoTestReport")
}

tasks.cyclonedxBom {
    setIncludeConfigs(listOf("runtimeClasspath"))
    setSkipConfigs(listOf("compileClasspath", "testCompileClasspath"))
    setProjectType("application")
    setSchemaVersion("1.6")
    setDestination(project.file("build/reports"))
    setOutputName("sbom_analysis.cdx")
    setOutputFormat("json")
    setIncludeLicenseText(true)
}