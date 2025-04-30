# Change Log - Analysis

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/)

## [unreleased] (Added 🚀 | Changed | Removed  | Fixed 🐞 | Chore 👨‍💻 👩‍💻)

### Added 🚀

- Add support for multi file input in dialogs [#4030](https://github.com/MaibornWolff/codecharta/pull/4030)
- Add lines of code metric to the raw text parser [#4049](https://github.com/MaibornWolff/codecharta/pull/4049)
- Add support for the coverage importer for:
  - Coverlet (Dotnet) [#4042](https://github.com/MaibornWolff/codecharta/pull/4042)

### Changed

- Removed Metric Gardener Support [#4004](https://github.com/MaibornWolff/codecharta/pull/4004)

### Fixed 🐞

- Fix ccsh visually breaking on windows cmd [#4027](https://github.com/MaibornWolff/codecharta/pull/4027)

## [1.132.0] - 2025-03-25

### Added 🚀

- Added coverage importer for javascript and typescript [#3989](https://github.com/MaibornWolff/codecharta/pull/3989)
- Added coverage importer for java [#3999](https://github.com/MaibornWolff/codecharta/pull/3999)

### Changed

- Changed to a new terminal library [#3609](https://github.com/MaibornWolff/codecharta/pull/3609)

### Fixed 🐞

- Fix urls to not end in "Page not found" [#3995](https://github.com/MaibornWolff/codecharta/issues/3995)

## [1.131.1] - 2025-02-26

### Chore 👨‍💻 👩‍💻

- Update deprecated gradle features [#3948](https://github.com/MaibornWolff/codecharta/pull/3948)

## [1.131.0] - 2025-02-11

### Changed

- Removed the top level from the output structure of the SonarImporter to match the other parsers and importers [3912](https://github.com/MaibornWolff/codecharta/pull/3912)

## [1.130.0] - 2024-12-17

### Added 🚀

- Add a new `--large` flag to the MergeFilter that merges projects into one file each in its own subfolder depending on the input file's dot-prefix name [#3841](https://github.com/MaibornWolff/codecharta/pull/3841)
- Add the ability to the MergeFilter to specify the output file during `--mimo` operation [#3841](https://github.com/MaibornWolff/codecharta/pull/3841)

## [1.129.0] - 2024-11-29

### Added 🚀

- Add a new `--mimo` flag to the MergeFilter that merges multiple project files into multiple output files depending on the input file's dot-prefix name [#3800](https://github.com/MaibornWolff/codecharta/pull/3800)

### Changed

- Moved the structure print functionality to a new tool called 'inspection' [#3826](https://github.com/MaibornWolff/codecharta/pull/3826)

## [1.128.0] - 2024-11-04

### Added 🚀

- Add the option to specify whole folders for the CSVExporter instead of only single files [#3411](https://github.com/MaibornWolff/codecharta/pull/3792)

## [1.127.0] - 2024-09-17

### Added 🚀

- Add a new `--rename-mcc` flag to the StructureModifier that can be used to change the name of the mcc metric to complexity or sonar_complexity [#3728](https://github.com/MaibornWolff/codecharta/pull/3728)
- Add a pre-check function before merging non-overlapping modules [#3745](https://github.com/MaibornWolff/codecharta/pull/3745)

### Changed

- Re-activate metric-gardener on-the-fly execution [#3691](https://github.com/MaibornWolff/codecharta/pull/3691)

### Chore 👨‍💻 👩‍💻

- Bump node version from 18 to 20 [#3690](https://github.com/MaibornWolff/codecharta/pull/3690)

## [1.126.0] - 2024-08-12

### Changed

- IMPORTANT: The sonar complexity will no longer be renamed to MCC! [#3456](https://github.com/MaibornWolff/codecharta/pull/3606)

## [1.125.0] - 2024-05-16

### Changed

- Update GH-Pages and dev guide on how to use our docker images [#3621](https://github.com/MaibornWolff/codecharta/pull/3621/files)

### Fixed 🐞

- Add default Docker user to mitigate `GitLogParser` issues during repo-scan [#3571](https://github.com/MaibornWolff/codecharta/pull/3571)
- Escaping and un-escaping windows paths, auto-detecting path separator for Unix and Windows
  paths [#3569](https://github.com/MaibornWolff/codecharta/pull/3569)

Chore 👨‍💻 👩‍💻

- Upgrade Gradle to version 8.7, now with support for Java version 21. [#3570](https://github.com/MaibornWolff/codecharta/pull/3570)
- Update docs to include that the `timeout` command is necessary on macOS to run integration tests [#3322](https://github.com/MaibornWolff/codecharta/pull/3615)

## [1.123.0] - 2024-04-10

### Added 🚀

- Auto detect direction of metrics - introduces `direction` as a new field in the JSON
  schema [#3518](https://github.com/MaibornWolff/codecharta/pull/3518)

### Chore 👨‍💻 👩‍💻

- Bump node version from 16 to 18 [#3452](https://github.com/MaibornWolff/codecharta/pull/3452)

### Changed

- Temporarily disabled metric-gardener on-the-fly
  execution [#3542](https://github.com/MaibornWolff/codecharta/pull/3542)

## [1.122.1] - 2024-02-26

### Changed

- CodeCharta Analysis and Visualization now have separate changelogs and
  releases [#3499](https://github.com/MaibornWolff/codecharta/pull/3499)

### Fixed 🐞

- Fix metric-gardener-importer crashing on new
  metric-gardener-json-format [#3496](https://github.com/MaibornWolff/codecharta/pull/3496)

## [1.122.0] - 2024-01-16

### Added 🚀

- File explorer can be pinned while analyzing the code-map [#3459](https://github.com/MaibornWolff/codecharta/pull/3459)
- Validate input file during interactive parser
  configuration [#3460](https://github.com/MaibornWolff/codecharta/pull/3460)
- Add functionality to screenshot legend [#3471](https://github.com/MaibornWolff/codecharta/pull/3471)

### Changed

- Multiple values for options need to be separated by
  comma [#3434](https://github.com/MaibornWolff/codecharta/pull/3434)
- Changed the short-form of the `--no-issues` flag in the SourceCodeParser from `-i`
  to `-ni` [#3434](https://github.com/MaibornWolff/codecharta/pull/3434)
- Clarify sonar user token question [#3445](https://github.com/MaibornWolff/codecharta/pull/3445)
- Changed the `--user` flag to `--user-token` in
  SonarImporter [#3445](https://github.com/MaibornWolff/codecharta/pull/3445)
- Changed the interactive dialog of `modify` to prompt user for single action to
  perform [#3448](https://github.com/MaibornWolff/codecharta/pull/3448)
- Selected buildings now keep their label until they are
  unselected [#3465](https://github.com/MaibornWolff/codecharta/pull/3465)

### Fixed 🐞

- Fix saving the number of top-labels in custom configs [#3461](https://github.com/MaibornWolff/codecharta/pull/3461)
- Fix parsers crashing after printing output to stdout [#3442](https://github.com/MaibornWolff/codecharta/pull/3442)
- Fix removal of nodes with identical names in `modify` [#3446](https://github.com/MaibornWolff/codecharta/pull/3446)
- Fix the highlighting of very high risk metrics to highlight only matching
  files [#3454](https://github.com/MaibornWolff/codecharta/pull/3454)

## [1.121.1] - 2023-12-08

### Fixed 🐞

- Fix github-pages not showing documentation [#3436](https://github.com/MaibornWolff/codecharta/pull/3436)

## [1.121.0] - 2023-12-07

### Added 🚀

- Add logging of absolute file paths of output files [#3414](https://github.com/MaibornWolff/codecharta/pull/3414)

### Changed

- Changed short form of parameter `--file-extensions` of RawTextParser from `-f`
  to `-fe` [#3405](https://github.com/MaibornWolff/codecharta/pull/3405)
- Update readme and gh-pages for RawTextParser [#3405](https://github.com/MaibornWolff/codecharta/pull/3405)
- Changed the `--format` flag for csv-output in SourceCodeParser from `table`
  to `csv` [#3414](https://github.com/MaibornWolff/codecharta/pull/3414)

### Fixed 🐞

- Fix RawTextParser producing incorrect output when no (or multiple) file extensions were specified in interactive
  mode [#3405](https://github.com/MaibornWolff/codecharta/pull/3405)
- Fix handling of empty inputs for the `--metrics`, `--exclude`, `--file-extensions` flags in the
  RawTextParser [#3415](https://github.com/MaibornWolff/codecharta/pull/3415)
- Fix RawTextParser incorrectly setting max indentation level to a predefined
  value [#3419](https://github.com/MaibornWolff/codecharta/pull/3419)
- Fix the csv-exporter so that it exports multiple projects instead of just one when multiple projects are
  specified [#3414](https://github.com/MaibornWolff/codecharta/pull/3414)
- Fix file extensions of output files for merged projects [#3421](https://github.com/MaibornWolff/codecharta/pull/3421)
- Fix the ability for users to accidentally pass invalid metrics to the RawTextParser without it
  crashing [#3424](https://github.com/MaibornWolff/codecharta/pull/3424)
- Fix deselected buildings with green/red roof in delta mode do not reset their color
  roof [#3426](https://github.com/MaibornWolff/codecharta/pull/3426)
- Fix parser hang issue in interactive mode caused by unintentional "enter" input after the last
  question [#3422](https://github.com/MaibornWolff/codecharta/pull/3422)

### Chore ‍👨‍💻 👩‍💻

- Upgraded to angular 16 [#3408](https://github.com/MaibornWolff/codecharta/pull/3408)

## [1.120.1] - 2023-11-17

### Removed 🗑

- Deprecated download button removed (functionality has been replaced by custom
  views) [#3398](https://github.com/MaibornWolff/codecharta/pull/3398)
- Remove the 'new' badges from the 'Custom Views' and 'Suspicious Metrics' features as these features are no longer
  new [#3393](https://github.com/MaibornWolff/codecharta/pull/3399)

### Fixed 🐞

- Fix an issue with web demo on Safari showing a white screen and not
  loading [#3396](https://github.com/MaibornWolff/codecharta/pull/3396)
- Fix the ability for users to skip the value for tab-width when configuring the rawtextparser and estimate its
  value [#3404](https://github.com/MaibornWolff/codecharta/pull/3404)

### Chore 👨‍💻 👩‍💻

- Add documentation for the installation requirements for
  metric-gardener [#3395](https://github.com/MaibornWolff/codecharta/pull/3395)
- Add hints to README (visualization and package) about MacOS arm64 standalone
  execution [#3395](https://github.com/MaibornWolff/codecharta/pull/3395)

## [1.120.0] - 2023-11-02

### Added 🚀

- Only ask to merge results after parser suggestion execution when more than one parser was
  executed [#3384](https://github.com/MaibornWolff/codecharta/pull/3384)
- Add the description of each parser to the list of suggested
  parsers [#3387](https://github.com/MaibornWolff/codecharta/pull/3387)

### Changed

- Adjust console output of metric gardener importer to no longer include one line for each processed
  node [#3386](https://github.com/MaibornWolff/codecharta/pull/3390)

### Fixed 🐞

- Fix command not found issue for --version and --help in the
  analysis [#3377](https://github.com/MaibornWolff/codecharta/pull/3377)
- Fix metric gardener importer getting stuck for large
  inputs [#3382](https://github.com/MaibornWolff/codecharta/pull/3382)
- Update docs for ccsh to remove outdated parameters and unify the pages
  structure [#3333](https://github.com/MaibornWolff/codecharta/pull/3388)

### Chore 👨‍💻 👩‍💻

- Raise minimum required Java Version from 8 to 11 [#3359](https://github.com/MaibornWolff/codecharta/pull/3359)
- Swap nw.js to electron for standalone execution [#3373](https://github.com/MaibornWolff/codecharta/pull/3373)

## [1.119.1] - 2023-08-03

### Fixed 🐞

- Fix ccsh execution under windows via cmd-terminal [#3354](https://github.com/MaibornWolff/codecharta/pull/3354)

## [1.119.0] - 2023-07-13

### Added 🚀

- Add message outputting which parser is being configured during parser
  suggestions [#3335](https://github.com/MaibornWolff/codecharta/pull/3335)
- Add basic validity checking for all input resources (files/folders, url for
  SonarImporter) [#3325](https://github.com/MaibornWolff/codecharta/pull/3325)
- Automatically start specific interactive parser when calling parser without
  args [#3332](https://github.com/MaibornWolff/codecharta/pull/3332)

## [1.118.0] - 2023-06-15

### Added 🚀

- Add metric tooltips that display attribute descriptors and provide hyperlinks in the sidebar to the metric's
  documentation [#3273](https://github.com/MaibornWolff/codecharta/pull/3273) </br>
  <img src="https://user-images.githubusercontent.com/65733509/241383211-d9e8e54b-6b06-45bb-8b99-81cc8e0a4596.png" width="450px"/> <img src="https://github.com/MaibornWolff/codecharta/assets/65733509/0ade9ad4-e60b-4911-aadc-d8142167b21a" width="300px"/>
- Expand and restructure documentation regarding Docker
  usage [#3312](https://github.com/MaibornWolff/codecharta/pull/3312)
- Add current working directories as hint or default value to interactive parser and parser suggestions when asking for
  input [#3319](https://github.com/MaibornWolff/codecharta/pull/3319)
- Add helpful status messages when calculating parser
  suggestions [#3329](https://github.com/MaibornWolff/codecharta/pull/3329)

### Fixed 🐞

- Speed up parser suggestions significantly [#3329](https://github.com/MaibornWolff/codecharta/pull/3329)
- Fix color range reset not triggering on color metric
  change [#3311](https://github.com/MaibornWolff/codecharta/pull/3311)

## [1.117.0] - 2023-05-19

### Added 🚀

- Add support for parser suggestions to SVN-, MetricGardener-, RawText- and
  SourceCodeParser [#3287](https://github.com/MaibornWolff/codecharta/pull/3287)
- Add semi automatic merging feature after executing multiple
  parsers [#3287](https://github.com/MaibornWolff/codecharta/pull/3287)
- Expand developer documentation to include common problems and solutions for
  them [#3289](https://github.com/MaibornWolff/codecharta/pull/3289)

### Fixed 🐞

- Fix entrypoint for analysis docker image [#3259](https://github.com/MaibornWolff/codecharta/pull/3259)
- Show again delta of a building which have nothing in common in red or
  green [#3271](https://github.com/MaibornWolff/codecharta/pull/3271)
- Always show description of suspicious metrics [#3285](https://github.com/MaibornWolff/codecharta/pull/3285)
- Show suspicious metrics and risk profile documentation pages in navigation
  bar [#3290](https://github.com/MaibornWolff/codecharta/pull/3290)
- Merge filter will now abort execution when an invalid file is specified as
  input [#3305](https://github.com/MaibornWolff/codecharta/pull/3305)
- Fix formatting issues in docs turning `--` to `–` [#3301](https://github.com/MaibornWolff/codecharta/pull/3301)

### Changed

- Adjusted documentation for parser suggestions [#3287](https://github.com/MaibornWolff/codecharta/pull/3287)
- Make the size of the CodeCharta logo more suitable for any screen size and remove MaibornWolff
  logo [#3302](https://github.com/MaibornWolff/codecharta/pull/3302)

### Chore 👨‍💻 👩‍💻

- Replace custom Redux adapter through real NgRx [#3271](https://github.com/MaibornWolff/codecharta/pull/3271)

## [1.116.0] - 2023-04-28

### Added 🚀

- Add automatic parser suggestions to recommend usable parsers for a codebase (supports GitLogParser and SonarImporter)
  when running `ccsh` command [#3275](https://github.com/MaibornWolff/codecharta/pull/3275) </br>
  ![image](https://user-images.githubusercontent.com/129938897/234309117-c9edd4e7-7c53-4ba7-b849-ec9c3f8f3215.png)
- Add documentation subsections for interactive shell and parser suggestions

### Changed

- Changed default behavior when launching ccsh without arguments to parser
  suggestions [#3275](https://github.com/MaibornWolff/codecharta/pull/3275)
- Old interactive parser selection now reachable by passing `-i` or `--interactive` as
  arguments [#3275](https://github.com/MaibornWolff/codecharta/pull/3275)

### Fixed 🐞

- Fix suspicious metrics and risk profile docs not loading [#3272](https://github.com/MaibornWolff/codecharta/pull/3272)

## [1.115.1] - 2023-04-06

### Removed 🗑

- Support for Custom Views created before CodeCharta version 1.110.0 or older is no longer be
  maintained [#3265](https://github.com/MaibornWolff/codecharta/pull/3265)

### Fixed 🐞

- Fix the disappearance of the suspicious metrics labels [#3263](https://github.com/MaibornWolff/codecharta/pull/3263)
- Fix UI components that look different since version
  1.115.0 [#3260](https://github.com/MaibornWolff/codecharta/pull/3260)
- Show latest release notes in changelog dialog [#3264](https://github.com/MaibornWolff/codecharta/pull/3264)

## [1.115.0] - 2023-03-30

### Added 🚀

- Display the CodeCharta logo next to the MaibornWolff
  logo [#3226](https://github.com/MaibornWolff/codecharta/pull/3226)
- Tooltip for primary and secondary metrics that displays AttributeDescriptor information in the
  sidebar [#3239](https://github.com/MaibornWolff/codecharta/pull/3239) </br>
  ![image](https://user-images.githubusercontent.com/65733509/227218468-b7d1e1ae-b847-40ab-8513-f3762b8787bb.png)
- Supports adding note to a custom view, provides a preview and an edit option for notes from the selection
  menu [#3234](https://github.com/MaibornWolff/codecharta/pull/3234) </br>
  ![image](https://user-images.githubusercontent.com/72517530/226942610-9e08d39c-324d-4de3-81d0-4e5da4e589aa.png)
  ![image](https://user-images.githubusercontent.com/72517530/226943152-1bb339bb-c39f-4bf6-a32d-ee8476249f98.png)

### Changed

- The Suspicious metrics and Risk profile Feature is now also available outside the Experimental Feature
  Mode [#2963](https://github.com/MaibornWolff/codecharta/pull/2963) </br>
  ![image](https://user-images.githubusercontent.com/47224279/222686442-05d4b83c-04d7-4275-b1eb-4339e8906130.jpg)
- Made the background color a bit lighter [#3226](https://github.com/MaibornWolff/codecharta/pull/3226)
- Saturate the distribution bar colors [#3226](https://github.com/MaibornWolff/codecharta/pull/3226)
- Improve the layout of all metric menus [#3226](https://github.com/MaibornWolff/codecharta/pull/3226)
- Improve the layout of the global configuration dialog [#3226](https://github.com/MaibornWolff/codecharta/pull/3226)
- Improve the layout of the metric chooser panel [#3226](https://github.com/MaibornWolff/codecharta/pull/3226)
- Change the primary color to match the color of the CodeCharta
  logo [#3226](https://github.com/MaibornWolff/codecharta/pull/3226)
- Improve the docs for suspicious metrics and risk profile
  feature [#3238](https://github.com/MaibornWolff/codecharta/pull/3238)
- Improve Custom Views Dialog [#3238](https://github.com/MaibornWolff/codecharta/pull/3248)

### Fixed 🐞

- Unselecting a folder in Presentation Mode leads to console
  error [#3215](https://github.com/MaibornWolff/codecharta/pull/3215)
- Fix Shrunken FileExplorer's file list on small displays [#3235](https://github.com/MaibornWolff/codecharta/pull/3235)
- Fix various margin problems in the UI [#3226](https://github.com/MaibornWolff/codecharta/pull/3226)
- Fix bumpy animations when moving/turning the map, hover buildings (showing labels and
  edges) [#3244](https://github.com/MaibornWolff/codecharta/pull/3244)

### Chore 👨‍💻 👩‍💻

- Upgrade all material UI components to MDC (not using the UI legacy components any
  more) [#3226](https://github.com/MaibornWolff/codecharta/pull/3226)

## [1.114.0] - 2023-01-13

### Added 🚀

- Add an option to hide floor labels under the Area Metric Options. This recalculates the
  map. [#3175](https://github.com/MaibornWolff/codecharta/pull/3175)

### Removed 🗑

- Camera settings for custom views generated with version 1.101.1 and earlier are now
  ignored. [#3196](https://github.com/MaibornWolff/codecharta/pull/3196)

### Fixed 🐞

- Reposition legend panel button again, when attribute sidebar is
  open [#3183](https://github.com/MaibornWolff/codecharta/pull/3183)

### Chore 👨‍💻 👩‍💻

- Add attribute descriptors (metric descriptions) to TokeiImporter and
  SVNlogParser [#3176](https://github.com/MaibornWolff/codecharta/pull/3176)

## [1.113.0] - 2022-12-15

### Changed

- The Custom Views Feature is now also available outside the Experimental Feature
  Mode [#3079](https://github.com/MaibornWolff/codecharta/pull/3076) </br>
  ![image](https://user-images.githubusercontent.com/72517530/204557970-0ba31f3b-5209-4707-a2d0-55cc45509f8a.png)
- Please note that the functionality of downloading cc.json maps will no longer be supported from April 2023. Instead,
  use the Custom View feature to create and share configurations for different views of your
  map. [#3079](https://github.com/MaibornWolff/codecharta/pull/3076)
- Change tooltips in the legend to show the metric
  description [#3162](https://github.com/MaibornWolff/codecharta/pull/3162) <br/>
  ![image](https://user-images.githubusercontent.com/27358421/205251507-100b1e1a-d86e-44f3-89cf-f32bf295aabd.png)

### Chore 👨‍💻 👩‍💻

- Improve metric titles by loading them from cc.json [#3162](https://github.com/MaibornWolff/codecharta/pull/3162)
- Add attribute descriptors to SoureCodeParser [#3166](https://github.com/MaibornWolff/codecharta/pull/3166)

## [1.112.1] - 2022-12-01

### Fixed 🐞

- Reverted PR [#3077](https://github.com/MaibornWolff/codecharta/pull/3077) that introduced a rendering bug, where
  buildings sizes were not proportional to their area
  value [#3159](https://github.com/MaibornWolff/codecharta/pull/3159)

### Chore 👨‍💻 👩‍💻

- Add attribute descriptors to SonarImporter [#3149](https://github.com/MaibornWolff/codecharta/pull/3149)
- Add title field to attribute descriptors [#3158](https://github.com/MaibornWolff/codecharta/pull/3158)

## [1.112.0] - 2022-11-25

### Added 🚀

- New calculation algorithm for treeMap that accounts for paddings and floor
  labels [#3077](https://github.com/MaibornWolff/codecharta/pull/3077)

### Fixed 🐞

- Fix ribbon-bar shadow moving down when search is
  expanded [#3138](https://github.com/MaibornWolff/codecharta/pull/3138)
- Fix loading errors of maps containing no
  programming-language-info [#3144](https://github.com/MaibornWolff/codecharta/pull/3144)

### Chore 👨‍💻 👩‍💻

- Documentation for new treeMap calculation algorithm [#3077](https://github.com/MaibornWolff/codecharta/pull/3077)
- Add attribute descriptors (metric descriptions) to some filters and
  importers [#3091](https://github.com/MaibornWolff/codecharta/pull/3091)

## [1.111.0] - 2022-11-17

### Added 🚀

- Add description to every Custom View [#3119](https://github.com/MaibornWolff/codecharta/pull/3119) </br>
  ![image](https://user-images.githubusercontent.com/72517530/201381274-a9a913d5-8f9d-4da6-9f26-6476e194ce3b.png)
- Highlight files and folders with no area metric or an area metric value of zero in the search
  panel [#3126](https://github.com/MaibornWolff/codecharta/pull/3126)

### Changed

- Be aware, that all Custom Views generated with version 1.110.0 or older will be unusable by April
  2023 [#3119](https://github.com/MaibornWolff/codecharta/pull/3119)

### Fixed 🐞

- Fix Node Context-Menu in Map Tree View opening multiple
  times [#3135](https://github.com/MaibornWolff/codecharta/pull/3135)
- Fix crashing on focusing or hovering un-rendered
  buildings [#3123](https://github.com/MaibornWolff/codecharta/pull/3123)
- Fix showing changelog entries in the dialog when a new version is
  available [#3123](https://github.com/MaibornWolff/codecharta/pull/3129)

### Chore 👨‍💻 👩‍💻

- Update supported latest browsers [#3125](https://github.com/MaibornWolff/codecharta/pull/3125)
- Split e2e and unit test configs [#3128](https://github.com/MaibornWolff/codecharta/pull/3128)

## [1.110.0] - 2022-11-04

### Changed

- Custom Views are now applicable even if maps or mode are different. Missing maps or map selection mode is displayed in
  the tooltip [#3090](https://github.com/MaibornWolff/codecharta/pull/3090)
- Be aware, that all Custom Views generated with version 1.109.1 or older will be unusable by April
  2023 [#3105](https://github.com/MaibornWolff/codecharta/pull/3105)

### Fixed 🐞

- Fix broken link to Custom View documentation [#3101](https://github.com/MaibornWolff/codecharta/pull/3101)
- Don't re-center map after every state change like changing area
  metric [#3109](https://github.com/MaibornWolff/codecharta/pull/3109)

### Chore 👨‍💻 👩‍💻

- Adjust Custom View API and maintain old Custom Views until April
  2023 [#3105](https://github.com/MaibornWolff/codecharta/pull/3105)
- Migrate codeMap.render.service, codeMap.label.service, codeMap.mouseEvent.service, codeMap.arrow.service,
  codeCharta.service, sharpnessMode.service, isLoadingFile.service, scaling.service and
  experimentalFeaturesEnabled.service to Angular [#3094](https://github.com/MaibornWolff/codecharta/pull/3094)
- Extract tree map size into a const as this is never
  changed [3098](https://github.com/MaibornWolff/codecharta/pull/3098)
- Migrate markedPackages.service, edges.service, blacklist.service, files.service and
  injector.service [3106](https://github.com/MaibornWolff/codecharta/pull/3106)
- Refactor out `LoadInitialFileService` and fix with it loose Promise in
  tests [#3110](https://github.com/MaibornWolff/codecharta/pull/3110)
- Migrate codeCharta.component, storeService.service and remove AngularJS dual boot from
  bootstrapping [#3114](https://github.com/MaibornWolff/codecharta/pull/3114)
- Remove obsolete AngularJS dependencies [#3115](https://github.com/MaibornWolff/codecharta/pull/3115)

## [1.109.1] - 2022-10-12

### Fixed 🐞

- Fix broken links on new GitHub Page 'Docker Containers' [#3089](https://github.com/MaibornWolff/codecharta/pull/3089)

## [1.109.0] - 2022-10-12

### Added 🚀

- Add description and documentation to Custom View modal [#3085](https://github.com/MaibornWolff/codecharta/pull/3085)
- Add a new button that links the height metric to the color metric so that the colour metric is automatically set to
  the selected height metric [#3058](https://github.com/MaibornWolff/codecharta/pull/3058) <br/>
  ![image](https://user-images.githubusercontent.com/72517530/193291144-fdc73a15-2087-47e2-845b-05c666aec71d.png) <br/>
  ![image](https://user-images.githubusercontent.com/72517530/194300920-60ce9fcd-0dd5-46ef-a90b-01d9a29205e6.png)

### Fixed 🐞

- Fix interactive GitLogParser using wrong dialogue with repo-scan
  subcommand [#3073](https://github.com/MaibornWolff/codecharta/pull/3073)
- Fix CodeCharta Analysis container exiting when detached [#3062](https://github.com/MaibornWolff/codecharta/pull/3062)
- Fix CodeCharta Analysis container not coming with the sonar-scanner
  pre-installed [#3062](https://github.com/MaibornWolff/codecharta/pull/3062)
- Rerender immediately after marking a folder with a color [#3067](https://github.com/MaibornWolff/codecharta/pull/3067)
- Clicking the 'reset height metric settings' button resets the number of top labels to the dynamic default
  value [#3066](https://github.com/MaibornWolff/codecharta/pull/3066)
- Unfocus nodes when changing selected files, which prevents the app from
  crashing [#3072](https://github.com/MaibornWolff/codecharta/pull/3072)

### Chore 👨‍💻 👩‍💻

- Update Docker Publish Action in Release Pipeline [#3060](https://github.com/MaibornWolff/codecharta/pull/3060)
- Write documentation for docker containers [#3063](https://github.com/MaibornWolff/codecharta/pull/3063)
- Migrate isAttributeSideBarVisible.service, threeScene.service, threeCamera.service and threeStats.service to
  Angular [#3068](https://github.com/MaibornWolff/codecharta/pull/3068)
- Migrate dialog.service to Angular [#3072](https://github.com/MaibornWolff/codecharta/pull/3072)
- Add documentation for new treeMap algorithm [#3077](https://github.com/MaibornWolff/codecharta/pull/3077)
- Migrate dialog.service to Angular [#3070](https://github.com/MaibornWolff/codecharta/pull/3070)
- Migrate FocusedNodePathService, LayoutAlgorithmService, ThreeOrbitControlsService and ThreeViewerService to
  Angular [#3072](https://github.com/MaibornWolff/codecharta/pull/3072)
- Migrate updateAttributeTypes.service to Angular [#3082](https://github.com/MaibornWolff/codecharta/pull/3082)

## [1.108.1] - 2022-09-29

## Chore 👨‍💻 👩‍💻

- Update formatting in Docker Release Pipeline [#3059](https://github.com/MaibornWolff/codecharta/pull/3059)

## [1.108.0] - 2022-09-28

### Added 🚀

- Add new Analysis docker container, together with a docker-compose file that contains analysis, visualization and a
  SonarQube instance [#3057](https://github.com/MaibornWolff/codecharta/pull/3057)

### Removed 🗑

- remove outdated Crococosmo, Understand and Jasome Importer from Analysis including its
  documentation [#3053](https://github.com/MaibornWolff/codecharta/pull/3053)

## [1.107.0] - 2022-09-27

### Added 🚀

- Add subcommand to GitLogParser to run necessary git commands
  automatically [#3041](https://github.com/MaibornWolff/codecharta/pull/3041)

### Changed

- Change default behaviour of GitLogParser to use new
  subcommands [#3041](https://github.com/MaibornWolff/codecharta/pull/3041)
- Set default value for displaying labels 1 per 100 buildings with a maximum of 10
  labels [#3046](https://github.com/MaibornWolff/codecharta/pull/3046)

### Fixed 🐞

- Uncheck the box when 'reset invert height' icon is
  clicked [#3048](https://github.com/MaibornWolff/codecharta/pull/3048)
- Update ReadMe and GitHub pages for MetricGardener [#3045](https://github.com/MaibornWolff/codecharta/pull/3045)

### Chore 👨‍💻 👩‍💻

- Migrate codeMap.component to Angular with minor internal
  improvements [#3049](https://github.com/MaibornWolff/codecharta/pull/3049)
- Remove threeUpdateCycle.service [#3050](https://github.com/MaibornWolff/codecharta/pull/3050)
- Migrate metricData.service, edgeMetric.service, nodeMetricData.service and edgeMetricData.service to
  Angular [#3051](https://github.com/MaibornWolff/codecharta/pull/3051)
- Migrate threeRenderer.service to Angular [#3052](https://github.com/MaibornWolff/codecharta/pull/3052)

## [1.106.1] - 2022-09-20

### Fixed 🐞

- CC-JSON Files not loaded on Safari browser [#3042](https://github.com/MaibornWolff/codecharta/pull/3042)
- Show loading spinners while loading a file [#2980](https://github.com/MaibornWolff/codecharta/pull/2980)
- Prevent clicking on not opened metric options in ribbon
  bar [#3029](https://github.com/MaibornWolff/codecharta/pull/3029)
- Set cursor to pointer on color settings panel of delta
  mode [#3029](https://github.com/MaibornWolff/codecharta/pull/3029)

### Chore 👨‍💻 👩‍💻

- Throttle rendering and migrate codeMap.preRender.service to
  Angular [#2980](https://github.com/MaibornWolff/codecharta/pull/2980)

## [1.106.0] - 2022-09-13

### Added 🚀

- Add option to CSVImporter to specify the path column
  name [#3026](https://github.com/MaibornWolff/codecharta/pull/3026)

### Changed

- Stop asking the user to compress a file when printing to
  stdOut [#3024](https://github.com/MaibornWolff/codecharta/pull/3024)

### Fixed 🐞

- Fix anongit script using the wrong whitespace, causing gitlogparser to
  fail [#3030](https://github.com/MaibornWolff/codecharta/pull/3030)
- Reshow suspicious metrics badge when calculated data has
  changed [#2997](https://github.com/MaibornWolff/codecharta/pull/2997)

## [1.105.0] - 2022-09-06

### Added 🚀

- Add an option to run MetricGardener before its parser if
  requested [#3015](https://github.com/MaibornWolff/codecharta/pull/3015)
- Add missing documentation for MetricGardener importer [#3016](https://github.com/MaibornWolff/codecharta/pull/3016)

### Changed

- Increase the size of the close button to simplify closing the attribute
  sidebar [#3014](https://github.com/MaibornWolff/codecharta/pull/3014)

### Fixed 🐞

- Fix console error when clicking switch button in delta
  mode [#3023](https://github.com/MaibornWolff/codecharta/pull/3023)
- Fix broken images to new document pages about how using
  SonarQube [#3012](https://github.com/MaibornWolff/codecharta/pull/3012)

### Chore 👨‍💻 👩‍💻

- Migrate tool bar component to Angular [#3020](https://github.com/MaibornWolff/codecharta/pull/3020)
- Remove obsolete AngularJS IsPresentationModeService and
  ShowOnlyBuildingsWithEdgesService [#3005](https://github.com/MaibornWolff/codecharta/pull/3005)

## [1.104.1] - 2022-08-31

### Fixed 🐞

- Fix broken links to new document pages about how using
  SonarQube [#3009](https://github.com/MaibornWolff/codecharta/pull/3009)

## [1.104.0] - 2022-08-31

### Added 🚀

- Copy-to-Clipboard-Button to paste the top 10 files with highest metric
  values [#2942](https://github.com/MaibornWolff/codecharta/pull/2942), [#2996](https://github.com/MaibornWolff/codecharta/pull/2995) <br/>
  ![image](https://user-images.githubusercontent.com/46388280/184089603-ecfa8e31-8241-42a2-9954-2de554347381.png) </br>
  ![image](https://user-images.githubusercontent.com/46388280/184089577-5cd2eec0-5293-4083-b629-0e3c5621047c.png)

### Fixed 🐞

- Correct file types now get appended to the name of the output file when using the interactive
  ccsh [#2914](https://github.com/MaibornWolff/codecharta/pull/2914)
- Fix exit code handling and update integrationTest's golden_test.sh to cover all
  modules [#2988](https://github.com/MaibornWolff/codecharta/pull/2988)
- Fix missing color pickers within edge metric options [#2993](https://github.com/MaibornWolff/codecharta/pull/2993)
- Fix labels being displayed at an incorrect height and lines being disconnected from
  labels [#2991](https://github.com/MaibornWolff/codecharta/pull/2991)
- Provides a list of metrics where no calculation could be performed in relation to a
  suspicion [#2996](https://github.com/MaibornWolff/codecharta/pull/2996) </br>
  ![missing_values_suspicious_metrics](https://user-images.githubusercontent.com/31436472/187439165-77eda080-ceba-4bab-b077-4f6a2d6162b5.png)

### Chore 👨‍💻 👩‍💻

- Migrate view cube component and its service to Angular [#2998](https://github.com/MaibornWolff/codecharta/pull/2998)

## [1.104.0] - 2022-08-29

### Chore 👨‍💻 👩‍💻

- Migrate presentation mode button to Angular [#2938](https://github.com/MaibornWolff/codecharta/pull/2938)

## [1.103.6] - 2022-08-17

### Fixed 🐞

- Fix bug in CompressionStreamHandler's input stream validation, that caused endless blocking reads from
  System.In [#2987](https://github.com/MaibornWolff/codecharta/pull/2987)

## [1.103.5] - 2022-08-12

### Changed

- Update visualization readme file [#2932](https://github.com/MaibornWolff/codecharta/pull/2932)
- Update the documentation for the usage of SonarQube [#2965](https://github.com/MaibornWolff/codecharta/pull/2965)

### Fixed 🐞

- Add permission to upload-assets
  action [#2979](https://github.com/MaibornWolff/codecharta/pull/2979), [#2982](https://github.com/MaibornWolff/codecharta/pull/2982)

### Chore 👨‍💻 👩‍💻

- Migrate download button to Angular [#2973](https://github.com/MaibornWolff/codecharta/pull/2973)

## [1.103.3] - 2022-08-10

### Fixed 🐞

- Update Ubuntu images package list as part of the wine
  action [#2976](https://github.com/MaibornWolff/codecharta/pull/2976)

## [1.103.2] - 2022-08-10

### Fixed 🐞

- Highlight buildings on hover of file extension bar [#2969](https://github.com/MaibornWolff/codecharta/pull/2969)
- Fix of the npm visualization installation under MacOS by version bumping
  nwjs [#2974](https://github.com/MaibornWolff/codecharta/pull/2974)

### Chore 👨‍💻 👩‍💻

- Migrate file extension bar to Angular [#2968](https://github.com/MaibornWolff/codecharta/pull/2968)

## [1.103.1] - 2022-08-09

### Fixed 🐞

- Change release action script in order to show changelog in release
  notes [#2970](https://github.com/MaibornWolff/codecharta/pull/2970)

## [1.103.0] - 2022-08-09

### Changed

- Update links to demo website [#2961](https://github.com/MaibornWolff/codecharta/pull/2961)

### Added 🚀

- Show tooltip with explanation for some metrics [#2957](https://github.com/MaibornWolff/codecharta/pull/2957)

### Fixed 🐞

- Fix installation instructions for Apple Silicon [#2956](https://github.com/MaibornWolff/codecharta/pull/2956)
- Fix release tag [#2954](https://github.com/MaibornWolff/codecharta/pull/2954)
- Prevent dark map on unhover [#2959](https://github.com/MaibornWolff/codecharta/pull/2959)
- Zoom in/out time [#2959](https://github.com/MaibornWolff/codecharta/pull/2959)
- Fix webpack build package being corrupt if zipped under linux by changing the compression
  path [#2934](https://github.com/MaibornWolff/codecharta/pull/2934)

### Chore 👨‍💻 👩‍💻

- Load metric templates lazily and migrate them to Angular [#2960](https://github.com/MaibornWolff/codecharta/pull/2960)

## [1.102] - 2022-08-04

### Changed

- Changed storing format for camera position within custom views and scenarios. Loading of created custom views or
  scenarios in old format will stop working in 2023 [2880](https://github.com/MaibornWolff/codecharta/pull/2880)
- Add error messages for the user to "Add Scenario Dialog" [#2928](https://github.com/MaibornWolff/codecharta/pull/2928)

### Added 🚀

- Switch reference and comparison file by button click in delta
  mode [#2933](https://github.com/MaibornWolff/codecharta/pull/2933)
  ![image](https://user-images.githubusercontent.com/72517530/182630368-2d2b177d-8b4b-4850-8486-8d9afc7153c5.png)
- Add display of changed files in delta mode (changed := metric values changed or list of applied metrics
  changed) [#2890](https://github.com/MaibornWolff/codecharta/pull/2890)
  ![image](https://user-images.githubusercontent.com/72517530/182631857-6192dea1-7a01-4684-90a6-d5da8615434a.png)
- Load compressed files (cc.json.gz) via URL parameter [#2917](https://github.com/MaibornWolff/codecharta/pull/2917)

### Fixed 🐞

- Fix SonarImporter requesting no metrics from SonarQube when the list of metrics was left
  empty [#2913](https://github.com/MaibornWolff/codecharta/pull/2913)
- Exclude edge metrics from custom scenarios, when there are no edge metrics available. Before it was impossible to
  apply those custom configs [#2928](https://github.com/MaibornWolff/codecharta/pull/2928)
- Fix of NoSuchMethodException due to a call of method `readNBytes()` that is not available in Java 9 with replacement
  call `read()` [#2930](https://github.com/MaibornWolff/codecharta/pull/2930)
- Keep selected metrics when excluding buildings [#2935](https://github.com/MaibornWolff/codecharta/pull/2935)
- Update UI correctly when toggling between standard and delta
  mode [#2937](https://github.com/MaibornWolff/codecharta/pull/2937)

## [1.101.1] - 2022-07-27

### Chore 👨‍💻 👩‍💻

- Modify build script for GitHub pages in order to provide zipped maps.

## [1.101.0] - 2022-07-26

### Added 🚀

- Transform a metric gardener json file into a code charta json file, that can be correctly
  visualized [#2675](https://github.com/MaibornWolff/codecharta/pull/2875)

### Changed

- Restore previous selected files when switching back from delta to standard
  mode [#2891](https://github.com/MaibornWolff/codecharta/pull/2891)
- Add more metrics that can be preselected when opening a cc.json
  file [#2907](https://github.com/MaibornWolff/codecharta/pull/2907) [#2908](https://github.com/MaibornWolff/codecharta/pull/2908)

### Fixed 🐞

- Let file selection always show what is actual rendered within the
  map [#2891](https://github.com/MaibornWolff/codecharta/pull/2891)

### Chore 👨‍💻 👩‍💻

- Improve performance by slightly delaying node-name popups and removing unused
  functionality [#2897](https://github.com/MaibornWolff/codecharta/pull/2897)

## [1.100.0] - 2022-07-12

### Added 🚀

- Add a description for the statements metric [#2883](https://github.com/MaibornWolff/codecharta/pull/2883)

### Changed

- Select matching metric combination based on available
  metrics [#2862](https://github.com/MaibornWolff/codecharta/pull/2862)
- Unify UI of buttons in toolbar [#2857](https://github.com/MaibornWolff/codecharta/pull/2857)

### Fixed 🐞

- Fix resetting of color range within color settings panel [#2877](https://github.com/MaibornWolff/codecharta/pull/2877)
- Fix resetting of colors in delta mode within color settings
  panel [#2873](https://github.com/MaibornWolff/codecharta/pull/2873)
- Restore global settings on page load again [#2878](https://github.com/MaibornWolff/codecharta/pull/2878)
- Fix 'undefinded' being displayed as a metric description when no description was
  available [#2883](https://github.com/MaibornWolff/codecharta/pull/2883)
- Fix windows standalone builds [#2881](https://github.com/MaibornWolff/codecharta/pull/2881)

### Chore 👨‍💻 👩‍💻

- Migrate color settings panel to Angular [#2873](https://github.com/MaibornWolff/codecharta/pull/2873)

## [1.99.1] - 2022-06-22

### Fixed 🐞

- Fix packaging of standalone app for macOS and Windows [#2847](https://github.com/MaibornWolff/codecharta/pull/2847)
- Fix dialogparser test of sourcecode parser[#2860](https://github.com/MaibornWolff/codecharta/pull/2860)

## [1.99.0] - 2022-06-21

### Added 🚀

- Add interactive dialog support for the remaining
  parsers [#2833](https://github.com/MaibornWolff/codecharta/pull/2833) [#2836](https://github.com/MaibornWolff/codecharta/pull/2836) [#2842](https://github.com/MaibornWolff/codecharta/pull/2842) [#2843](https://github.com/MaibornWolff/codecharta/pull/2843) [#2846](https://github.com/MaibornWolff/codecharta/pull/2846)

### Fixed 🐞

- Fix analysis bug where importers would get stuck before file
  output [#2854](https://github.com/MaibornWolff/codecharta/pull/2854)
- Use correct icon for height metric chooser again [#2851](https://github.com/MaibornWolff/codecharta/pull/2851)
- Close height metric option instead of making it only invisible on
  close [#2853](https://github.com/MaibornWolff/codecharta/pull/2853)

### Chore 👨‍💻 👩‍💻

- Migrate changelog dialog to Angular [#2849](https://github.com/MaibornWolff/codecharta/pull/2849)
- Migrate node path panel to Angular [#2855](https://github.com/MaibornWolff/codecharta/pull/2855)

## [1.98.0] - 2022-06-14

### Added 🚀

- Add missing documentation for ccsh filters and csv
  exporter [#2831](https://github.com/MaibornWolff/codecharta/pull/2831)
- Add support for compressed files to all analysis filters and to `check`
  validation [#2820](https://github.com/MaibornWolff/codecharta/pull/2820)

### Changed

- Update Readme file [#2837](https://github.com/MaibornWolff/codecharta/pull/2837)

### Fixed 🐞

- Default selected metrics on file changes when default scenario is not
  applicable [#2828](https://github.com/MaibornWolff/codecharta/pull/2828)

### Chore 👨‍💻 👩‍💻

- Remove old references to single mode states and actions [#2574](https://github.com/MaibornWolff/codecharta/pull/2841)
- Rename multiple mode references to standard [#2574](https://github.com/MaibornWolff/codecharta/pull/2848)

## [1.97.0] - 2022-05-31

### Added 🚀

- Add interactive dialog support for the
  parsers [#2737](https://github.com/MaibornWolff/codecharta/pull/2737) [#2822](https://github.com/MaibornWolff/codecharta/pull/2822) <br>
  ![m](https://user-images.githubusercontent.com/48621967/161549546-1463914e-c223-4912-acb1-db4e357e76c5.png)

### Changed

- Hide color metric range-slider in color metric options of ribbon bar in delta mode instead of disabling
  it [#2797](https://github.com/MaibornWolff/codecharta/pull/2797)
- Display max value of selected distribution metric in file extension
  bar [#2824](https://github.com/MaibornWolff/codecharta/pull/2824)
- Display max value of selected metric in all metric chooser of ribbon
  bar [#2825](https://github.com/MaibornWolff/codecharta/pull/2825)

### Fixed 🐞

- Handle invalid input of range-slider correctly [#2797](https://github.com/MaibornWolff/codecharta/pull/2797)
- Use real color range min value instead of 0 and take color range min value into account for calculating initial first
  third of positive color [#2797](https://github.com/MaibornWolff/codecharta/pull/2797)
- Fix range-slider in case of min value equal to max value [#2797](https://github.com/MaibornWolff/codecharta/pull/2797)

### Chore 👨‍💻 👩‍💻

- Track not only changes to color metric options by slider but also by related input
  field [#2797](https://github.com/MaibornWolff/codecharta/pull/2797)
- Migrate center-map-button-component to Angular [#2809](https://github.com/MaibornWolff/codecharta/pull/2809)
- Migrate the following components to Angular: globalSettingsButton.component, dialog.globalSettings.component,
  layoutSelection.component, sharpnessModeSelector.component, maxTreeMapFiles.component, maxTreeMapFiles.service,
  hideFlatBuildings.service,
  resetCameraIfNewFileIsLoaded.service [#2815](https://github.com/MaibornWolff/codecharta/pull/2815)
- Migrate area-settings-panel-component to Angular [#2821](https://github.com/MaibornWolff/codecharta/pull/2821)

## [1.96.0] - 2022-05-17

### Changed

- Remove all mentions of regular `.cc` `.json` `.gz` file extensions from file panel and
  sidebar [#2793](https://github.com/MaibornWolff/codecharta/pull/2793)

### Fixed 🐞

- Update slider of area metric options correctly on changes of related input
  field [#2787](https://github.com/MaibornWolff/codecharta/pull/2787)
- Limit length of labels in legend panel [#2804](https://github.com/MaibornWolff/codecharta/pull/2804)
- Prevent invalid input for margin in area metric options to be
  submitted [#2799](https://github.com/MaibornWolff/codecharta/pull/2799)

### Chore 👨‍💻 👩‍💻

- Introduce custom angular material theme [#2784](https://github.com/MaibornWolff/codecharta/pull/2784)
- Migrate height-settings-panel-component [#2790](https://github.com/MaibornWolff/codecharta/pull/2790)
- Fully migrate custom-config-component [#2760](https://github.com/MaibornWolff/codecharta/pull/2760)

## [1.95.2] - 2022-04-19

### Changed

- Restrict upload in custom views menu to custom views. Custom views uploaded in the custom views menu are now allowed
  to have an arbitrary file suffix [#2773](https://github.com/MaibornWolff/codecharta/pull/2773)

### Chore 👨‍💻 👩‍💻

- Migrate reset-settings-button-component to Angular [#2774](https://github.com/MaibornWolff/codecharta/pull/2774)

### Fixed 🐞

- Set files loaded via URL to multiple mode by default when delta mode is not
  selected [#2769](https://github.com/MaibornWolff/codecharta/pull/2769)

## [1.95.1] - 2022-04-01

### Changed

- Display project name as file name (if not empty or blank) for loaded files via
  URL [#2767](https://github.com/MaibornWolff/codecharta/pull/2767)

### Fixed 🐞

- Fixes floor labels being drawn next to the map if margin was changed after map height is unequal to
  1 [#2763](https://github.com/MaibornWolff/codecharta/pull/2763)
- Fixes floor labels being stuck inside folder geometry when
  scaling [#2766](https://github.com/MaibornWolff/codecharta/pull/2766)

### Chore 👨‍💻 👩‍💻

- Migrate metric-hovered-value-component to Angular [#2752](https://github.com/MaibornWolff/codecharta/pull/2752)

## [1.95.0] - 2022-03-28

### Added 🚀

- Focused gradient option for color metric. Only applies a gradient between the two set
  borders. [#2750](https://github.com/MaibornWolff/codecharta/pull/2750)

### Changed

- Mark SCMLogParserV2 as stable and deprecate SCMLogParser for
  Git [2725](https://github.com/MaibornWolff/codecharta/pull/2725)
  - Rename SCMLogParserV2 to GitLogParser
  - Rename SCMLogParser to SVNLogParser and remove git parsing

### Fixed 🐞

- Set initially correct attribute type of primary edge metric in attribute
  sidebar [#2731](https://github.com/MaibornWolff/codecharta/issues/2731)
- Fix switching secondary metrics to median aggregation in attribute
  sidebar [#2630](https://github.com/MaibornWolff/codecharta/issues/2630)

## [1.94.0] - 2022-03-21

### Changed

- Improve sonarimport help message [#2717](https://github.com/MaibornWolff/codecharta/pull/2717)
- Remove blacklist entry on click of name as well [#2712](https://github.com/MaibornWolff/codecharta/pull/2712)

### Chore 👨‍💻 👩‍💻

- Migrate add `custom config button` in ribbonbar to
  Angular [#2736](https://github.com/MaibornWolff/codecharta/pull/2736)

## [1.93.0] - 2022-03-14

### Added 🚀

- Show amount of added and removed files in attribute sidebar when delta mode is enabled and a folder is
  selected [#2701](https://github.com/MaibornWolff/codecharta/pull/2701/files) <br>
  ![xs](https://user-images.githubusercontent.com/72517530/157468180-4e2d052b-63b8-4040-bb22-b633a24d3b8a.png)

### Changed

- Suspicious metrics and risk profile are calculated for all selected
  maps [#2721](https://github.com/MaibornWolff/codecharta/pull/2721)
- Close search panel and ribbon bar dropdowns on every outside
  click [#2692](https://github.com/MaibornWolff/codecharta/issues/2692)

### Fixed 🐞

- Fix GameObjects importer edge cases [#2705](https://github.com/MaibornWolff/codecharta/pull/2705)

## [1.92.1] - 2022-03-07

### Fixed 🐞

- Fix removing maps with long file names [#2696](https://github.com/MaibornWolff/codecharta/pull/2697)

### Chore 👨‍💻 👩‍💻

- Migrate search-bar-component to Angular [#2686](https://github.com/MaibornWolff/codecharta/pull/2686)

## [1.92.0] - 2022-03-01

### Changed

- Design and add a new CodeChara Logo [#2682](https://github.com/MaibornWolff/codecharta/pull/2682) <br>
  ![xs](https://user-images.githubusercontent.com/48621967/155682925-ecc9fe5d-77de-4927-9c6a-b1059ae9eead.png)
- Risk profile is now calculated for every occurring programming languages in selected file(
  s)[#2679](https://github.com/MaibornWolff/codecharta/pull/2679)

## [1.91.1] - 2022-02-25

### Fixed 🐞

- Fix loading of files without edge metric never
  finished [#2680](https://github.com/MaibornWolff/codecharta/issues/2680)

## [1.91.0] - 2022-02-21

### Changed

- Refactor edge metric panel [#2670](https://github.com/MaibornWolff/codecharta/pull/2670)
  - Remove edge metric option 'none'
  - By default, the first edge metric is enabled when map has edge metrics
  - Disable edge metric panel when loaded map has no edge metrics

### Fixed 🐞

- Improve loading times by reducing the size of JavaScript
  files [#2667](https://github.com/MaibornWolff/codecharta/pull/2667)
- Fix loading of files without edge metric never
  finished [#2680](https://github.com/MaibornWolff/codecharta/issues/2680)

### Chore 👨‍💻 👩‍💻

- Migrate loading gifs to Angular and remove now
  unused `isLoadingMap.service` [#2668](https://github.com/MaibornWolff/codecharta/pull/2668)

## [1.90.0] - 2022-02-15

### Added 🚀

- Parse and import GameObjects file structure into cc.json on
  upload [#2646](https://github.com/MaibornWolff/codecharta/pull/2646)

### Fixed 🐞

- Fix flaky string comparison possibly due to puppeteer
  update [#2659](https://github.com/MaibornWolff/codecharta/pull/2659)
- Fix show garbage bin next to the loaded maps [#2647](https://github.com/MaibornWolff/codecharta/pull/2647)

### Chore 👨‍💻 👩‍💻

- Run standalone version of CodeCharta in Node.js web target (and
  disable [#1314](https://github.com/MaibornWolff/codecharta/issues/1314)), so that local storage is
  available [#2637](https://github.com/MaibornWolff/codecharta/pull/2637)

## [1.89.0] - 2022-02-07

### Added 🚀

- Add area metric option to invert the amount of area, which is used for the
  nodes [#2626](https://github.com/MaibornWolff/codecharta/pull/2626)
- Add button to clear search field [#2638](https://github.com/MaibornWolff/codecharta/pull/2638) <br>
  ![xs](https://user-images.githubusercontent.com/48218172/151999974-3b8a7cca-52b2-4757-b3c0-e3b2e36ad237.png)

### Changed

- New buttons for selecting attribute types [#2631](https://github.com/MaibornWolff/codecharta/pull/2631)
  ![xs](https://user-images.githubusercontent.com/72517530/151762455-07e47bf5-18aa-4721-a60a-6dfee057e1e5.png)
- Migrate context menu with slightly new layout touch to Angular. Migrated version prevents rendering outside of
  view [#1661](https://github.com/MaibornWolff/codecharta/issues/1661)

### Fixed 🐞

- Remove delay of keeping a building highlight
  permanently [#2641](https://github.com/MaibornWolff/codecharta/issues/2641)

## [1.88.0] - 2022-01-24

### Changed

- Rename custom configs to custom view [#2625](https://github.com/MaibornWolff/codecharta/pull/2625)
- Combine single and multiple mode into standard mode [#2578](https://github.com/MaibornWolff/codecharta/pull/2578)
  ![xs](https://user-images.githubusercontent.com/72517530/150765617-2d66eb78-2c26-45c5-b63b-f84994ed88ab.png)
- Improve file validation handling and provide more descriptive import
  messages [#2604](https://github.com/MaibornWolff/codecharta/pull/2604)
  ![xs](https://user-images.githubusercontent.com/48621967/150532207-f3b482ed-3a14-43c0-b1a3-80ac4c25d5e0.png)

### Fixed 🐞

- Fix Image not shown in what is new dialog [#2610](https://github.com/MaibornWolff/codecharta/pull/2610)

### Chore 👨‍💻 👩‍💻

    - Unfocus focused node only when map starts to load and not also when map has finished loading. This shouldn't change any behavior for the user [#2614](https://github.com/MaibornWolff/codecharta/pull/2614)

## [1.87.1] - 2022-01-17

### Changed

- User-friendly renaming for display quality options [#2601](https://github.com/MaibornWolff/codecharta/pull/2601)

### Fixed 🐞

- Fix color of selected building in delta mode [#2603](https://github.com/MaibornWolff/codecharta/pull/2603)
- Fix link to news page when clicking 'Know more' button changelog
  dialog [#2602](https://github.com/MaibornWolff/codecharta/pull/2602)
- Fix Image not shown in what is new dialog [#2610](https://github.com/MaibornWolff/codecharta/pull/2610)

## [1.87.0] - 2022-01-11

### Chore 👨‍💻 👩‍💻

- Migrate `unfocus-button-component` to Angular.

### Changed

- Remove suspicious metrics from custom map
  configurations [#2564](https://github.com/MaibornWolff/codecharta/pull/2564).
- Add 'show/hide non-applicable CustomConfigs' button to Custom Configs
  menu [#2591](https://github.com/MaibornWolff/codecharta/pull/2591).

## [1.86.0] - 2021-12-20

### Added 🚀

- Add 3D export feature for 3D printing [#2561](https://github.com/MaibornWolff/codecharta/pull/2561). <br>
  ![xs](https://user-images.githubusercontent.com/48621967/146173663-e0ea177e-6ed8-4ddb-bd11-410415541e9f.png)
  ![l](https://user-images.githubusercontent.com/48621967/146174397-42a6e475-ed2f-47c0-ba9c-4f8304d53399.png)

### Changed

- Replace all color pickers in the context of ongoing Angular
  migration [#2560](https://github.com/MaibornWolff/codecharta/pull/2560).

### Fixed 🐞

- Fix showing names of custom configs properly [#2557](https://github.com/MaibornWolff/codecharta/pull/2557).
- Fix minor memory leak in context menu for code map
  buildings [#2565](https://github.com/MaibornWolff/codecharta/issues/2565).

### Chore 👨‍💻 👩‍💻

- Migrate legend panel to Angular [#2560](https://github.com/MaibornWolff/codecharta/pull/2560).

## [1.85.0] - 2021-12-13

### Fixed 🐞

- Fix delta values of secondary metrics not shown in delta mode within attribute side
  bar [#2539](https://github.com/MaibornWolff/codecharta/issues/2539).
- Use icon tag instead of font awesome icon [#2537](https://github.com/MaibornWolff/codecharta/pull/2537).
- Rename text for placeholder of metric chooser [#2547](https://github.com/MaibornWolff/codecharta/pull/2547)
- Fix attribute type selector of primary edge metric not
  shown [#2528](https://github.com/MaibornWolff/codecharta/issues/2528).
- Identical files and files with identical file names but different hashes can be
  loaded [#2548](https://github.com/MaibornWolff/codecharta/pull/2548)

### Chore 👨‍💻 👩‍💻

- Remove `secondaryMetrics` from store and remove `secondaryMetrics.service` as the data can be derived from selected
  node [#2527](https://github.com/MaibornWolff/codecharta/pull/2527).
- Migrate `attribute-side-bar-component` to Angular [#2527](https://github.com/MaibornWolff/codecharta/pull/2527).
- Switch from Webpack 4 Loaders to Asset Module to load icons properly with css-loader
  6.x [#2542](https://github.com/MaibornWolff/codecharta/pull/2542).

### Removed 🗑

- Remove notification dialog when deleting a custom config [#2553](https://github.com/MaibornWolff/codecharta/pull/2553)

## [1.84.1] - 2021-11-29

### Fixed 🐞

- Fix compressed files not being loaded ([#2524](https://github.com/MaibornWolff/codecharta/pull/2525))

## [1.84.0] - 2021-11-22

### Changed

- Improved the UI and usability of the Suspicious Metrics
  Feature ([#2376](https://github.com/MaibornWolff/codecharta/pull/2494)) <br>
  - The Metrics and the Analysis are now split in two menus <br>
    ![xs](https://user-images.githubusercontent.com/48621967/141795078-bb856f53-1bc3-4c09-8be5-d031899835ae.png)
  - The Suspicious Metrics are now sorted with the Very High Risk on top <br>
    ![m](https://user-images.githubusercontent.com/48621967/141793011-1bfc0e19-bd3a-4bd2-af70-c3dd472821b6.png)
  - The bar in the analysis shows the percentages <br>
    ![m](https://user-images.githubusercontent.com/48621967/141791111-564778fa-b767-4ee4-b024-6856f1a79b4b.png)

### Fixed 🐞

- Fix showing labels when weighted gradient on yellow buildings in color metric options are
  enabled ([#2511](https://github.com/MaibornWolff/codecharta/pull/2511))
- Fix rounding of the sum of percentages in risk profile ([#2393](https://github.com/MaibornWolff/codecharta/pull/2516))
- Fix legend panel not having a background ([#2422](https://github.com/MaibornWolff/codecharta/pull/2510))

### Chore 👨‍💻 👩‍💻

- Remove `nodeSearch.service.ts` and `searchedNodePaths` from store as they can be derived
  from `searchPattern` ([#2495](https://github.com/MaibornWolff/codecharta/pull/2495)).
- Refactor where metric data are calculated ([#2514](https://github.com/MaibornWolff/codecharta/pull/2514)).
- Migrate `attribute-type-selector-component` to
  Angular ([#2519](https://github.com/MaibornWolff/codecharta/pull/2519)).

## [1.83.1] - 2021-11-10

### Fixed 🐞

- Fix loading files from URL in Web Demo ([#2494](https://github.com/MaibornWolff/codecharta/pull/2494))

## [1.83.0] - 2021-11-09

### Fixed 🐞

- Fix unwanted calculations of suspicious metrics when experimental features are
  disabled ([#2471](https://github.com/MaibornWolff/codecharta/pull/2471))
- Fix UI issues in the configuration panel ([#2322](https://github.com/maibornwolff/codecharta/issues/2322))
- Fix tooltip of sorting order button in map tree view showing wrong sorting
  order ([#2473](https://github.com/maibornwolff/codecharta/issues/2473))

### Changed

- Calculate MD5 checksum when generating .cc.json files ([#2411](https://github.com/MaibornWolff/codecharta/pull/2450))

## [1.82.0] - 2021-10-18

### Fixed 🐞

- Fix what's new section including the last opened
  version ([#2447](https://github.com/MaibornWolff/codecharta/pull/2453))
- Fix unfocus button text not showing correctly ([#2439](https://github.com/MaibornWolff/codecharta/pull/2439))

### Changed

- Folders in the Folder structure view of the top left come now always before any files, regardless of the sort order.

## [1.81.0] - 2021-10-11

### Fixed 🐞

- Fix color picker not being usable ([#2439](https://github.com/MaibornWolff/codecharta/pull/2439))
- Fix Changelog inconsistencies ([#2425](https://github.com/MaibornWolff/codecharta/pull/2425)) <br>
  ![xl](https://user-images.githubusercontent.com/48621967/135866024-ee06119a-1a62-4912-90df-ac3aa9216608.PNG)
- Fix memory and performance issues related to drawing labels on
  floors/folders ([#2348](https://github.com/MaibornWolff/codecharta/issues/2348)).
- Hides legend block if label description is not available and adds new metric
  descriptions ([#2377](https://github.com/maibornwolff/codecharta/issues/2377)).

## [1.80.0] - 2021-10-04

### Added 🚀

- Adds feature to display building colors as a
  gradients ([#2327](https://github.com/MaibornWolff/codecharta/issues/2327)).
  - "Weighted Gradient" only mixes colors in a small interval around the preset values.
  - "True Gradient" mixes colors from the 0 to the highest value, the two preset color range values determine the
    balance.
  - "Absolute" represents the old behaviour without gradients. <br>
    ![l](https://user-images.githubusercontent.com/42114276/134924267-245c65c9-2893-43a8-9a0a-17e3182bf15a.JPG)

### Fixed 🐞

- Fix broken file/node search #2389
- Fix changelog inconsistencies ([#2425](https://github.com/MaibornWolff/codecharta/pull/2425))

## [1.79.0] - 2021-09-20

### Added 🚀

- Add metric descriptions to the frontend and show a translation next to the
  entry ([#2330](https://github.com/MaibornWolff/codecharta/issues/2330)) <br>
  <img src="https://user-images.githubusercontent.com/31436472/133093437-eaa0efdc-9d8c-49a8-ab21-5c959e232a49.png" width="250px"/>
- An option has been added to the global settings to enable copying screenshots to clipboard instead of saving them in a
  file ([#2326](https://github.com/MaibornWolff/codecharta/issues/2326)) <br>
  ![xl](https://user-images.githubusercontent.com/57844849/131342771-a3c637e3-8241-49aa-8d51-71e3a8d38aef.png)
- Add changelog guidelines ([#2358](https://github.com/MaibornWolff/codecharta/pull/2358))
- A changelog dialog with the latest additions to CodeCharta appears on version
  update ([#1315](https://github.com/MaibornWolff/codecharta/pull/2342)) <br>
  ![xl](https://user-images.githubusercontent.com/48621967/131360878-a8e1ef40-7f73-4de7-8b3f-4c8dc21448da.PNG)

### Fixed 🐞

- Fix broken method call in screenshot feature.
- Improve changelog entries.

### Changed

- Changing the background color and remove "outgoing" and "incoming" edges from the legend, if not
  applicable ([#2330](https://github.com/MaibornWolff/codecharta/issues/2330))
- Improve the user experience for the AI Feature "Suspicious Metrics and Risk Profiles" and enable it for any
  programming language ([#2362](https://github.com/MaibornWolff/codecharta/pull/2362)) <br>
  ![m](https://user-images.githubusercontent.com/26900540/133250867-adf4583d-9d0e-4f81-b8a7-1407b93d9f40.png)

## [1.78.0] - 2021-09-06

### Added 🚀

- A changelog dialog with the latest additions to CodeCharta appears on version
  update ([#1315](https://github.com/MaibornWolff/codecharta/issues/1315))
- Add documentation for SCMLogParserV2 ([#1349](https://github.com/maibornwolff/codecharta/issues/1349))

### Fixed 🐞

- Empty temporary label during hovering ([#2328](https://github.com/maibornwolff/codecharta/issues/2328))
- Show the screenshot hotkey in the screenshot title ([#2323](https://github.com/maibornwolff/codecharta/issues/2323))
- Improved rendering performance ([#2345](https://github.com/MaibornWolff/codecharta/pull/2345))

### Chore 👨‍💻 👩‍💻

- Update GH-Pages and visualization dependencies ([#2356](https://github.com/maibornwolff/codecharta/issues/2356))

## [1.77.0] - 2021-07-30

### Added 🚀

- The "Color Metric Options" panel and "Legend" panel display the maximum value of the selected metric instead of
  infinite. ([#1520](https://github.com/maibornwolff/codecharta/issues/1520))
- Mark color-section as unimportant in delta mode ([#769](https://github.com/maibornwolff/codecharta/issues/769))

### Changed

- Small ui improvements added. ([#1881](https://github.com/MaibornWolff/codecharta/issues/1881))
- Numbers/Percentages always show in the distribution
  bar([#1540](https://github.com/MaibornWolff/codecharta/issues/1540))
  - Toggle between percentage and absolute numbers by clicking anywhere on the (expanded) distribution bar.
  - The old expanded distribution bar is now accessible through a button.

### Fixed 🐞

- It is no longer possible to exclude all files on the
  map ([#901](https://github.com/MaibornWolff/codecharta/issues/901))

## [1.76.0] - 2021-07-13

### Added 🚀

- Custom metric scenarios which include the 'Color-Metric' (rloc) will now also save any changes made to the color
  scheme.

### Fixed 🐞

- Performance improvements when loading new files. ([#1312](https://github.com/maibornwolff/codecharta/issues/1312))

## [1.75.0] - 2021-07-05

### Added 🚀

- Imported files are now compressed by default. Use the -nc parameter to uncompress the
  files. ([#1702](https://github.com/maibornwolff/codecharta/issues/1702))
- Export the current view as a png image by using "Ctrl+Alt+S" or clicking the corresponding
  button ([#674](https://github.com/MaibornWolff/codecharta/issues/674))
- Show only labels of buildings according to a chosen
  color ([#1347](https://github.com/MaibornWolff/codecharta/issues/1347))
- New buttons to reset the color hex values and color metric thresholds
  separately ([#1613](https://github.com/MaibornWolff/codecharta/issues/1613)) <br>
  ![l](https://user-images.githubusercontent.com/50167165/121889295-5b071780-cd19-11eb-87ef-aba0ab0c6c09.png)

### Changed

- Metric aggregations now work as intended and are available from the sidebar when selecting
  folders ([#1953](https://github.com/MaibornWolff/codecharta/issues/1953))
- Opening new files does no longer remove old ones.
  - Already loaded files can be individually removed.
  - The 'Multiple' view will select the latest files. <br>
    ![l](https://user-images.githubusercontent.com/50167165/123071234-c6856f00-d414-11eb-8326-e25f614e75d7.png)

### Fixed 🐞

- It is now possible to rotate the map by rotating the view
  cube ([#353](https://github.com/MaibornWolff/codecharta/issues/353))

## [1.74.0] - 2021-05-31

### Added 🚀

- SonarImport: SonarQube 8.8 support. Older versions are still supported.

### Fixed 🐞

- Only show labels for building included in the search
- Color slider not initialized correctly ([#1592](https://github.com/MaibornWolff/codecharta/issues/1592))

## [1.73.0] - 2021-05-10

### Added 🚀

- Improve descriptions ([#1879](https://github.com/MaibornWolff/codecharta/issues/1879))
  <br></br>
  ![m](https://user-images.githubusercontent.com/57844849/115393175-b2897b00-a1e1-11eb-8601-d2128f3469a3.png)

### Fixed 🐞

- Excluding in delta mode is broken ([#1578](https://github.com/MaibornWolff/codecharta/issues/1578))
  (Inclusion and exclusion of files using wildcard searches in the flatten and exclude operations)
- Fix labels and lines missing a connection in some
  cases([#1716](https://github.com/MaibornWolff/codecharta/issues/1716))
- Ribbons resizing when expanding ([#1952](https://github.com/MaibornWolff/codecharta/issues/1952))

### Chore 👨‍💻 👩‍💻

- Fix breaking changes with newest three-js version([#1877](https://github.com/MaibornWolff/codecharta/issues/1877))

## [1.72.0] - 2021-04-22

### Added 🚀

- Hints for Global Settings ([#1715](https://github.com/MaibornWolff/codecharta/issues/1715))
- Indicate total nodes and excluded / flattened nodes in file
  explorer ([#1880](https://github.com/MaibornWolff/codecharta/issues/1880))
- Add path to node context menu ([#1667](https://github.com/MaibornWolff/codecharta/issues/1667))

### Fixed 🐞

- Made the header semi responsive ([#1037](https://github.com/MaibornWolff/codecharta/issues/1037))

## [1.71.2] - 2021-03-16

### Fixed 🐞

- DevOps pipeline changes
- Fixed web visualization in github

## [1.71.1] - 2021-03-16

### Fixed 🐞

- DevOps pipeline changes

## [1.71.0] - 2021-03-16

### Changed

- Disable unready AI function
- Fix linter errors
- Fix editorconfig

## [1.70.2] - 2021-03-12

### Fixed 🐞

- DevOps pipeline changes
- Project naming for Docker deployment

## [1.70.1] - 2021-03-12

### Fixed 🐞

- DevOps pipeline changes

## [1.70.0] - 2021-03-09

### Changed

- Render on demand ([#1728](https://github.com/MaibornWolff/codecharta/issues/1728))

### Fixed

- Memory leaks

## [1.69.0] - 2021-02-23

### Added 🚀

- Added WebGL FXAA antialias & PixelRatio Options in order to achieve better resolution on high dpi
  displays(https://github.com/MaibornWolff/codecharta/pull/1551).</br></br>
  ![option dialog](https://user-images.githubusercontent.com/74670211/106582136-f4404900-6543-11eb-8f5b-5e1ec47457c7.png)
  There are 4 available modes:
  - **standard mode**: the pixel density is only applied to the small cube with standard browser aliasing
  - **pixel ratio without aliasing**: no antialiasing is used
  - **pixel ration with FXAA**: Nvidia FXAA antialiasing shader is used as an alisaing technique. this has better
    perfromance the standard browser aliasing aliasing
  - **pixel ration with MSAA**: this is the best aliasing quality, slower then FXAA.
- Added GPU Stats (only in dev mode)

### Fixed 🐞

- Unfocus now respects the focus depth ([#1099](https://github.com/MaibornWolff/codecharta/issues/1099))
- Track anonymous usage data also for older CodeCharta API versions and fix some minor bugs.

## [1.68.0] - 2021-02-08

### Added 🚀

- A new experimental feature has been added to track anonymous metadata of a currently loaded map.
  - Neither the map name nor file names will be tracked but anonymous metric values and statistics like (average, min,
    max).
  - The tracked data will not be sent to a server yet. Instead, it can be downloaded as a json file in the Global
    Settings for now.
  - It is planned to send the anonymous data to a server in the future, so that we can collect tracking data
    automatically.
  - ![example of new feature](https://user-images.githubusercontent.com/26900540/106896300-ac5f2480-66f1-11eb-8096-246d1733c0ee.png)

### Fixed 🐞

- Errors occurred in delta mode if names of root folders were different
- Switching maps in delta mode now shows the differences between the
  maps ([#1606](https://github.com/maibornwolff/codecharta/issues/1606))
- Label over hovered building not shown for height Metric value of
  zero ([#1623](https://github.com/MaibornWolff/codecharta/issues/1623))

### Chore 👨‍💻 👩‍💻

- CodeChartaStorage class has been introduced to dynamically store values either on disk (standalone version) or in the
  localStorage (web version). This is the first step to
  solve [#684](https://github.com/MaibornWolff/codecharta/issues/684).

## [1.67.0] - 2021-01-26

### Added 🚀

- Allow opening files from local drive by double clicking on the buildings or clicking on their
  names ([#1314](https://github.com/MaibornWolff/codecharta/issues/1314))
  - Only available in the standalone version!
  - files are opened in associated third-party applications
  - web-links are opened in a browser window
- Allow customized color in the node context menu ([#1556](https://github.com/MaibornWolff/codecharta/issues/1556)).

  [!example of new feature #1556](https://user-images.githubusercontent.com/3596742/104302048-a007f300-54c8-11eb-86c1-287483884783.png)

### Fixed 🐞

- fixed wrong max tree map visibility ([#1624](https://github.com/MaibornWolff/codecharta/issues/1624))
- fixed incorrect label placement on delta maps that share no common
  nodes ([#1686](https://github.com/MaibornWolff/codecharta/issues/1686))

## [1.66.0] - 2021-01-18

### Added 🚀

- Allow color of buildings to be customizable in the ribbon bar and in the legend. Colors of edges are now customizable
  as well ([#1533](https://github.com/MaibornWolff/codecharta/issues/1533))<br/><br/>
  ![example of new feature](https://user-images.githubusercontent.com/3596742/103547861-3c1c7380-4ea5-11eb-8df2-541caf65b9df.png)

### Fixed 🐞

- Global settings not reverting to default ones ([#1632](https://github.com/MaibornWolff/codecharta/issues/1632))
- Maximum treemap files shown in squarified node ([#1624](https://github.com/MaibornWolff/codecharta/issues/1624))
- Wrong folder names and colors in legend when using the highlight folder
  feature ([#1555](https://github.com/MaibornWolff/codecharta/issues/1555))
- Temporary labels are placed at the wrong height for scaled
  buildings ([#1618](https://github.com/MaibornWolff/codecharta/issues/1618))
- Visible labels will disappear or placed lower for scaled
  buildings ([#1619](https://github.com/MaibornWolff/codecharta/issues/1619))
- Unnecessary break line for secondary metrics ([#1093](https://github.com/MaibornWolff/codecharta/issues/1093))

## [1.65.0] - 2020-12-23

### Added 🚀

- Highlight label while hovering over building, draw a temporary label for hovered buildings that have
  none ([#1529](https://github.com/MaibornWolff/codecharta/issues/1529))
- Integrated streetlayout ([#904](https://github.com/MaibornWolff/codecharta/issues/904))
  ![cc_street_ccv](https://user-images.githubusercontent.com/63230711/78872405-87eed900-7a49-11ea-984a-c0ef738779b9.png)
  In street layout file nodes are displayed as buildings and directories are displayed as streets. A street layout has
  the advantage of a more apparent directory structure and stable positioning of nodes after metric changes.
  two different Street layout are integrated : - StreetLayout : as described above. - TMStreet : a combination of street
  layout and squarified layout.

### Changed

- The button to see excluded buildings is now merged into the flattened button. Excluded and flattened buildings can now
  be seen by opening the building with the eye slash
  icon ([#1543](https://github.com/MaibornWolff/codecharta/issues/1543))

### Fixed 🐞

- Height scaling not applied to buildings ([#1595](https://github.com/MaibornWolff/codecharta/issues/1595)))
- Fixed multiple label positioning/scaling bugs

### Chore 👨‍💻 👩‍💻

- e2e flaky test ([#1322](https://github.com/MaibornWolff/codecharta/issues/1322))

## [1.64.0] - 2020-12-15

### Added 🚀

- Download and upload Custom Configurations is now
  possible ([#1472](https://github.com/MaibornWolff/codecharta/issues/1472))

  - Open the Custom Configs menu in the toolbar on top of the map
  - Next to the `plus` Button you can see two new buttons: Upload and download.
    - Download: If you already have added Custom Configs you can download them by clicking the download button.
      - Custom Configs which are applicable for the currently selected map(s) will be downloaded
        as `.cc.config.json` files.
    - Upload: Click the upload button and specify your Custom Config file (`<file-name>.cc.config.json`)
      - Already existing Custom Configs will be skipped.
      - Different Custom Configs with same names will be renamed.
      - Another way to upload your Custom Configs is to upload a `.cc.json` file together with one or
        multiple `.cc.config.json` files using the default `Load .cc.json map` button in the upper left corner.
  - The Configs are stored to the local storage of your browser.
    - If a limit of `768KB` is exceeded you will see a warning when trying to add a new Custom Config.
    - You can click the displayed "download and purge" button to download/backup at least 6 months old Configs and
      then purge them from the local storage to make space for new ones.
    - If we cannot purge any Configs, you might have to do that by your own by deleting specific Configs manually.

### Changed

- Increase possible margin size ([#1490](https://github.com/MaibornWolff/codecharta/pull/1490))
  - change displayed margin value from % to pixel
  - change dynamic margin value to a default margin value that should fit the map

### Fixed 🐞

- Re-enabled color selection for folders and on hover ([#1544](https://github.com/MaibornWolff/codecharta/pull/1544))
- Labels do not take delta height into account ([#1523](https://github.com/MaibornWolff/codecharta/issues/1523))
- The calculation of the map resolution scale factor was
  wrong ([#1491](https://github.com/MaibornWolff/codecharta/issues/1491))
  - The factor is used to decrease the map resolution especially for big maps to avoid performance issues.
  - Now only the selected maps will be considered for the calculation. Unselected maps will be skipped.

## [1.63.0] - 2020-11-30

### Added 🚀

- Add the folder name onto the floor on the first 3 layers to get a better overview of the
  map ([#1491](https://github.com/MaibornWolff/codecharta/issues/1491))
- UX Improvements related to labels allowing for user interaction #1404
  - Labels can be hovered, hovering their corresponding node
  - Selecting a label will select the corresponding node
  - Hovering a label will remove its transparency and move towards the user:
    - If other labels obstruct the hovered label it will move to the front
  - Increased the transparency of other labels; this makes it easier to distinguish the hovered label
  - Increase the amount of labels to 250.
- Show file count of folders in Attribute-Side-Bar ([#1255](https://github.com/MaibornWolff/codecharta/issues/1255)):
  ![img showing file count of folder](https://user-images.githubusercontent.com/3596742/100371884-be915800-3008-11eb-89f5-ed57c62680cc.png)

### Fixed 🐞

- Buildings are flattened when delta is active #824.
- Selected Building now stays highlighted when map is rotated #1498

## [1.62.0] - 2020-11-12

### Added 🚀

- A new option in the Global Settings allows to enable/disable experimental features #1318
  - Click on the settings button in the upper right corner to open the Global Settings dialog.
  - Activate/Deactivate the new option "Enable Experimental Features"
  - The features will be shown/hidden accordingly
- "CustomViews", the first experimental feature has been added #1318

  - It must be enabled by activating the new option in the Global Settings dialog as mentioned before.
  - You can save your current map configurations to replay/restore them later.
  - A saved CustomView can only be applied for it's original map.
  - This will enable you to be more efficient in analizing projects by switching between different CustomViews.

- NodeContextMenu now contains option to keep buildings highlighted #1323

- Fixed Folder algorithm supports nested (parent-child) Fixed Folders #1431
  1. Define children of a Fixed Folder also as Fixed Folders by adding the `fixedPosition` attribute manually
     in `.cc.json`.
  1. All children of a parent Fixed Folder must be fixed.
  1. Read the how-to guide for further
     information: https://maibornwolff.github.io/codecharta/how-to/fixate_folders_with_a_custom_cc_json/

### Changed

- Improved search

  1. Not providing any star in the search bar from now on expects the input to
     be a wildcard search. Thus, files are going to match paths that have
     leading or following characters. E.g., `oo` is going to match
     `/root/foobar`.
  1. To use the explicit former search mode, wrap the search entry in quotes as
     in: `"oo"`. This would only match filenames that are exactly `oo`.
  1. The search field accepts multiple search entries at once, separated by
     commata. `foo,bar` is going to search for both `*foo*` and `*bar*` and
     marks all matched files accordingly.
  1. It is possible to invert the search with a leading exclamation mark as in
     `!foobar`. That will match any file that does not match `*foobar*`. It is
     only possible to invert the complete input, not individual search entries.
  1. Whitespace handling changed to ignore leading whitespace.

- Distribution metric #1188

  1. set rloc to default distribution metric, showing language percentages for real lines of code, if available. Else
     set to unary to show language distribution over files

- Improved file sorting in the file overview of the search bar
  - Numbers are sorted naturally
  - Characters are compared with their base character (e.g., `a` is now next to `á`).
- Label metric not shown by default anymore

## [1.61.0] - 2020-10-30

### Changed

- Disable highlighting buildings during map movement #1432

### Fixed 🐞

- File tree/flattened/excluded overlay visualization is buggy #1269
- EdgePreview on Map broken when selecting zero #1276

### Chore 👨‍💻 👩‍💻

- Schedules and merge retries of dependabot dependency updates changed

## [1.60.2] - 2020-10-24

### Fixed 🐞

- Mouse cursor flickering #1170
- Fix flipping map when clicking any option in the toolbar #1410
- Fix edge metric not working correctly

## [1.60.1] - 2020-10-20

### Fixed 🐞

- Issue with first start without an internet connection not working#1266
- Issue with ribbon bar sizes for opened cards #1035

## [1.60.0] - 2020-10-16

### Added 🚀

- Parsing feedback with progressbar and probable ETA for parsers and SonarImporter #847
- Mark node names and make the names clickable for nodes that have a link to them #1313
- Indicate the metric name next to a shown value in a new line on labels #1035
- Checkboxes to display metric names and values and to display node names on labels #1035
- Mark node names and make the names clickable for nodes that have a link to them #1313

### Changed

- Label design #1035

### Fixed 🐞

- First start without an internet connection of standalone not working #1266
- Comparing a map in delta mode shows the correct differences
- This mainly applies to maps compared with itself while it also fixes some other minor miscalculations
- File extensions detection is improved
- Zooming in and out the map will now close the node context menu #1324
  - Improved and simplified event handling in NodeContextMenu component

### Chore 👨‍💻 👩‍💻

- Improved performance of multiple operations (e.g., delta mode).

## [1.59.0] - 2020-10-09

### Added 🚀

- New EXPERIMENTAL SCMLogParser version
- Improved performance around 300% when parsing CodeCharta
- Improved memory usage
- Fixed issue with old parser creating incorrect nodes in CodeCharta #871
- ATTENTION: the parser is experimental, therefore some potential issues might remain, e.g. potentially an unhandled
  edge case when parsing node
- To use the new parser a reversed git log is needed, as well as a git file list, refer to `ccsh scmlogparserv2 -h` for
  additional information

### Fixed 🐞

- Color-Metric slider is set and activated in the map accordingly to the released sliderbutton #1319
- Deselcting a building will instantly dehighlight the buildings which were connected through edges #890

## [1.58.1] - 2020-10-02

### Fixed 🐞

- Showing wrong edges when hovering a building after selecting one #1137

## [1.58.0] - 2020-10-02

### Added 🚀

- Add active color metric to the top of the legend panel #1278
- SourceCodeParser: Java 14 Support #1277

## [1.57.4] - 2020-09-25

### Fixed 🐞

- Metric-Settings-Panels closed when clicking an option inside the panel #1258
- Improve loading and rendering maps performance

## [1.57.3] - 2020-09-18

### Fixed 🐞

- Improve overall performance for loading and rendering maps
- Improve error messages when a file can't be loaded with the URL parameters

## [1.57.2] - 2020-09-11

### Fixed 🐞

- New API version 1.2 not set correctly in analysis

## [1.57.1] - 2020-09-11

### Fixed 🐞

- Validation of unique filenames not checking for the complete path and instead throwing an error on duplicate filename

## [1.57.0] - 2020-09-11

### Added 🚀

- `fixedPosition` as a new property in the `cc.json` that allows to fixate folders in the map

### Changed

- `cc.json` version updated to `1.2`

### Fixed 🐞

- Compressed `cc.jsons (.gz) not marked as accepted when selecting a file in the file chooser

### Docs 🔎

- [How-To: Fixate Folders in the `cc.json`](https://maibornwolff.github.io//codecharta/how-to/fixate_folders_with_a_custom_cc_json/)
- CC-Json-API changes

## [1.56.0] - 2020-09-04

### Fixed 🐞

- Improve performance when switching to multiple or delta mode when edges are available
- Scenario with EdgeMetric is only appliable when EdgeMetric is existing for the Map #1201
- Starting standalone version results in infinite loading loop #1202
- Expanded metric selection will close when clicking anywhere outside of that selection #1036

## [1.55.0] - 2020-08-28

### Added 🚀

- Cursor indicator for different mouse actions #1042

### Changed

- Edge-Metrics sorted by name now instead of number of incoming and outgoing edges

### Fixed 🐞

- Number of incoming and outgoing edges not visible when hovering over a node #1095
- Highlighting buildings in multiple mode now works #956

## [1.54.0] - 2020-08-21

### Added 🚀

- Opening NodeContextMenu in the tree-view marks the node until it is closed #1068

### Fixed 🐞

- Missing Sonarcloud metrics in demo

### Docs 🔎

- Added note how to fix missing `sh` command issue when running integration tests on Windows

## [1.53.0] - 2020-08-14

### Changed

- NodeContextMenu will show up when releasing the right-mouse-button now #1027

### Fixed 🐞

- NodeContextMenu showing up after moving the mouse while holding right-mouse-button #1027

## [1.52.0] - 2020-08-07

### Added 🚀

- Support for Tokei 12 new JSON schema #1103

### Changed

- Rename master branch to main for a more inclusive naming #1117

### Fixed 🐞

- After loading an invalid file the filechooser pops up again, so that the user can choose a valid file #1021
- Quality gates on sonarcloud.io are red #879

### Docs 🔎

- Moved developer guides to our [gh-pages](https://maibornwolff.github.io/codecharta/) #986

## [1.51.0] - 2020-07-24

### Added 🚀

- File chooser now accept ".json" files only to avoid accidentally loading incorrect files #1094
- Lots of tooltips #1030

### Fixed 🐞

- Blacklisting a building would sometimes not update the map #1098
- Changes made after opening the filechooser and closing it won't be applied #875
- Edge metric list not always updated correctly when loading a new file #1106

## [1.50.0] - 2020-07-10

### Added 🚀

- Line between scenario indicator and remove button #1069

### Changed

- Reduced transition time when opening or collapsing parts of the ribbon bar #1043
- Search Panel will open now when clicking in the search field and collapse when clicking somewhere else #1071

### Fixed 🐞

- Opening the same file again will now reload the file and reset the application #1032
- Improve render performance by persisting color conversions #1034
- Sorting in tree-view not being applied #1040

## [1.49.1] - 2020-07-03

### Fixed 🐞

- Improved performance significantly when switching between single, multiple and delta
- Color-Range-Slider sometimes misbehaved when loading a new map or excluding buildings #926

## [1.49.0] - 2020-06-19

### Added 🚀

- Custom scenarios can be created and saved through the scenario menu #675
- Importer and parser documentation can now be found on the github Website #954
- Output of sourcemonitor can now be compressed with the compression flag

### Chore 👨‍💻 👩‍💻

- [Security] Bump angular from 1.7.9 to 1.8.0 in /visualization #995

## [1.48.0] - 2020-06-12

### Added 🚀

- Support of compressed cc.json files. Files can be compressed in the analysis #848

### Fixed 🐞

- Improved performance of several importers #846

## [1.47.1] - 2020-05-08

### Fixed 🐞

- Attribute-Side-Bar being invisible

## [1.47.0] - 2020-05-02

### Added 🚀

- When hovering over a folder, all buildings inside it will be highlighted as well #694

### Changed

- Rename the button Show-Complete-Map button to Unfocus #642
- Move the Unfocus button (visible when right-clicking a focused node) to the node-context-menu #948

### Fixed 🐞

- Generating a delta map with merged empty folders in between is now working correctly #730
- Reduced time when opening a new file #932

### Chore 👨‍💻 👩‍💻

- [Security] Bump jquery from 3.4.0 to 3.5.0 in /visualization #944

## [1.46.1] - 2020-04-24

### Added 🚀

- Error dialogs in case of validation or api version issues #610

### Fixed 🐞

- Improved overall rendering performance of larger maps by roughly 40% #836

## [1.45.5] - 2020-04-17

### Added 🚀

- Median symbol for aggregated relative metrics #365
- AttributeTypes for tokeiImporter and SCMLogParser #365
- Ellipsis button in TreeView list when hovering a node to access context menu #780
- Show gray eye-icon next to the ellipsis-button to indicate a flattened node #780
- Attribute Type selector in the metric dropdowns for edges and nodes

### Changed

- Metrics with AttributeType relative are now aggregated using the median #365
- Showing absolute number of files instead of relative number when hovering list item in TreeView #780
- Clicking a hovered list item inside the TreeView opens folders #780
- Color node name in gray when flattened #780

### Removed 🗑

- Eye-icon in TreeView list to flatten a node #780
- Option to focus a node when clicking the node name inside the TreeView #780

### Fixed 🐞

- Consistency of AttributeTypes representation #365
- Wrong file description for tokeiimporter
- Improved search performance #837

## [1.44.0] - 2020-03-27

### Added 🚀

- Dialog to select between different sorting options #388
- Button to reverse the current selected sorting #388

### Fixed 🐞

- Show file selection in toolBar after excluding or hiding a node instead of an empty toolBar #896

## [1.43.0] - 2020-03-20

### Changed

- Selectable metrics will only contain metrics from the visible maps
- Closing the attribute-side-bar by clicking somewhere in the map will now be triggered on mouse up instead of mouse
  down

### Fixed 🐞

- Search-panel opening for a short duration when importing a new file

### Chore 👨‍💻 👩‍💻

- Fix vulnerability with nokogiri <1.10.8

## [1.42.3] - 2020-03-13

### Fixed 🐞

- Loading Gif not displayed when preparing to render a new map #857
- Selecting zero files in Multiple mode will not trigger the 3D CodeMap creation
- Metrics in the dropdown menu now show the correct max value for the visible maps #876

## [1.42.2] - 2020-02-14

### Fixed 🐞

- Replaced non standard `[[` in sh scripts #849
- Improved performance for loading a new file #836
- Marked Packages are loaded from files #798

## [1.42.1] - 2020-02-07

### Fixed 🐞

- GC Overhead Limit (OutOfMemory Exception) during analysis of large SCMLogs fixed #845

## [1.42.0] - 2020-01-31

### Added 🚀

- Support for camel and kebab-case for ccsh arguments #772
- RawTextParser for analysis #660
- IndentationLevel as metric for RawTextParser #660
- Show additional Pairing Rate of Selected Building, simultaneously to the currently hovered Buildings #736

### Changed

- Options of the ccsh are now consistently in kebab-case #772

### Fixed 🐞

- Path prefix handling in tokeiimporter #841

## [1.41.8] - 2020-01-17

### Removed 🗑

- Project name parameters in the ccsh #773

## [1.41.6] - 2020-01-10

### Fixed 🐞

- Deployment

## [1.41.1] - 2020-01-10

### Fixed 🐞

- Performance of loading maps with edges improved #823
- Calculation of other Group for fileExtensionBar #768
- Remove focus of UI elements when they are not visible anymore

## [1.41.0] - 2019-12-06

### Added 🚀

- Show the relative number of files a folder includes compared to the project in the TreeView #380
- Show the number of files a folder includes in the TreeView when hovering #380
- When the File Extension Bar is hovered, all buildings corresponding to that extension are highlighted #545
- Toggle between percentage and absolute values when clicking the file extension details section #545
- Sum hovered delta values for folders #781

## [1.40.0] - 2019-11-22

### Changed

- Replaced Blacklist Hide with Flatten option #691
- Flattened buildings are not hidden by default #691

### Chore 👨‍💻 👩‍💻

- Bump @types/three from 0.89.12 to 0.103.2 in /visualization #453
- Bump angularjs-slider from 6.5.1 to 7.0.0 in /visualization #454
- Bump webpack from 3.12.0 to 4.41.2 in /visualization #436
- [Security] Bump angular from 1.7.7 to 1.7.9 in /visualization #800

## [1.39.0] - 2019-11-15

### Added

- Progress indicator for SonarImporter #544

### Changed

- New style for hovered metric values #696
- Redesigned slider labels in ribbonBar sections #696
- Shortened ribbonBar sections #696

### Fixed

- Missing pictures and broken links in docs #785
- SCMLogParser is now more resilient to unusual SVN commit messages #763

## [1.38.1] - 2019-11-13

### Added

- New github-pages https://maibornwolff.github.io/codecharta/

### Fixed

- Sum symbol for hovered metric values only shows for folders #775

## [1.38.0] - 2019-11-08

### Added

- Temporal coupling edges generated by SCMLogParser #622

### Changed

- Downloaded files are no longer formatted #679
- Added highly and median coupled files metrics to non-churn metric list of SCMLogParser #622
- Moved nodePathPanel to toolBar and updated style #607

### Fixed

- Removed attributes from downloaded files that should not be there #679

## [1.37.0] - 2019-10-25

### Added

- Sidebar with information regarding the selected building #527
- Sidebar closes when selected buildings is excluded #748

### Changed

- Animation to show or hide the legend panel #527

### Removed

- Expandable detail panel in lower left corner #527
- Removed option to maximize/minimize detail panel #527

### Fixed

- Autofocus and label size for focused nodes #747
- Selected buildings stays selected when settings are changed #748
- IllegalStateException when scanning single file in SourceCodeParser #573
- SourceCodeParser places files in the project root correctly into the hierarchy #574

## [1.36.0] - 2019-10-18

### Changed

- Open and close the ribbonBar sections independently with an updated animation

### Fixed

- Camera is now resetted correctly, when unfocusing #634
- Inputs of Color Range Slider now waits a second before it commits its values #676
- Fixed root folder name in TreeView after new map after loading new map #649
- Increased size of ribbonBar for big screens #644
- File-Extension-Bar will not display excluded nodes anymore #725
- Sanitize input for shelljs #600

### Chore

- Bump jacoco from 0.8.1 to 0.8.4 in /analysis

## [1.35.0] - 2019-10-04

### Added

- Checkbox in global Settings for disabling camera reset, when new map is loaded #685
- Pipe support for SourceCodeParser #716
- Pipe support for SCMLogParser #717
- Pipe support for SonarImporter #715

### Fixed

- Exclude and Hide options are disabled for empty and already existing search patterns #654

## [1.34.0] - 2019-09-20

### Added

- Tokei Importer #538
- Prominent Notice that we use Sonar-jar #713

### Chore

- Bump kotlin-reflect from 1.3.41 to 1.3.50 in /analysis
- Bump json from 20180813 to 20190722 in /analysis
- Bump rxjava from 2.2.9 to 2.2.12 in /analysis
- Bump assertj-core from 3.12.2 to 3.13.2 in /analysis
- Bump sonar-java-plugin from 5.12.1.17771 to 5.14.0.18788 in /analysis

## [1.33.0] - 2019-09-10

### Added

- Edge Previews (Palm-Tree-Effect) #529
- Dropdown to select Edge Metric, including Edge Counter #529
- Edge Metric settings for Edge Height, Number of Previews & show only building with Edges #529

### Changed

- Edge Visualization to better distinguish between incoming and outgoing edges #529
- Distribution metric is by default the same as area metric #689
- MapTreeView below searchBar opens the first level by default #690
- Focus metric search when opening metricChooser #693

### Removed

- Edge Options in Context menu #529

### Fixed

- SourceCodeParser now skips custom metrics for files, if the syntax tree cannot be created
- Nodes with color metric equals 0 are colored correct again #677

### Chore

- [Security] Bump mixin-deep from 1.3.1 to 1.3.2 in /visualization

## [1.32.0] - 2019-08-09

### Added

- Search for metrics and an indicator for the highest value in dropdown #575
- Button to enable PresentationMode that uses Flashlight-Hovering #576
- Clarifying information which file is which in the file bar when in delta mode #615

### Changed

- Replaced Scenario dropdown with button on the left of the metric sections #628

## [1.31.0] - 2019-08-02

### Added

- New Metric in SourceCodeParser: Maximum-Nesting-Level #659

### Fixed

- Label hight adjustment now matches scaling of map #594
- SCMLogParser now guesses the input file encoding #614

## [1.30.0] - 2019-07-26

### Added

- New Search Bar #526
- Number of Renames Metric to SCMLogParser #621
- Age In Weeks Metric for SCMLogParser #620

### Changed

- ToolBar now shows partially cut-off controls if the window is too small #582
- Position of the legendPanel was moved to the bottom-right corner #633
- RibbonBar only opens the three metric section
- Moved Scenario-select to the right in order to use less space
- Moved loading-gif from ribbonBar to toolBar

### Removed

- RibbonBar toggle button

### Fixed

- FileExtensionBar height to not show a bottom-margin in Chrome
- PointerEvents not being propagated when RibbonBar was extended
- Reduced memory usage of SCMLogParser to avoid OutOfMemory Exception #631

### Chore

- [Security] Bump lodash.mergewith from 4.6.1 to 4.6.2 in /visualization
- [Security] Bump lodash from 4.17.11 to 4.17.13 in /visualization
- [Security] Bump fstream from 1.0.11 to 1.0.12 in /visualization

## [1.29.0] - 2019-07-12

### Changed

- Moved Button to reset the map to the center next to the view-cube #606
- Moved FileExtensionBar #527

### Removed

- Burger Menu / SideNav #526

### Fixed

- Colors in File-Extension-Bar will be displayed in MS Edge and Standlone now #584

## [1.28.0] - 2019-06-28

### Added

- Releasing will now remind the developer to manually add the release notes #533
- StructureModifier to remove and move nodes and set root of projects #547 / #181

### Changed

- More informative log messages regarding the success of project merging #547

### Removed

- Release Notes are not generated and added automatically to a release #533

### Fixed

- Margin will now be set correctly depending on whether dynamicMargin is enabled or not #602

## [1.27.0] - 2019-06-25

### Added

- Automatically generates release notes from changelog and appends it to release #533
- Adds global settings-menu with settings from options panel and weblinks #528

### Changed

- Moved File Settings from Ribbon Bar to new File Setting Bar #525
- Rename sample file codemap-nodes #587
- Hide checkbox to select white-positive-buildings in delta state #345

### Removed

- Removes Options panel from sidebar #528
- Removes Weblinks panel from sidebar #528
- Removed URL-parameter info from sidebar #525

### Fixed

- Unary Metric will no longer be auto-selected when a new map is loaded #579

## [1.26.0] - 2019-06-14

### Added

- FileExtensionBar to show file-distribution of chosen metric #495
- sum icon is now displayed on the left of the metric value #364
- Added Pop-up dialog before downloading file to set filename and see what data will be stored #523

### Fixed

- Fix set default ColorRange when resetting color section #560

## [1.25.1] - 2019-05-30

### Added

- SVN log parser keeps track of renaming of files for metric calculation #542

### Fixed

- Entries with renaming information in SVN logs are attributed to correct file #542
- Unary metric will no longer be removed from the MetricChooser-Dropdown when a folder was excluded or hidden #548
- Changing margin and then file or mode will no longer freeze the application #524

### Chore

- [Security] Bump tar from 2.2.1 to 2.2.2 in /visualization

## [1.25.0] - 2019-05-17

### Added

- Added SonarJava to Source code parser #343
- Added exclude and defaultExclude options to SourceCodeParser #508
- Show loading-gif in ribbonBar when rerendering map

### Changed

- Using Sonar Plugins for Source code parser, giving the Sonar Metrics #343
- Use debounced settings update instead of throttled
- Filename of downloaded file now contains time #484

### Fixed

- Fixed issue with too long line in ccsh.bat #506
- Prevent downloaded files from having multiple Timestamps #484
- Do not show loadingGif when cancelling the fileChooser #498
- Excluding a building now updates the maximum value of colorRange #355

### Chore

- Bump angular-material from 1.1.9 to 1.1.14 in /visualization
- [Security] Bump jquery from 3.3.1 to 3.4.0 in /visualization

## [1.24.0] - 2019-04-23

### Removed

- Settings as URL parameters #470

### Fixed

- Fixed issue with trailing slash in URL parameter of SonarImporter #356

### Chore

- Bump d3 from 4.13.0 to 5.9.2 in /visualization
- Bump sinon from 4.5.0 to 7.3.1 in /visualization

## [1.23.0] - 2019-03-22

### Added

- Project Name can be specified for merge filter #394

### Changed

- Throw a MergeException if project names do not match in MergeFilter #394

### Fixed

- Excluded buildings are no longer used for aggregated metric calculation #352

### Chore

- Bump browser-sync-webpack-plugin from 1.2.0 to 2.2.2 in /visualization
- Bump @types/node from 8.10.19 to 11.11.3 in /visualization
- Bump html-webpack-plugin from 2.30.1 to 3.2.0 in /visualization
- Bump load-grunt-tasks from 3.5.2 to 4.0.0 in /visualization #444
- Bump ajv from 5.5.2 to 6.10.0 in /visualization #447
- Bump resolve-url-loader from 2.3.0 to 3.0.1 in /visualization #448

## [1.22.0] - 2019-03-15

### Added

- Added buttons to select all/none/inversion of revisions/maps in multiple mode #391
- Merge filter can merge all files of folders #392

### Fixed

- Fixed bug that code map was not re-loaded when changing from multiple to single revision mode #396
- Fixed missing apiVersion in aggregated map #398
- Input Fields of color sliders adjust width according to content #409

### Chore

- Bump nouislider from 11.1.0 to 13.1.1 in /visualization
- Bump typescript from 2.7.2 to 3.3.3333 in /visualization
- Bump @types/d3 from 4.13.0 to 5.7.1 in /visualization

## [1.21.2] - 2019-02-26

### Added

- When entering Multiple Mode, all Maps/revisions are preselected

### Fixed

- Fixing non-existent metric aggregation on root-level when using multiple Files

## [1.21.1] - 2019-02-22

### Added

- Hovering a node in the map also hovers it in the tree view #351

### Fixed

- Fixing sync between treeview hovering and map hovering #351
- Folders can no longer be colored in the CodeMap or TreeView #359

## [1.21.0] - 2019-02-16

### Added

- Color searched node names green in TreeView #225
- Add option buttons (three dots) in TreeViewSearch to `Hide` or `Exclude` matching nodes #298
- Show blacklist entry counter in blacklistPanel header #298
- Option checkbox 'Hide Flattened Buildings' #225
- Hide/Flatten non-searched buildings #225
- Hide/Flatten all buildings, if searchPattern can't find any matching nodes #225
- Show maxValue of each metric in metricChooser select list #204
- Colored color-slider inside the RibbonBar #318
- Option to color positive buildings white #311
- Clicking the ribbonBar section-titles toggles the ribbonBar #324
- View-Cube displayed in top right corner #274
- Adding prettier formatter
- Adapt colorRange when changing colorMetric #330

### Changed

- Update TreeView filter with search field #225
- Use 'gitignore' style matching in TreeViewSearch #225
- Reorder `Focus`, `Hide` and `Exclude` buttons in nodeContextMenu #298
- Reorder sidebarPanels (BlacklistPanel beneath TreeViewSearchPanel) #298
- Use `fa-ban`-icon as symbols for blacklistPanel (instead of `fa-list`) #298
- Use `fa-ban`-icon as symbols for blacklistType `Exclude` (instead of `fa-times`) #298
- Label size keeps readable for large maps or a high distance between camera and map #237
- updated dependencies to fix vulnerabilities
- Scenarios only update settings which exist in Scenario and not all #224
- MergeFilter to merge unique blacklist entries #275
- MergeFilter to only merge unique attributeType entries #275

### Removed

- Remove invertHeight checkbox in delta-view #306
- Remove option to add blacklist entries from inside the blacklistPanel #298
- Remove statistic functions in Experimental panel #308

### Fixed

- CodeMap does not move anymore when navigating in text-fields #307
- Merge blacklist in multipleFile view and convert paths #275
- Show logo in NW.js standalone application #233

## [1.20.1] - 2018-12-19

Fixed release issues.

## [1.20.0] - 2018-12-19

### Added

- button to unfocus node
- NodeContextMenu: Option to only hide dependent edges
- plop support

### Changed

- Renaming 'isolate node' to 'focus node'
- Focusing a node does not remove the blacklist items of type Hide

### Removed

- NodeContextMenu: Option to 'show all' nodes, which used to unhide all nodes

### Fixed

- Reshow hidden nodes from Treeview or Blacklist

## [1.19.0] - 2018-11-02

### Added

- Deleted files in delta view use their previous area value in order to be visible #254

### Fixed

- Buildings in the delta view are not colored correctly #253
- Reset Button in RibbonBar to reset 'Invert Colors' #255
- Remove lag of 'Invert Color' checkboxes, when selecting single/delta mode #255

## [1.18.1] - 2018-10-31

Fixed release issues

## [1.18.0] - 2018-10-29

### Added

- Integration with Jasome through JasomeImporter #245
- URL parameter 'mode' with the values Single, Multiple or Delta
- Blacklist to persist excluded or hidden nodes #205
- Option to exclude nodes in nodeContextMenu #205
- BlacklistPanel in SettingsSidebar to manage blacklist #205
- Save-Button to download current CodeMap #205
- Publishing visualization on Docker Hub #252

### Changed

- No longer fat jar of every subcomponent of analysis, baked into ccsh
- Changed simple syserr write to logger call for analysis #243

### Removed

- URL parameter 'delta' does not exist anymore

### Fixed

- Show delta of CodeMap when URL parameter mode=delta is set

## [1.17.0] - 2018-09-28

### Changed

- Invert delta colors moved from color to heigh metric column in ribbon bar #220
- Delta value now as kindOfMap shown #220
- Aggreate maps as multiple rename #220

### Fixed

- Single/delta buttons now correctly activated when delta in ulr shown #220

## [1.17.0] - 2018-09-21

### Added

- CodeMaatImport for temporal coupling dependencies #172
- EdgeFilter to aggregate edge-attributes as node-attributes #222
- Option to show and hide dependent edges from node-context-menu #218

### Changed

- MergeFilter merges edges #172

## [1.16.2] - 2018-09-10

### Fixed

- missing event in firefox #232

## [1.16.1] - 2018-08-31

### Added

- gitlab + dotnet manual

## [1.16.0] - 2018-08-31

### Added

- add the option to add multiple files via url parameter (e.g. ?file=a&file=b...)

## [1.15.1] - 2018-08-13

Fixed release issues

## [1.15.0] - 2018-08-13

### Added

- e2e tests are running in CI Environment (headless)
- pupeteer as e2e test framework
- Show names of marked packages in legend
- Added a source code importer that can analyse rloc,mcc for java source code
- keep settings when the user changes a file
- Added option to set white background

### Removed

- cypress

## [1.14.2] - 2018-07-16

### Changed

- Changed folder detail metrics from mean to sum

## [1.14.1] - 2018-07-13

Fixed release issues

## [1.14.0] - 2018-07-13

### Added

- Added UnderstandImporter to Analysis
- Packages can be highlighted in different colors #152
- Adding a context menu with highlighting colors and convenience methods for the tree view and 3D view #155
- Folders and files to highlight can be described in the cc.json #165
- Dynamic/automatic margin computing de/activated by tick

### Changed

- Details panel: using the sum of the childrens metrics instead of the mean value

### Fixed

- Display buttons do not trigger map changes #185
- Flickering surfaces when zooming out

## [1.13.0] - 2018-06-08

### Added

- Layout switcher #141
- Added CrococosmoImporter to Analysis
- Added type, dirs, name to CSVExporter
- Invert height of building checkbox
- Aggregate multiple maps in visualization #110
- Auto Focus selected map part
- Timmer added to applySettings in SettingsService

### Changed

- Crococosmo xml files will now generate a cc.json file for each version
- Suppressing ARIA warnings
- Simplified gradle structure of analysis part
- Deltas added in the metric quick access panel #138
- Ticks and ResetValue Buttons call to onSettingsChange to avoid applySettings timer
- compacting empty middle packages #150
- Detail panel minimized by default

### Fixed

- filter by regex shows parent nodes #116
- typo in scss file

## [1.12.0] - 2018-04-27

### Added

- horizontal quick access metric chooser
- Link behind filepath in detailPanel #84
- Double click event-handler on Buildings #84
- Detail Panel can be minimized and maximized
- Settings option to minimize Detail Panel
- cypress as an e2e test runner

### Removed

- metric details from legend
- metric chooser from settings panel

## [1.11.2] - 2018-04-13

### Fixed

- a sonar importer bug which prevented the importer to fetch the last page #122

## [1.11.1] - 2018-04-11

Fixed release issues

## [1.11.0] - 2018-04-11

### Added

- SASS support
- simple regex filter
- Reset Button
- Dialog Service replaces console log calls and window.alert calls
- linking tree view and map hover
- auto fit scene button
- anugularJS material
- Scenarios are now filtered by compatibility for the given map
- Link in visualization #84

### Removed

- materialize-css
- grunt

### Fixed

- less flickering and artifacts

## [1.10.0] - 2018-03-22

### Changed

- Clean up UI #86
- Updated analysis dependencies

### Fixed

- Delta View shows Deltas of itself as non-trivial if nodes have same name #89: Compare deltas by path not name
- Delta calculation performance boost #91
- Problems when intermediate nodes missed metrics #92
- removed unnecessary calculations
- removed bug in SonarImporter that slowed up performance and missed out multiple metrics
- minor bugs

## [1.9.3] - 2018-02-23

### Changed

- sorting treeview by folders and names

## [1.9.2] - 2018-02-20

### Added

- added preliminary CSVExporter for visualisation data

### Changed

- padding rendering
- minimal building height is 1 to prevent clipping issues
- fallback values for visualization when no metric is available (area = 1, height = 1, color = grey). Data in data
  structure will not be changed.

## [1.9.1] - 2018-02-20

### Fixed

- detail panel bug fix

## [1.9.0] - 2018-02-20

### Changed

- moved to unscoped npm packages

## [1.8.2] - 2018-02-20

### Changed

- detail panel background is white now. better visibility

## [1.8.1] - 2018-02-20

### Changed

- revision chooser moved to settings panel and uses now understandable dropdowns instead of links. Part of the #82
  proposals

## [1.8.0] - 2018-02-20

### Added

- Experimental dependency support
- loading indicator
- file path to detail panel
- collapsible tree view and visibility/isolation per node toggles

### Changed

- added a ray-aabb intersection test before precise testing. Less time is spent in intersection methods.

### Fixed

- fixed a minor bug
- canvas mouse event listener are now limited to the canvas dom element. UI events will not trigger the canvas listeners
  anymore
- canvas mouse events distinguish now between click and drag. Dragging does not reset selection anymore
- slider input #64
- rz slider initialization bug
- increasing test coverage
- deltas where calculated on map loading even though, they were disabled

## [1.7.2] - 2018-02-02

### Fixed

- url to homepage
- analysis package

## [1.7.1] - 2018-02-02

Fixed release issues

## [1.7.0] - 2018-02-02

### Changed

- npm pachage scoped to @maibornwolff
- Defined further scenarios via json file
- Added description for metrics and scenarios
- using fixed point values in detail panel (ui) to truncate infinite or long decimals
- folders now use the mean attributes of their buildings(leaves)

### Fixed

- Bugfix: detail panel should be cleared before setting new details else old values may survive

## [1.6.7] - 2018-02-01

Fixed release issues

## [1.6.6] - 2018-02-01

### Added

- added anonymous git log generator anongit
- browser demo shows codecharta-visualization sonar analysis

### Changed

- rewrote command line interface
- linking ccsh to bin/ccsh will be deleted later

### Fixed

- No underscore for scenarios in tooltips #71

## [1.6.5] - 2018-01-30

Fixed release issues

## [1.6.4] - 2018-01-30

### Fixed

- fixed broken SonarImporter due to jdk9 migration

## [1.6.3] - 2018-01-26

### Added

- added npm publish for analysis
- simple release script for automatic changelog updates, commits, tags, version bumps

## [1.6.2] - 2018-01-25

### Added

- added support for git log --raw and git log --numstat --raw
- added support for git log --numstat and codechurn
- added support for renames in SCMLogParser for git log --name-status
- added support for renames in SCMLogParser for git log --numstat, git log --raw and git log --numstat --raw
- added new SCM experimental metrics range_of_weeks_with_commits and successive_weeks_of_commits
- the file origin of a node is displayed in the details now
- sonarqube analysis on CI build
- npm publish support in visualization

### Changed

- Deltas are no longer experimental
- two selected delta maps now merge their nodes correctly. The map where
  a node was missing get's a copy of this node with metrics=0.
  File additions/deletions are therefore only visible when areaMetric is
  unary and deltas are activated.

### Fixed

- delta display bug for heights
- going back from delta view now correctly removes deltas from node data
- Delta shown although not in delta mode #60
- Allow inversion of delta colors #57
- npm binary error

## [1.5.2] - 2018-01-04

### Changed

- scaling slider now has steps of 0.1. This allows the user to select precise values like 2.0
- updated jdk to jdk9

### Fixed

- Opening the same file a second time does not work #53
- added missing require declaration
- added glsl loader in testing environment
- Native Application support is bugged while building in Travis CI #48

## [1.5.1] - 2017-11-14

### Added

- command line parameter to toggle "authors" attribute in SCMLogParser

### Fixed

- when passing a file through the "file" parameter in the URL, the map now renders correctly

## [1.5.0] - 2017-10-24

### Added

- experimental delta functionality
- loading multiple maps
- experimental margin slider

### Changed

- faster rendering

### Removed

- nwjs packages and native apps due to a bug

### Fixed

- using color metric instead of height metric for color range slider ceil

## [1.4.0] - 2017-09-14

### Added

- Typescript support
- Browsersync
- added advanced merging strategy "leaf" in MergeFilter
- advanced merging with restructuring

### Changed

- Browserify replaced with Webpack
- Better debugging
- Karma instead of Mocha

## [1.3.2] - 2017-08-18

### Added

- add slider controls for color thresholds #19
- Added additional structuring in SonarImporter for multi-module projects
- button to generate current url parameters
- camera position is now a setting (e.g. in scenarios or url parameters)
- margin slider: make it easier to find out to which package/folder a class belongs #20

### Changed

- better url parameter resolution (nested parameters are handled correctly)
- changed hover color. Allows better distinction between hover and select

### Removed

- obsolete helper grid

### Fixed

- changing display or color settings resets scaling #18
- scenario description #32
- Scaling should not scale the labels #35

## [1.3.1] - 2017-07-05

### Fixed

- Prevented override of URL-parameters by default scenario

## [1.3.0] - 2017-07-05

### Added

- Adding simple merge functionality for multiple json files
- Added CSVImporter
- Added Translation for SonarQube metrics
- Added descriptions for metrics

### Changed

- Changed uppercase metrics, e.g. RLOC, to lowercase metrics

### Fixed

- Simple cc.json does not display anything #17

## [1.2.0] - 2017-06-19

### Added

- Adding Labels and UI
- Support for links to source page of SonarQube in sonarimporter
- Added SCMLogParser

### Fixed

- GitHub Issue: legend is wrong #21

## [1.1.5] - 2017-05-31

### Fixed

- Wrong version numbers in analysis part

## [1.1.4] - 2017-05-26

### Added

- Scenarios and default scenario
- Translation API for Metrics
- Metric tooltips in dropdown

### Fixed

- GitHub Issue: Sonarimporter crashes with null pointer exception when there is a component without path. #13

## [1.1.3] - 2017-05-01

### Added

- Support for SonarQube Measures-API
- Error logging for sonarqube errors

### Changed

- Standard Sonar metric is now
  complexity,ncloc,functions,duplicated_lines,classes,blocker_violations,generated_lines,bugs,commented_out_code_lines,lines,violations,comment_lines,duplicated_blocks

## [1.1.2] - 2017-04-28

### Added

- Translation API for Metrics

## [1.1.1] - 2017-04-07

### Fixed

- GitHub Issue: Flickering surfaces #3
- GitHub Issue: Unable to install due to readlink error on macOS #4

## [1.1.0] - 2017-03-27

### Added

- SourceMonitorImporter for importing projects from SourceMonitor.

## [1.0.0] - 2017-03-17

### Added

- SonarImporter for importing projects from SonarQube.
- ValidationTool for validating an existing json file.
