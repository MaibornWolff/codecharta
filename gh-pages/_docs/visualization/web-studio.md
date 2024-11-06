---
permalink: /docs/visualization/web-studio
title: "Web Studio"
excerpt: ""

toc: true
toc_sticky: true
toc_label: "Jump to Section"

gallery:
  - url: "/assets/images/docs/visualization/visualization.png"
    image_path: "/assets/images/docs/visualization/visualization.png"
    title: "Visualization"
---

Our Web Studio allows you to import metrics from the CCSH(CodeCharta shell) and visualize them.

> Please note that CodeCharta runs only on your client. No metrics that you analyze or visualize will ever leave your computer unless you distribute it yourself.

{% include gallery %}

# Online

You don't have to run our Web Studio yourself. Just use our [Web Studio](https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json.gz&file=codecharta_analysis.cc.json.gz&currentFilesAreSampleFiles=true&area=rloc&height=sonar_complexity&color=sonar_complexity) we are running on gh-pages.

# Run it locally

But then again, some people like to run their stuff locally.
You will need **Nodejs >= 20** to run it locally.

```bash
# Clone our code base
$ git clone https://github.com/MaibornWolff/codecharta.git
# Navigate into the visualization part
$ cd codecharta/visualization
# Install dependencies
$ npm i
# Start the dev server
$ npm run dev
```
