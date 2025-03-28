plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.9.0"
}

include("model")
include("filter:MergeFilter", "filter:EdgeFilter", "filter:StructureModifier")
include(
    "import:CodeMaatImporter",
    "import:CoverageImporter",
    "import:CSVImporter",
    "import:SonarImporter",
    "import:SourceMonitorImporter",
    "import:TokeiImporter"
)
include(
    "parser:RawTextParser",
    "parser:GitLogParser",
    "parser:SourceCodeParser",
    "parser:SVNLogParser"
)
include("analysers:exporters:CSVExporter")
include(
    "analysers:tools:ValidationTool",
    "analysers:tools:ccsh",
    "analysers:tools:InspectionTool",
    "analysers:tools:InteractiveParser",
    "analysers:tools:PipeableParser",
    "analysers:tools:Inquirer"
)

rootProject.name = "codecharta"
findProject(":analysers:tools:PipeableParser")?.name = "PipeableParser"
include("analysers")
