package de.maibornwolff.codecharta.importer.gitlogparser

import picocli.CommandLine


@CommandLine.Command(
    name = "repo-scan",
    description = ["git log parser log-scan - generates cc.json from a generated git-log file"],
    footer = ["Copyright(c) 2022, MaibornWolff GmbH"]
)

class RepoScanCommand