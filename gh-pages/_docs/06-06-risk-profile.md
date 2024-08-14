---
permalink: /docs/risk-profile/
title: "Risk profile"

gallery:
  - url: "/assets/images/docs/visualization/highlight-risk-profile.png"
    image_path: "/assets/images/docs/visualization/highlight-risk-profile.png"
    title: "Visualization"
---

{% include gallery %}

The Risk Profile gives a quick overview about the complexity and risk structure of the code base. It tells you how much
of the code is placed in files associated with low risk, medium risk, high risk and very-high risk in means of maintainability.
Furthermore, it allows to compare different projects.

The Risk profile button is the 'statistic' button in the menu bar. Pressing this button will open the risk profile panel (see below).
Here you will find the code percentages separated by their complexity.

![Risk Profile Example]({{site.baseurl}}/assets/images/docs/how-to/risk-profile-example.png)

For instance, this image shows an example risk profile for a code base.
53% of the source code lines is placed in low-risk files (green bar), 11% of the code is placed in medium risk files (yellow bar), 12% in high risk files (red bar) and 24% in very-high risk files (violet bar).
It is directly obvious that big parts of the code base are affected by bad maintainability.

The separation of code in risk classes like low or high complexity is based on Java reference metric values and therefore
may be inaccurate for other programming languages. The underlying approach is based on the work of [Alves et al](https://ieeexplore.ieee.org/abstract/document/5609747).
