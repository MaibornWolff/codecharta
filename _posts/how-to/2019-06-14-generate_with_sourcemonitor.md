---
categories:
    - How-to
tags:
    - sourcemonitorimport
title: Generate a cc.json with SourceMonitor

gallery:
    - url: "/assets/images/posts/how-to/sourcemonitor/1.png"
      image_path: "/assets/images/posts/how-to/sourcemonitor/1.png"
      title: "Open SourceMonitor"
    - url: "/assets/images/posts/how-to/sourcemonitor/2.png"
      image_path: "/assets/images/posts/how-to/sourcemonitor/2.png"
      title: "Click File -> New Project"
    - url: "/assets/images/posts/how-to/sourcemonitor/3.png"
      image_path: "/assets/images/posts/how-to/sourcemonitor/3.png"
      title: "Select the programming language of the project you want to analyze. Click next."
    - url: "/assets/images/posts/how-to/sourcemonitor/4.png"
      image_path: "/assets/images/posts/how-to/sourcemonitor/4.png"
      title: "Enter a Project File Name. Click next."
    - url: "/assets/images/posts/how-to/sourcemonitor/5.png"
      image_path: "/assets/images/posts/how-to/sourcemonitor/5.png"
      title: "Select `Select Source Files by Extension`"
    - url: "/assets/images/posts/how-to/sourcemonitor/6.png"
      image_path: "/assets/images/posts/how-to/sourcemonitor/6.png"
      title: "Select the root of the project and check `All Subdirectories`"
    - url: "/assets/images/posts/how-to/sourcemonitor/7.png"
      image_path: "/assets/images/posts/how-to/sourcemonitor/7.png"
      title: "Check the options you want to use. Click next."
    - url: "/assets/images/posts/how-to/sourcemonitor/8.png"
      image_path: "/assets/images/posts/how-to/sourcemonitor/8.png"
      title: "Select `New SourceMonitor project format .smproj`. Check `Use this format when saving all projects` and press next."
    - url: "/assets/images/posts/how-to/sourcemonitor/9.png"
      image_path: "/assets/images/posts/how-to/sourcemonitor/9.png"
      title: "Check `Create First Project Checkpoint` and enter a Checkpoint Name. Press next. (A checkpoint refers to a specific code-analysis done)"
    - url: "/assets/images/posts/how-to/sourcemonitor/10.png"
      image_path: "/assets/images/posts/how-to/sourcemonitor/10.png"
      title: "Press Finish."
    - url: "/assets/images/posts/how-to/sourcemonitor/11.png"
      image_path: "/assets/images/posts/how-to/sourcemonitor/11.png"
      title: "Press Ok to run the code-analysis."
    - url: "/assets/images/posts/how-to/sourcemonitor/12.png"
      image_path: "/assets/images/posts/how-to/sourcemonitor/12.png"
      title: "Left-Click and select your checkpoint"
    - url: "/assets/images/posts/how-to/sourcemonitor/13.png"
      image_path: "/assets/images/posts/how-to/sourcemonitor/13.png"
      title: "Click File -> Export Checkpoint Details as CSV"
---

# Prequisites

-   Download and install [SourceMonitor](http://www.campwoodsw.com/sourcemonitor.html) on Windows
-   Download the [latest release](https://github.com/MaibornWolff/codecharta/releases) of codecharta-analysis

# Usage

The following screenshots show a possible analysis of [OpenOffice](https://github.com/apache/openoffice).

## How to generate a .csv from SourceMonitor

{% include gallery caption="Generate a .csv from SourceMonitor." %}

## How to generate a cc.json from a SourceMonitor .csv

Windows:

1. Open `CMD` on Windows
2. Navigate to the downloaded codecharta-analysis binaries `cd A_PATH\codecharta-analysis-VERSION\bin`
3. Run `ccsh.bat sourcemonitorimport PATH_TO_SOURCEMONITOR_CSV -p PROJECT_NAME -o PATH_TO_OUTPUTFILE`

Unix:

1. Open command line of your choice
2. Navigate to the downloaded codecharta-analysis binaries `cd A_PATH/codecharta-analysis-VERSION/bin`
3. Run `./ccsh sourcemonitorimport PATH_TO_SOURCEMONITOR_CSV -p PROJECT_NAME -o PATH_TO_OUTPUTFILE`

If you installed codecharta-analysis globally via npm, you can just run
<br>
`ccsh sourcemonitorimport PATH_TO_SOURCEMONITOR_CSV -p PROJECT_NAME -o PATH_TO_OUTPUTFILE`
