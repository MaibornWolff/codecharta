plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.9.0"
}

include("ccsh")
include("dialogProvider")
include("model")
include("analysers:AnalyserInterface")
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
    "analysers:tools:InspectionTool"
)

rootProject.name = "codecharta"
include("analysers")
