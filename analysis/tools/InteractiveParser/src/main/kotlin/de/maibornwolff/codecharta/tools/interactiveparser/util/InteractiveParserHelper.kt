package de.maibornwolff.codecharta.tools.interactiveparser.util

class InteractiveParserHelper {

    object GeneralConstants {
        const val GenericFooter = "Copyright(c) 2023, MaibornWolff GmbH"
    }
    object CSVExporterConstants {
        const val name = "csvexport"
        const val description = "generates csv file with header"
    }

    object EdgeFilterConstants {
        const val name = "edgefilter"
        const val description = "aggregates edgeAttributes as nodeAttributes into a new cc.json file"
    }

    object MergeFilterConstants {
        const val name = "merge"
        const val description = "merges multiple cc.json files"
    }

    object StructureModifierConstants {
        const val name = "modify"
        const val description = "changes the structure of cc.json files"
    }

    object CodeMaatImporterConstants {
        const val name = "codemaatimport"
        const val description = "generates cc.json from codemaat coupling csv"
    }

    object CSVImporterConstants {
        const val name = "csvimport"
        const val description = "generates cc.json from csv with header"
    }

    object SourceMonitorImporterConstants {
        const val name = "sourcemonitorimport"
        const val description = "generates cc.json from sourcemonitor csv"
    }

    object GitLogParserConstants {
        const val name = "gitlogparser"
        const val description = "generates cc.json from git-log files"
    }

    object MetricGardenerImporterConstants {
        const val name = "metricgardenerimport"
        const val description = "generates a cc.json file from a project parsed with metric-gardener"
    }

    object SonarImporterConstants {
        const val name = "sonarimport"
        const val description = "generates cc.json from metric data from SonarQube"
    }

    object SourceCodeParserConstants {
        const val name = "sourcecodeparser"
        const val description = "generates cc.json from source code"
        const val footer = "This program uses the SonarJava, which is licensed under the GNU Lesser General Public Library, version 3.\n" +
                           "Copyright(c) 2020, MaibornWolff GmbH"
    }

    object SVNLogParserConstants {
        const val name = "svnlogparser"
        const val description = "generates cc.json from svn log file"
    }

    object TokeiImporterConstants {
        const val name = "tokeiimporter"
        const val description = "generates cc.json from tokei json"
    }

    object RawTextParserConstants {
        const val name = "rawtextparser"
        const val description = "generates cc.json from projects or source code files"
    }

    object ValidationToolConstants {
        const val name = "check"
        const val description = "validates cc.json files"
    }
}
