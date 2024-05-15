---
categories:
  - ADR
tags:
  - analysis
  - gradle
  - node
  - npm
title: "ADR 9: Decide Codecharta-Analysis npm execution"
---

For some time in the development of Codecharta-Analysis, besides the requirement for Java and Node, there was another hidden requirement for Windows only: bash.

Codecharta-Analysis is a Java project for which we use Gradle for its management. After the build process gradle generates a [script file](https://docs.gradle.org/current/dsl/org.gradle.jvm.application.tasks.CreateStartScripts.html) for all specified operating systems, in our case Unix and Windows, which allows an easy start of the jar file.

Since Analysis is distributed via the npm registry, an entry point must be specified in the `package.json`: `public/bin/ccsh`. For this file, npm then generates bin-links, inside the npm folder which is on the path of the OS, during the installation of a package which, according to the operating system, point to the executable file. Since you can only specify one entry point, for the Codecharta-Analysis-Shell (ccsh), it is the file `ccsh` which is supposed to be executed on Unix with the shebang `sh`. Now npm automatically creates the bin-links appropriate for this shebang and tries to call the application with named programm. Now there is no shell (sh.exe or bash.exe) natively on windows, which means that you can't just run `ccsh` on windows without installing a shell.

There are two approaches to solving this problem.

1. Develop a common entry point in JavaScript, which can then be executed under Node. This entry point would then call the correct Gradle start script according to the OS.
2. Customize the bin-links under Windows. Since npm does not provide any configuration options for this, copy modified original scripts and overwrite the automatically generated bin-links.

# Status

accepted 2.

# Decision

1. Use the npm `postinstall` lifecycle event to copy custom bin-links (ccsh.cmd, ccsh.ps1) on Windows overwritting the default links
2. Unix-based OS remain using the default bin-links
3. Common entry point was not suitable for the `ccsh`, because the interactive nature makes it difficult to spawn as a child process

# Consequences

- If npm ever decides to significantly change their folder structure the custom bin-links need to be adapted
- The use and the copying of the new bin-link scripts present two new potential error points that must be taken into account in new bug reports. So it must be controlled whether the scripts were copied correctly and if these were called correctly.
- It could happen that users who use highly customized npm environments encounter problems during the installation of codecharta-analysis if directory paths deviate too much from the default
