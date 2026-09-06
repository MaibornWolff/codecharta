plugins {
    `java-library`
}

dependencies {
    api(libs.tree.sitter)

    implementation(libs.tree.sitter.java)
    implementation(libs.tree.sitter.kotlin)
    implementation(libs.tree.sitter.typescript)
    implementation(libs.tree.sitter.javascript)
    implementation(libs.tree.sitter.python)
    implementation(libs.tree.sitter.go)
    implementation(libs.tree.sitter.php)
    implementation(libs.tree.sitter.ruby)
    implementation(libs.tree.sitter.swift)
    implementation(libs.tree.sitter.bash)
    implementation(libs.tree.sitter.rust)
    implementation(libs.tree.sitter.csharp)
    implementation(libs.tree.sitter.cpp)
    implementation(libs.tree.sitter.c)
    implementation(libs.tree.sitter.objc)
    implementation(libs.tree.sitter.vue)
    implementation(libs.tree.sitter.abl)
    implementation(files("libs/tree-sitter-tsx-0.23.2.jar"))
    implementation(files("libs/tree-sitter-pascal-0.10.2.jar"))

    testImplementation(libs.kotlin.test)
    testImplementation(libs.archunit.junit5)
}

kotlin {
    compilerOptions {
        allWarningsAsErrors.set(true)
    }
}

tasks.test {
    useJUnitPlatform()
}
