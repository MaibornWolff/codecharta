---
header:
  teaser: assets/images/showcase/httpd/httpd_2016-10-24vs2019-10-27[rloc,abs_code_churn].png
title: "httpd"
excerpt: "403 788 RLoC"

sidebar:
  - title: Source Code
    text: <a href="https://github.com/apache/httpd" download>Mirror on Github</a>
  - title: "Size"
    text: "403 788 RLoC"
  - title: "Highest Number of Authors"
    text: util.c<br/>proxy_util.c
  - title: "Most Edited File"
    text: "mod_md.c"
  - title: "Utilized Importers"
    text: Tokeiimporter<br/>ScmlogParser (Git)
gallery:
  - url: /assets/images/showcase/httpd/httpd_2019-10-27[rloc,abs_code_churn,weeks_with_commits].png
    image_path: assets/images/showcase/httpd/httpd_2019-10-27[rloc,abs_code_churn,weeks_with_commits].png
    title: "httpd Metrics 2019 for Rloc, abs_code_churn, weeks_with_commits"
  - url: /assets/images/showcase/httpd/httpd_2016-10-24vs2019-10-27[rloc,abs_code_churn].png
    image_path: assets/images/showcase/httpd/httpd_2016-10-24vs2019-10-27[rloc,abs_code_churn].png
    title: "httpd Metrics Delta between 2016 and 2019 for Rloc, abs_code_churn"
---

{% include gallery caption="Example Images for httpd." %}

<!--
I would have liked this link to be in the sidebar but liquid properties don't work there.
I would also have liked this to be a markdown link but then the browser tries to open it instead of "download"ing it.
 -->

<a href="{{site.baseurl}}/assets/ccjson/showcase/httpd/httpd_2019-10-26.cc.json" download>Download cc.json at 2019-10-26</a><br/>
<a href="{{site.baseurl}}/assets/ccjson/showcase/httpd/httpd_2016-10-24.cc.json" download>Download cc.json at 2016-10-24</a>
