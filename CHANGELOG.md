# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/)

## [Unreleased]
### Added
- Scenarios and default scenario
- Translation API for Metrics
- Metric tooltips in dropdown
- Adding Labels and UI

### Changed

### Removed

### Fixed

## [1.1.3] - 2017-05-01
### Added
- Support for SonarQube Measures-API
- Error logging for sonarqube errors

### Changed
- Standard Sonar metric is now complexity,ncloc,functions,duplicated_lines,classes,blocker_violations,generated_lines,bugs,commented_out_code_lines,lines,violations,comment_lines,duplicated_blocks

### Removed

### Fixed

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
