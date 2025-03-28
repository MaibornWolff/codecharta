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
include("export:CSVExporter")
include("tools:ValidationTool", "tools:ccsh", "tools:InspectionTool", "tools:InteractiveParser", "tools:PipeableParser", "tools:Inquirer")

rootProject.name = "codecharta"
findProject(":tools:PipeableParser")?.name = "PipeableParser"
