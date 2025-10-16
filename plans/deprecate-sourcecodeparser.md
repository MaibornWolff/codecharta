# Deprecate SourceCodeParser

## Goal
Remove SourceCodeParser functionality while keeping a stub that exits with helpful message directing users to alternatives.

## Steps

1. **Update SourceCodeParser.kt** - Replace implementation with deprecation message
   - Keep command structure for detection
   - Exit immediately with error code 1
   - Show message listing alternatives: unifiedparser, coverageimporter, sonarimporter, rawtextparser
   - Reference simplecc.sh script as complete solution

2. **Remove all other SourceCodeParser files**
   - Delete entire src/main/kotlin subtree except SourceCodeParser.kt
   - Delete entire src/test directory
   - Delete test resources
   - Keep build.gradle.kts (minimal), README.md (update with deprecation)

3. **Update module references**
   - Keep in settings.gradle.kts (for command detection)
   - Keep in ccsh/build.gradle.kts dependencies
   - Update build.gradle.kts to remove unnecessary dependencies

4. **Update documentation**
   - Mark as deprecated in README.md
   - Note: gh-pages docs handled separately

5. **Update CHANGELOG.md**
   - Add entry about SourceCodeParser deprecation
   - List alternatives for users to migrate to

6. **Remove from simplecc.sh script**
   - Already doesn't use SourceCodeParser

## Alternatives to mention
- `unifiedparser` - Modern parser for multiple languages
- `sonarimporter` - Import from SonarQube
- `coverageimporter` - Import coverage data
- `rawtextparser` - Simple text metrics
- `tokeiimporter` - Line count metrics
- `analysis/script/simplecc.sh` - Complete analysis script
