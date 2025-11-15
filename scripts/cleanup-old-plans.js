#!/usr/bin/env node

/**
 * Cleanup script for old plan files in the plans/ directory.
 *
 * This script:
 * 1. Reads current versions from analysis/gradle.properties and visualization/package.json
 * 2. Parses all plan files to extract frontmatter
 * 3. For completed plans, compares their version to current version
 * 4. Deletes plans that are 2+ minor versions old
 * 5. Generates a summary report of what was deleted
 *
 * Usage:
 *   npm run plans:cleanup [--dry-run] [--component=<analysis|visualization|both>]
 *
 * Options:
 *   --dry-run: Preview what would be deleted without actually deleting
 *   --component: Only clean up plans for specific component (default: both)
 */

const fs = require("fs")
const path = require("path")

// Parse command line arguments
const isDryRun = process.argv.includes("--dry-run")
const componentArg = process.argv.find(arg => arg.startsWith("--component="))
const componentFilter = componentArg ? componentArg.split("=")[1] : null

// Validate component filter
if (componentFilter && !["analysis", "visualization", "both"].includes(componentFilter)) {
    console.error(`❌ Invalid component: ${componentFilter}`)
    console.error("   Valid values: analysis, visualization, both")
    process.exit(1)
}

/**
 * Parse semantic version string (e.g., "1.138.0") into components
 */
function parseVersion(versionString) {
    if (!versionString) return null

    // Extract version number from various formats
    // "1.138.0", "analysis: 1.138.0", "1.138.0, visualization: 1.137.0"
    const match = versionString.match(/(\d+)\.(\d+)\.(\d+)/)
    if (!match) return null

    return {
        major: parseInt(match[1], 10),
        minor: parseInt(match[2], 10),
        patch: parseInt(match[3], 10),
        original: versionString
    }
}

/**
 * Compare two versions. Returns:
 * - negative if v1 < v2
 * - 0 if v1 === v2
 * - positive if v1 > v2
 */
function compareVersions(v1, v2) {
    if (!v1 || !v2) return 0

    if (v1.major !== v2.major) return v1.major - v2.major
    if (v1.minor !== v2.minor) return v1.minor - v2.minor
    return v1.patch - v2.patch
}

/**
 * Calculate the difference in minor versions
 */
function minorVersionDifference(currentVersion, planVersion) {
    if (!currentVersion || !planVersion) return 0

    // If major versions differ, consider it very old
    if (currentVersion.major !== planVersion.major) {
        return 999
    }

    return currentVersion.minor - planVersion.minor
}

/**
 * Read current version from analysis/gradle.properties
 */
function getAnalysisVersion() {
    const gradlePropsPath = path.join(__dirname, "..", "analysis", "gradle.properties")
    try {
        const content = fs.readFileSync(gradlePropsPath, "utf-8")
        const match = content.match(/currentVersion=([0-9.]+)/)
        if (match) {
            return parseVersion(match[1])
        }
    } catch (error) {
        console.error(`Error reading analysis version: ${error.message}`)
    }
    return null
}

/**
 * Read current version from visualization/package.json
 */
function getVisualizationVersion() {
    const packageJsonPath = path.join(__dirname, "..", "visualization", "package.json")
    try {
        const content = fs.readFileSync(packageJsonPath, "utf-8")
        const pkg = JSON.parse(content)
        return parseVersion(pkg.version)
    } catch (error) {
        console.error(`Error reading visualization version: ${error.message}`)
    }
    return null
}

/**
 * Parse frontmatter from a markdown file
 */
function parseFrontmatter(filePath) {
    try {
        const content = fs.readFileSync(filePath, "utf-8")

        // Extract frontmatter between --- markers
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
        if (!frontmatterMatch) return null

        const frontmatter = {}
        const lines = frontmatterMatch[1].split("\n")

        for (const line of lines) {
            const colonIndex = line.indexOf(":")
            if (colonIndex === -1) continue

            const key = line.substring(0, colonIndex).trim()
            const value = line.substring(colonIndex + 1).trim()
            frontmatter[key] = value
        }

        return frontmatter
    } catch (error) {
        console.error(`Error parsing ${filePath}: ${error.message}`)
        return null
    }
}

/**
 * Check if a plan should be deleted based on version age and component filter
 */
function shouldDeletePlan(frontmatter, analysisVersion, visualizationVersion, versionThreshold, componentFilter) {
    // Only delete completed plans
    if (frontmatter.state !== "complete") {
        return false
    }

    // Must have a version
    if (!frontmatter.version) {
        return false
    }

    // Must have a component
    if (!frontmatter.component) {
        return false
    }

    // If component filter is specified, check if plan matches
    if (componentFilter) {
        // For filter "analysis": delete plans with component "analysis" or "both"
        // For filter "visualization": delete plans with component "visualization" or "both"
        // For filter "both": delete any plans (no additional filtering)
        if (componentFilter === "analysis") {
            if (frontmatter.component !== "analysis" && frontmatter.component !== "both") {
                return false
            }
        } else if (componentFilter === "visualization") {
            if (frontmatter.component !== "visualization" && frontmatter.component !== "both") {
                return false
            }
        }
        // If componentFilter === "both", no additional filtering needed
    }

    // Parse plan version
    const planVersion = parseVersion(frontmatter.version)
    if (!planVersion) {
        return false
    }

    // Determine which current version to compare against based on component
    let currentVersion
    if (frontmatter.component === "analysis") {
        currentVersion = analysisVersion
    } else if (frontmatter.component === "visualization") {
        currentVersion = visualizationVersion
    } else if (frontmatter.component === "both") {
        // For 'both', use the higher version
        currentVersion = compareVersions(analysisVersion, visualizationVersion) >= 0 ? analysisVersion : visualizationVersion
    } else {
        // No component specified or unrecognized - skip
        return false
    }

    if (!currentVersion) {
        return false
    }

    // Check if plan is old enough to delete
    const versionDiff = minorVersionDifference(currentVersion, planVersion)
    return versionDiff >= versionThreshold
}

