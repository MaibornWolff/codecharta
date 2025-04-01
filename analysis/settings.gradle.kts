plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.9.0"
}

include("model")
include("analysers:filters:MergeFilter", "analysers:filters:EdgeFilter", "analysers:filters:StructureModifier")
include(
    "analysers:importers:CodeMaatImporter",
    "analysers:importers:CoverageImporter",
    "analysers:importers:CSVImporter",
    "analysers:importers:SonarImporter",
    "analysers:importers:SourceMonitorImporter",
    "analysers:importers:TokeiImporter"
)
include(
    "analysers:parsers:RawTextParser",
    "analysers:parsers:GitLogParser",
    "analysers:parsers:SourceCodeParser",
    "analysers:parsers:SVNLogParser"
)
include("analysers:exporters:CSVExporter")
include(
    "analysers:tools:ValidationTool",
    "analysers:tools:ccsh",
    "analysers:tools:InspectionTool",
    "analysers:tools:PipeableParser",
    "analysers:tools:Inquirer"
)
include("analysers:InteractiveParser")

rootProject.name = "codecharta"
findProject(":analysers:tools:PipeableParser")?.name = "PipeableParser"
include("analysers")
