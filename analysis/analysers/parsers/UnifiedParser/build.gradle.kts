dependencies {
    implementation(project(":model"))
    implementation(project(":dialogProvider"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":analysers:filters:MergeFilter"))

    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    implementation(libs.treesitter)
    implementation(libs.treesitter.typescript)
    implementation(libs.treesitter.javascript)
    implementation(libs.treesitter.kotlin)
    implementation(libs.treesitter.java)
    implementation(libs.treesitter.csharp)
    implementation(libs.treesitter.cpp)
    implementation(libs.treesitter.c)
    implementation(libs.treesitter.python)
    implementation(libs.treesitter.go)
    implementation(libs.treesitter.php)
    implementation(libs.treesitter.ruby)
    implementation(libs.treesitter.scala)
    implementation(libs.treesitter.swift)
    implementation(libs.treesitter.objc)
    implementation(libs.treesitter.bash)

    testImplementation(libs.jsonassert)
}

tasks.test {
    useJUnitPlatform()
}

repositories {
    mavenCentral()
}
