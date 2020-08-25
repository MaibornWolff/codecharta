---
permalink: /docs/step-by-step/
title: "Step by Step Example"
---

Here we will explain an example to analyze a SonarQube Project and visualize it afterwards.

# Run local sonar analysis with a docker container (Mac)

-   `brew install sonar-scanner`
-   `docker run -d --name sonarqube -p 9000:9000 -p 9092:9092 sonarqube`
-   add a correct sonar-project.properties file to the target project
-   run `sonar-scanner` in the projects folder
-   you can now access your sonarqube instance and analysis on localhost:9000

# Analyze a sonarqube project

Choose a sonar analysed project of your choice and enter the file, url and project-id.
If necessary, generate a User Token in the sonar remote instance and include it in the following command:

> ./ccsh sonarimport [options][file]|[url][project-id]]

```markdown
Options:
-m, --metrics
Comma-separated list of metrics to import (defaults to all)
-o, --outputFile
Output File (or empty for stdout)
-u, --user
User Token for connecting to remote sonar instance
```

CodeCharta may ask for a user authentification, depending on the configuration of the projects SonarQube server.
Log in to your server, navigate to the project and create a user token. This string can be easily added as seen in the command description above.
If you don't have any own projects yet, you can test CodeCharta with any opensource project you can find on the sonarqube website.

The easiest example:

> ./ccsh sonarimport [sonar-server-url][project-id]

An output file has been created.

# Visualizing the analyzed project

Open the visualization directory and run the executable. A new window should open now.
You can also use the [web visualization]({{site.web_visualization_link}}).

-   In the top left corner, click on the folder icon.
-   Choose the generated `.cc.json` file from the previous step

Now you can see the analysis of the chosen project visualized in coloured blocks.

Navigation:

-   left click and drag -> rotate
-   right click and drag -> move the blocks
-   mousewheel -> zoom in and out
-   click on the view cube in the top right corner to change perspective quickly

Change the visualized content:

-   try hovering your mouse over wide, tall, red buildings
-   use the ribbon bar to change the metrics and explore if the same building is also bad from a different perspective
-   try searching for `*.ts`
-   then use the three dots to **hide** those, don't worry, we can restore the buildings
-   what buildings are left and do they have interesting metrics
-   click on the eye icon, then remove the `*.ts` query to restore all buildings
-   try excluding `**/ui/*` or `**/vendor/*`, is something interesting left now

![Image]({{site.baseurl}}/assets/images/docs/step-by-step/visualization.drawio.png)
