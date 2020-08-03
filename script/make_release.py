import git
import PyInquirer
import in_place
import pathlib
import subprocess
import fileinput
import datetime


root = pathlib.Path().absolute()


def isRootFolder():
    return root[-10:] == "codecharta"


def confirm(message, printMessage):
    confirm = [{
        "type": "confirm",
        "name": "confirmed",
        "message": message,
        "default": True
    }]
    confirmation = PyInquirer.prompt(confirm)["confirmed"]

    if confirmation:
        print(printMessage)
    else:
        print("Aborting.")
        quit()


def getLatestChangelogEntry(path):
    release_post_content = ""
    with open(path, "r", encoding="utf-8") as fp:
        line_number = 0
        section = None
        for line in fp:
            if line_number > 20:
                if "## [" in line:
                    break

                if "###" in line and section != None:
                    if len(section.split("\n")) > 3:
                        release_post_content = release_post_content + section
                    section = None

                if section != None:
                    section = section + line

                if "###" in line and section == None:
                    section = line

            line_number = line_number + 1
    return release_post_content


def getReleasePost(version, path):
    release_post_header = f"---\ncategories:\n\t- Release\ntags:\n\t- gh-pages\n\ntitle: {version}\n---\n\n"
    release_post_headline = "{{page.title}} is live and ready for [download](https://github.com/MaibornWolff/codecharta/releases/tag/{{page.title}}). This version brings the following:\n\n"
    release_post_content = getLatestChangelogEntry(path)
    return release_post_header + release_post_headline + release_post_content


# Check if we're on project root folder
if not isRootFolder:
    print("Please execute this script from the project root folder. Aborting.")
    quit()
else:
    repo = git.Repo(root)


# Check if there are any uncommited changes
if repo.is_dirty():
    print("Please commit your changes first and/or ignore untracked files in git. Aborting.")
    quit()


# Check if we are on main branch
if repo.head != "main":
    print("You can only release on master branch. Aborting.")
    quit()


# Get latest tag
latest_tag = str(
    sorted(repo.tags, key=lambda t: t.commit.committed_datetime)[-1])
print(f"Last version tag in git is {latest_tag}")


# Precalc new versions
versions = latest_tag.split(".")

major = int(versions[0])
minor = int(versions[1])
patch = int(versions[2])

new_major_version = f"{major + 1}.0.0"
new_minor_version = f"{major}.{minor + 1}.0"
new_patch_version = f"{major}.{minor}.{patch + 1}"


# Get release type and version
questions = [{
    "type": "list",
    "name": "version",
    "message": f"Do you want to release a major version [{new_major_version}], minor version [{new_minor_version}] or a patch [{new_patch_version}]?",
    "choices": ["Major", "Minor", "Patch"],
}]

release_type = PyInquirer.prompt(questions)["version"]

if release_type == None:
    quit()
elif release_type == "Major":
    new_version = new_major_version
elif release_type == "Minor":
    new_version = new_minor_version
elif release_type == "Patch":
    new_version = new_patch_version


# Confirm release
message = f"Do you REALLY want to release {new_version}? WARNING: File changes need to be undone manually or through git when done unintentionally!"
printMessage = f"Selected {release_type} release. Updating project..."
confirm(message, printMessage)


# bump version in gradle.properties
gradle_properties = f"{root}/analysis/gradle.properties"

with in_place.InPlace(gradle_properties, encoding="utf-8") as fp:
    for line in fp:
        if "currentVersion=" in line:
            fp.write(
                f"currentVersion={new_version}\n")
        else:
            fp.write(line)

print(f"v{new_version}")
print("incremented version in ./analysis/gradle.properties")


# bump version in package.jsons
analysis_package = f"{root}/analysis/node-wrapper"
analysis_package_json = f"{analysis_package}/package.json"
analysis_package_lock_json = f"{analysis_package}/package-lock.json"

subprocess.run(["npm", "--prefix", analysis_package,
                "--no-git-tag-version", "version", f"{new_version}"], shell=True)
print("incremented version in ./analysis/node-wrapper/package.json + locks")

visualization_package = f"{root}/visualization"
visualization_package_json = f"{visualization_package}/package.json"
visualization_package_lock_json = f"{visualization_package}/package-lock.json"
subprocess.run(["npm", "--prefix", visualization_package,
                "--no-git-tag-version", "version", f"{new_version}"], shell=True)
print("incremented version in ./visualization/package.json + locks")


# update changelog
changelog_path = f"{root}/CHANGELOG.md"
date = datetime.datetime.now()
month = date.strftime("%m")
day = date.strftime("%d")
date_formatted = f"{date.year}-{month}-{day}"


with in_place.InPlace(changelog_path, encoding="utf-8") as fp:
    for line in fp:
        if "## [unreleased]" in line:
            fp.write(
                f"## [{new_version}] - {date_formatted}\n")
        else:
            fp.write(line)

with in_place.InPlace(changelog_path, encoding="utf-8") as fp:
    line_number = 0

    for line in fp:
        if line_number == 6:
            fp.write(
                "\n## [unreleased]\n\n### Added 🚀\n\n### Changed\n\n### Removed 🗑\n\n### Fixed 🐞\n\n### Chore 👨‍💻 👩‍💻\n\n")
        else:
            fp.write(line)
        line_number = line_number + 1

print("updated ./CHANGELOG.md")


# add gh-pages release post
new_version_formatted = new_version.replace(".", "_")
release_post = f"{date_formatted}-v{new_version_formatted}.md"
release_post_path = f"{root}/gh-pages/_posts/release/{release_post}"

with open(release_post_path, "w", encoding="utf-8") as fp:
    pass
    fp.write("\n")

with in_place.InPlace(release_post_path, encoding="utf-8") as fp:
    for line in fp:
        fp.write(getReleasePost(new_version, changelog_path))
        break


# confirm and make a commit and tag it correctly
message = "Do you want to commit the changes and tag them correctly? WARNING: Commit and Tag need to be undone manually when done unintentionally!"
printMessage = "Committing and tagging..."
confirm(message, printMessage)

repo.index.add([release_post_path, changelog_path, gradle_properties,
                analysis_package_json, analysis_package_lock_json, visualization_package_json, visualization_package_lock_json])
repo.index.commit(f"Releasing {new_version}")
tag = repo.create_tag(new_version, ref="HEAD",
                      message=f"Releasing {new_version}")


# push
message = "The release is now committed and tagged but not pushed. In order to finish this release you need to push the commit and tag. Push ?"
printMessage = "Pushing..."
confirm(message, printMessage)

repo.remotes.origin.push(tag)

print("Please manually add the latest release notes, as soon as the build is successfully deployed")
