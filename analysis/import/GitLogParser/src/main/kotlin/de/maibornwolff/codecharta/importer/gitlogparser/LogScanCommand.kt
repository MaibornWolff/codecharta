package de.maibornwolff.codecharta.importer.gitlogparser

import picocli.CommandLine


@CommandLine.Command(
    name = "log-scan",
    description = ["git log parser log-scan - generates cc.json from a given git-log file"],
    footer = ["Copyright(c) 2022, MaibornWolff GmbH"]
)

class LogScanCommand