/**
 * Main cleanup function
 */
function cleanupOldPlans() {
    const plansDir = path.join(__dirname, "..", "plans")
    const versionThreshold = 2 // Delete plans 2+ minor versions old

    console.log("🧹 CodeCharta Plans Cleanup Script\n")

    if (isDryRun) {
        console.log("🔍 Running in DRY RUN mode - no files will be deleted\n")
    }

    if (componentFilter) {
        console.log(`🎯 Component filter: ${componentFilter}\n`)
    }

    // Get current versions
    const analysisVersion = getAnalysisVersion()
    const visualizationVersion = getVisualizationVersion()

    console.log("📊 Current Versions:")
    console.log(`   Analysis:      ${analysisVersion ? analysisVersion.original : "N/A"}`)
    console.log(`   Visualization: ${visualizationVersion ? visualizationVersion.original : "N/A"}`)
    console.log(`   Threshold:     ${versionThreshold} minor versions\n`)

    if (!analysisVersion && !visualizationVersion) {
        console.error("❌ Could not read current versions. Aborting.")
        process.exit(1)
    }

    // Read all plan files
    let planFiles
    try {
        planFiles = fs
            .readdirSync(plansDir)
            .filter(file => file.endsWith(".md") && file !== "template.md")
            .map(file => path.join(plansDir, file))
    } catch (error) {
        console.error(`❌ Error reading plans directory: ${error.message}`)
        process.exit(1)
    }

    console.log(`📝 Found ${planFiles.length} plan files (excluding template.md)\n`)

    // Process each plan
    const toDelete = []
    const skipped = {
        incomplete: [],
        noVersion: [],
        noComponent: [],
        tooRecent: []
    }

    for (const filePath of planFiles) {
        const fileName = path.basename(filePath)
        const frontmatter = parseFrontmatter(filePath)

        if (!frontmatter) {
            console.log(`⚠️  Skipped ${fileName}: Could not parse frontmatter`)
            continue
        }

        if (frontmatter.state !== "complete") {
            skipped.incomplete.push(fileName)
            continue
        }

        if (!frontmatter.version) {
            skipped.noVersion.push(fileName)
            continue
        }

        if (!frontmatter.component) {
            skipped.noComponent.push(fileName)
            continue
        }

        if (shouldDeletePlan(frontmatter, analysisVersion, visualizationVersion, versionThreshold, componentFilter)) {
            toDelete.push({
                path: filePath,
                name: fileName,
                version: frontmatter.version,
                component: frontmatter.component
            })
        } else {
            skipped.tooRecent.push(fileName)
        }
    }

    // Print summary
    console.log("📋 Summary:\n")

    if (toDelete.length > 0) {
        console.log(`🗑️  Plans to delete (${toDelete.length}):`)
        for (const plan of toDelete) {
            console.log(`   - ${plan.name}`)
            console.log(`     Component: ${plan.component}, Version: ${plan.version}`)
        }
        console.log()
    } else {
        console.log("✅ No plans to delete\n")
    }

    if (skipped.incomplete.length > 0) {
        console.log(`⏭️  Skipped incomplete plans (${skipped.incomplete.length}):`)
        for (const name of skipped.incomplete) {
            console.log(`   - ${name}`)
        }
        console.log()
    }

    if (skipped.noVersion.length > 0) {
        console.log(`⚠️  Skipped completed plans without version (${skipped.noVersion.length}):`)
        for (const name of skipped.noVersion) {
            console.log(`   - ${name} (missing version field)`)
        }
        console.log()
    }

    if (skipped.noComponent.length > 0) {
        console.log(`⚠️  Skipped completed plans without component (${skipped.noComponent.length}):`)
        for (const name of skipped.noComponent) {
            console.log(`   - ${name} (missing component field)`)
        }
        console.log()
    }

    if (skipped.tooRecent.length > 0) {
        console.log(`📌 Kept recent completed plans (${skipped.tooRecent.length}):`)
        for (const name of skipped.tooRecent) {
            console.log(`   - ${name}`)
        }
        console.log()
    }

    // Delete files
    if (toDelete.length > 0 && !isDryRun) {
        console.log("🗑️  Deleting old plans...\n")
        let deletedCount = 0

        for (const plan of toDelete) {
            try {
                fs.unlinkSync(plan.path)
                console.log(`   ✓ Deleted ${plan.name}`)
                deletedCount++
            } catch (error) {
                console.error(`   ✗ Failed to delete ${plan.name}: ${error.message}`)
            }
        }

        console.log(`\n✅ Successfully deleted ${deletedCount} of ${toDelete.length} plans`)
    } else if (isDryRun && toDelete.length > 0) {
        console.log("🔍 DRY RUN: No files were deleted")
    }

    console.log("\n✨ Cleanup complete!")
}

// Run the script
cleanupOldPlans()
