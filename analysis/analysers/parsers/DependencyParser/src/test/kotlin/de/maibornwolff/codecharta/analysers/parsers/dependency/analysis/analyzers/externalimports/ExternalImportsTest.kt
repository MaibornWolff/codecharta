package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.externalimports

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.GoAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.javascript.JavascriptAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python.PythonAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust.RustAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.TypescriptAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.codecharta.model.ExternalImport
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class ExternalImportsTest {
    @TempDir
    lateinit var analysisRoot: File

    @Test
    fun `should name the npm packages a TypeScript file imports and leave out project files and Node's own modules`() {
        // Arrange
        write("src/util.ts", "export const helper = 1")
        val code = """
            import { Component } from "@angular/core"
            import debounce from "lodash/debounce"
            import * as fs from "fs"
            import { readFile } from "node:fs/promises"
            import { helper } from "./util"
            import "zone.js"
            export class App {}
        """.trimIndent()

        // Act
        val report = TypescriptAnalyzer(fileInfo(SupportedLanguage.TYPESCRIPT, "src/app.ts", code)).analyze()

        // Assert
        assertThat(report.externalImports).containsExactlyInAnyOrder(npm("@angular/core"), npm("lodash"), npm("zone.js"))
    }

    @Test
    fun `should name the npm packages a JavaScript file requires`() {
        // Arrange
        val code = """
            const express = require("express")
            const { join } = require("path")
            export function start() { return express() }
        """.trimIndent()

        // Act
        val report = JavascriptAnalyzer(fileInfo(SupportedLanguage.JAVASCRIPT, "server.js", code)).analyze()

        // Assert
        assertThat(report.externalImports).containsExactly(npm("express"))
    }

    @Test
    fun `should name the PyPI distributions a Python file imports, by their distribution name`() {
        // Arrange
        write("shop/__init__.py", "")
        write("shop/orders.py", "class Order: pass")
        val code = """
            import os
            import requests
            from yaml import safe_load
            from shop.orders import Order
            from . import orders
            def run(): pass
        """.trimIndent()

        // Act
        val report = PythonAnalyzer(fileInfo(SupportedLanguage.PYTHON, "shop/main.py", code)).analyze()

        // Assert
        assertThat(report.externalImports).containsExactlyInAnyOrder(ExternalImport("pypi", "requests"), ExternalImport("pypi", "PyYAML"))
    }

    @Test
    fun `should name the import paths of Go packages of other modules and leave out the standard library and the project`() {
        // Arrange
        write("go.mod", "module example.com/shop\n")
        write("orders/orders.go", "package orders\n")
        val code = """
            package main

            import (
                "fmt"
                "github.com/google/uuid"
                "example.com/shop/orders"
            )

            func main() {}
        """.trimIndent()

        // Act
        val report = GoAnalyzer(fileInfo(SupportedLanguage.GO, "main.go", code)).analyze()

        // Assert
        assertThat(report.externalImports).containsExactly(ExternalImport("golang", "github.com/google/uuid"))
    }

    @Test
    fun `should name the crates a Rust file uses and leave out the language's crates and the file's own modules`() {
        // Arrange
        val code = """
            mod model;
            use std::collections::HashMap;
            use serde::Deserialize;
            use crate::model::Order;
            use model::Line;
            extern crate rand;
            pub fn run() {}
        """.trimIndent()
        write("Cargo.toml", "[package]\nname = \"shop\"\nversion = \"0.1.0\"\n")
        write("src/model.rs", "pub struct Order;\npub struct Line;")
        write("src/main.rs", code)

        // Act
        val report = RustAnalyzer(fileInfo(SupportedLanguage.RUST, "src/main.rs", code, setOf("src/main.rs", "src/model.rs"))).analyze()

        // Assert
        assertThat(report.externalImports).containsExactlyInAnyOrder(ExternalImport("cargo", "serde"), ExternalImport("cargo", "rand"))
    }

    private fun fileInfo(language: SupportedLanguage, path: String, code: String, analysedFiles: Set<String> = emptySet()) =
        FileInfo(language, path, code, analysisRoot, analysedFiles)

    private fun write(path: String, content: String) {
        File(analysisRoot, path).apply { parentFile.mkdirs() }.writeText(content)
    }

    private fun npm(name: String) = ExternalImport("npm", name)
}
