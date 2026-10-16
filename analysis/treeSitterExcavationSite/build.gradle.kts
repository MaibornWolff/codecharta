plugins {
    `java-library`
}

dependencies {
    // The bonede jars carry the native tree-sitter libraries; their JNI classes are not used.
    runtimeOnly(libs.tree.sitter)
    runtimeOnly(libs.tree.sitter.java)
    runtimeOnly(libs.tree.sitter.kotlin)
    runtimeOnly(libs.tree.sitter.typescript)
    runtimeOnly(libs.tree.sitter.javascript)
    runtimeOnly(libs.tree.sitter.python)
    runtimeOnly(libs.tree.sitter.go)
    runtimeOnly(libs.tree.sitter.php)
    runtimeOnly(libs.tree.sitter.ruby)
    runtimeOnly(libs.tree.sitter.swift)
    runtimeOnly(libs.tree.sitter.bash)
    runtimeOnly(libs.tree.sitter.rust)
    runtimeOnly(libs.tree.sitter.csharp)
    runtimeOnly(libs.tree.sitter.cpp)
    runtimeOnly(libs.tree.sitter.c)
    runtimeOnly(libs.tree.sitter.objc)
    runtimeOnly(libs.tree.sitter.vue)
    runtimeOnly(libs.tree.sitter.abl)
    runtimeOnly(files("libs/tree-sitter-tsx-0.23.2.jar"))
    runtimeOnly(files("libs/tree-sitter-pascal-0.10.2.jar"))
    runtimeOnly(files("libs/tree-sitter-angular-0.9.2.jar"))
    runtimeOnly(files("libs/tree-sitter-sql-island-0.1.0.jar"))

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
