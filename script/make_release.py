import git
import PyInquirer
import in_place
import pathlib
import subprocess
import fileinput
import datetime


def isRootFolder():
    currentDir = pathlib.Path().absolute()
    return currentDir[-10:] == "codecharta"


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


# Requirements


# Check if we're on project root folder
if not isRootFolder:
    print("Please execute this script from the project root folder. Aborting.")
    quit()
else:
    repo = git.Repo(pathlib.Path().absolute())


# Check if there are any uncommited changes
if not repo.is_dirty():
    print("Please commit your changes first and/or ignore untracked files in git. Aborting.")
    quit()


# Check if we are on master branch
if not repo.head != "master":
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
if release_type == "Major":
    new_version = new_major_version
if release_type == "Minor":
    new_version = new_minor_version
if release_type == "Patch":
    new_version = new_patch_version


# Confirm release
message = f"Do you REALLY want to release {new_version}? WARNING: File changes need to be undone manually or through git when done unintentionally!"
printMessage = f"Selected {release_type} release. Updating project..."
confirm(message, printMessage)


# bump version in gradle.properties
for line in fileinput.input("./analysis/gradle.properties", inplace=True):
    if "currentVersion=" in line:
        print(f"currentVersion={new_version}", end="\n")
        fileinput.close()
    else:
        print(line, end="")

print(f"v{new_version}")
print("incremented version in ./analysis/gradle.properties")

# bump version in package.jsons
subprocess.run(["npm", "--prefix", "./analysis/node-wrapper",
                "--no-git-tag-version", "version", f"{new_version}"], shell=True)
print("incremented version in ./analysis/node-wrapper/package.json + locks")

subprocess.run(["npm", "--prefix", "./visualization",
                "--no-git-tag-version", "version", f"{new_version}"], shell=True)
print("incremented version in ./visualization/package.json + locks")


# update changelog
date = datetime.datetime.now()
day = date.strftime("%d")
month = date.strftime("%m")

with in_place.InPlace("./CHANGELOG.md", encoding="utf-8") as fp:
    for line in fp:
        if "## [unreleased]" in line:
            fp.write(
                f"## [{new_version}] - {date.year}-{month}-{day}\n")
        else:
            fp.write(line)

with in_place.InPlace("./CHANGELOG.md", encoding="utf-8") as fp:
    line_number = 0

    for line in fp:
        if line_number == 6:
            fp.write(
                "\n## [unreleased]\n\n### Added 🚀\n\n### Changed\n\n### Removed 🗑\n\n### Fixed 🐞\n\n### Chore 👨‍💻 👩‍💻\n\n")
        else:
            fp.write(line)
        line_number = line_number + 1

print("updated ./CHANGELOG.md")


# confirm and make a commit and tag it correctly
message = "Do you want to commit the changes and tag them correctly? WARNING: Commit and Tag need to be undone manually when done unintentionally!"
printMessage = "Committing and tagging..."
confirm(message, printMessage)

repo.index.commit(f"Releasing {new_version}")
tag = repo.create_tag(new_version, ref="HEAD",
                      message=f"Releasing {new_version}")


# push
message = "The release is now committed and tagged but not pushed. In order to finish this release you need to push the commit and tag. Push ?"
printMessage = "Pushing..."
confirm(message, printMessage)

repo.remotes.origin.push(tag)

print("Please manually add the latest release notes, as soon as the build is successfully deployed")
