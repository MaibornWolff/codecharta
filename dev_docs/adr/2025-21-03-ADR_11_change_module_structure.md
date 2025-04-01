---
categories:
  - ADR
tags:
  - analysis
  - module
  - structure
title: "ADR 11: Decide Module Structure"
---

Modules are hard to find because they are hidden in the Tools Module. We need to make them more visible and provide a better structure for them.
At the moment the term "parser" is used as a general term and a specific term at the same time. E.g.: We have this message in our CCSH: "No usable parser was found for the input file path!" - this is misleading because we are not looking for specific parsers, but we are looking for parsers, exporters, tools,...
We propose to change the general term "parser" to "analyser" and keep the term parser only for the specific parsers.

We have 5 different analyser types:
- export
- filter
- import
- parser
- tool

All of those 5 analyser types implements the "Callable"-Interface and the "AnalyserInterface"-Interface.
Not all analysers that have a method like: "getAttributeDescriptorMaps" implement the "AttributeGenerator"-Interface - this can lead to confusion and potential errors.

The Tool Module contains more than just tools, it also contains general super types like ccsh, inquirer or interactive parser. We need to separate the tools from the general super types.

# Status

accepted

# Decision

There will be a new Module: "Analysers". This module contains the 5 different analyser type modules. For every of those 5 analyser types, there is an interface.
The "AnalyserInterface" will be renamed to "AnalyserInterface". This interface implements the "Callable"-Interface.
The "PipeableParser" will be renamed to "PipeableAnalyserInterface". (If all analysers should be piepable, we can remove this interface and implement the "PipeableInterface" in the "AnalyserInterface").

The Inquirer module will be placed in the new "AnalyserInterface" module (former "AnalyserInterface" module), because all analysers that implement the "AnalyserInterface"-Interface also need this "Inquirer"-Module.

The "ccsh"-module will be moved one level up to the analysis folder.
All mentions of "parser" in the ccsh are renamed to "analyser".

All ParserDialogs will be renamed to Dialog.

All analysers that have a method like: "getAttributeDescriptorMaps" implement the "AttributeGenerator"-Interface.

The analyser modules will be renamed to:
- export -> exporters
- filter -> filters
- import -> importers
- parser -> parsers

The analyser module contains those modules:
- AnalyserInterface
- PipeableAnalyserInterface
- exporters
- - ExporterInterface
- - CSVExporter
- filters
- - FilterInterface
- - EdgeFilter
- - MergeFilter
- - StructureFilter
- importers
- - ImporterInterface
- - CSVImporter
- - CodeMaatImporter
- - SonarImporter
- - SourceMonitorImporter
- - TokeiImporter
- parsers
- - ParserInterface
- - GitLogParser
- - RawTextParser
- - SourceCodeParser
- - SVNLogParser
- tools
- - ToolInterface
- - ValidationTool
- - InspectorTool

# Consequences
A lot of renaming and restructuring. However, some output messages to the user will be changed slightly, to reflect the new terminology.
The structure will be clearer for the users and the developers.
