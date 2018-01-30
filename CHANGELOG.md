# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/)

## [unreleased]
### Added

### Changed

### Removed

### Fixed

## [1.6.5] - 2018-01-30
### Added

### Changed

### Removed

### Fixed

## [1.6.4] - 2018-01-30
### Added

### Changed

### Removed

### Fixed
- fixed broken SonarImporter due to jdk9 migration

## [1.6.3] - 2018-01-26
### Added
- added npm publish for analysis
- simple release script for automatic changelog updates, commits, tags, version bumps

### Changed

### Removed

### Fixed

## [1.6.2] - 2018-01-25
### Added
- added support for git log --raw and git log --numstat --raw
- added support for git log --numstat and codechurn
- added support for renames in SCMLogParser for git log --name-status
- added support for renames in SCMLogParser for git log --numstat, git log --raw  and git log --numstat --raw
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

### Removed

### Fixed
- delta display bug for heights
- going back from delta view now correctly removes deltas from node data
- Delta shown although not in delta mode #60
- Allow inversion of delta colors #57
- npm binary error

## [1.5.2] - 2018-01-04
### Added

### Changed
- scaling slider now has steps of 0.1. This allows the user to select precise values like 2.0
- updated jdk to jdk9

### Removed

### Fixed
- Opening the same file a second time does not work #53
- added missing require declaration
- added glsl loader in testing environment
- Native Application support is bugged while building in Travis CI #48

## [1.5.1] - 2017-11-14
### Added
- command line parameter to toggle "authors" attribute in SCMLogParser

### Changed

### Removed

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

### Removed

### Fixed

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
### Added

### Changed

### Removed

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

### Removed

### Fixed
- Simple cc.json does not display anything #17

## [1.2.0] - 2017-06-19
### Added
- Adding Labels and UI
- Support for links to source page of SonarQube in sonarimporter
- Added SCMLogParser

### Changed

### Removed

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
- Standard Sonar metric is now complexity,ncloc,functions,duplicated_lines,classes,blocker_violations,generated_lines,bugs,commented_out_code_lines,lines,violations,comment_lines,duplicated_blocks

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
