module.exports = `<h1>Change Log</h1>
<p>All notable changes to this project will be documented in this file.</p>
<p>The format is based on <a href="http://keepachangelog.com/">Keep a Changelog</a>
and this project adheres to <a href="http://semver.org/">Semantic Versioning</a></p>
<h2>[unreleased] (Added 🚀 | Changed | Removed 🗑 | Fixed 🐞 | Chore 👨‍💻 👩‍💻)</h2>
<h3>Added 🚀</h3>
<ul>
<li>A changelog dialog with the latest additions to CodeCharta appears on version update (<a href="https://github.com/MaibornWolff/codecharta/pull/2342">#1315</a>)
<img src="https://user-images.githubusercontent.com/48621967/131360878-a8e1ef40-7f73-4de7-8b3f-4c8dc21448da.PNG" width="450px"/></li>
<li>Add documentation for SCMLogParserV2 (<a href="https://github.com/maibornwolff/codecharta/issues/1349">#1349</a>)</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Empty temporary label during hovering (<a href="https://github.com/maibornwolff/codecharta/issues/2328">#2328</a>)</li>
<li>Show the screenshot hotkey in the screenshot title (<a href="https://github.com/maibornwolff/codecharta/issues/2323">#2323</a>)</li>
<li>Improved rendering performance (<a href="https://github.com/MaibornWolff/codecharta/pull/2345">#2345</a>)</li>
</ul>
<h3>Chore 👨‍💻 👩‍💻</h3>
<ul>
<li>Update GH-Pages and visualization dependencies (<a href="https://github.com/maibornwolff/codecharta/issues/2356">#2356</a>)</li>
</ul>
<h2>[1.77.0] - 2021-07-30</h2>
<h3>Added 🚀</h3>
<ul>
<li>The "Color Metric Options" panel and "Legend" panel display the maximum value of the selected metric instead of infinite. (<a href="https://github.com/maibornwolff/codecharta/issues/1520">#1520</a>)</li>
<li>Mark color-section as unimportant in delta mode (<a href="https://github.com/maibornwolff/codecharta/issues/769">#769</a>)</li>
</ul>
<h3>Changed</h3>
<ul>
<li>
<p>Small ui improvements added. (<a href="https://github.com/MaibornWolff/codecharta/issues/1881">#1881</a>)</p>
</li>
<li>
<p>Numbers/Percentages always show in the distribution bar(<a href="https://github.com/MaibornWolff/codecharta/issues/1540">#1540</a>)</p>
<ul>
<li>Toggle between percentage and absolute numbers by clicking anywhere on the (expanded) distribution bar.</li>
<li>The old expanded distribution bar is now accessible through a button.</li>
</ul>
</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>It is no longer possible to exclude all files on the map (<a href="https://github.com/MaibornWolff/codecharta/issues/901">#901</a>)</li>
</ul>
<h2>[1.76.0] - 2021-07-13</h2>
<h3>Added 🚀</h3>
<ul>
<li>Custom metric scenarios which include the 'Color-Metric' (rloc) will now also save any changes made to the color scheme.</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Performance improvements when loading new files. (<a href="https://github.com/maibornwolff/codecharta/issues/1312">#1312</a>)</li>
</ul>
<h2>[1.75.0] - 2021-07-05</h2>
<h3>Added 🚀</h3>
<ul>
<li>
<p>Imported files are now compressed by default. Use the -nc parameter to uncompress the files. (<a href="https://github.com/maibornwolff/codecharta/issues/1702">#1702</a>)</p>
</li>
<li>
<p>Export the current view as a png image by using "Ctrl+Alt+S" or clicking the corresponding button (<a href="https://github.com/MaibornWolff/codecharta/issues/674">#674</a>)</p>
</li>
<li>
<p>Show only labels of buildings according to a chosen color (<a href="https://github.com/MaibornWolff/codecharta/issues/1347">#1347</a>)</p>
</li>
<li>
<p>New buttons to reset the color hex values and color metric thresholds separately (<a href="https://github.com/MaibornWolff/codecharta/issues/1613">#1613</a>)</p>
<img src="https://user-images.githubusercontent.com/50167165/121889295-5b071780-cd19-11eb-87ef-aba0ab0c6c09.png" width="350" alt="Updated menu">
</li>
</ul>
<h3>Changed</h3>
<ul>
<li>
<p>Metric aggregations now work as intended and are available from the sidebar when selecting folders (<a href="https://github.com/MaibornWolff/codecharta/issues/1953">#1953</a>)</p>
</li>
<li>
<p>Opening new files does no longer remove old ones.</p>
<img src="https://user-images.githubusercontent.com/50167165/123071234-c6856f00-d414-11eb-8326-e25f614e75d7.png" width="350">
<ul>
<li>Already loaded files can be individually removed.</li>
<li>The 'Multiple' view will select the latest files.</li>
</ul>
</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Numbers/Percentages are always shown on distribution bar.</li>
<li>Toggle between percentage and absolute numbers by clicking anywhere on the (expanded) distribution bar.</li>
<li>The old expanded distribution bar is
now accessible through a button.</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>It is now possible to rotate the map by rotating the view cube (<a href="https://github.com/MaibornWolff/codecharta/issues/353">#353</a>)</li>
</ul>
<h2>[1.74.0] - 2021-05-31</h2>
<h3>Added 🚀</h3>
<ul>
<li>SonarImport: SonarQube 8.8 support. Older versions are still supported.</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Only show labels for building included in the search</li>
<li>Color slider not initialized correctly (<a href="https://github.com/MaibornWolff/codecharta/issues/1592">#1592</a>)</li>
</ul>
<h2>[1.73.0] - 2021-05-10</h2>
<h3>Added 🚀</h3>
<ul>
<li>Improve descriptions (<a href="https://github.com/MaibornWolff/codecharta/issues/1879">#1879</a>)
<br></br>
<img src="https://user-images.githubusercontent.com/57844849/115393175-b2897b00-a1e1-11eb-8601-d2128f3469a3.png" alt="option dialog"></li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Excluding in delta mode is broken (<a href="https://github.com/MaibornWolff/codecharta/issues/1578">#1578</a>)
(Inclusion and exclusion of files using wildcard searches in the flatten and exclude operations)</li>
<li>Fix labels and lines missing a connection in some cases(<a href="https://github.com/MaibornWolff/codecharta/issues/1716">#1716</a>)</li>
<li>Ribbons resizing when expanding (<a href="https://github.com/MaibornWolff/codecharta/issues/1952">#1952</a>)</li>
</ul>
<h3>Chore 👨‍💻 👩‍💻</h3>
<ul>
<li>Fix breaking changes with newest three-js version(<a href="https://github.com/MaibornWolff/codecharta/issues/1877">#1877</a>)</li>
</ul>
<h2>[1.72.0] - 2021-04-22</h2>
<h3>Added 🚀</h3>
<ul>
<li>Hints for Global Settings (<a href="https://github.com/MaibornWolff/codecharta/issues/1715">#1715</a>)</li>
<li>Indicate total nodes and excluded / flattened nodes in file explorer (<a href="https://github.com/MaibornWolff/codecharta/issues/1880">#1880</a>)</li>
<li>Add path to node context menu (<a href="https://github.com/MaibornWolff/codecharta/issues/1667">#1667</a>)</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Made the header semi responsive (<a href="https://github.com/MaibornWolff/codecharta/issues/1037">#1037</a>)</li>
</ul>
<h2>[1.71.2] - 2021-03-16</h2>
<h3>Fixed 🐞</h3>
<ul>
<li>DevOps pipeline changes</li>
<li>Fixed web visualization in github</li>
</ul>
<h2>[1.71.1] - 2021-03-16</h2>
<h3>Fixed 🐞</h3>
<ul>
<li>DevOps pipeline changes</li>
</ul>
<h2>[1.71.0] - 2021-03-16</h2>
<h3>Changed</h3>
<ul>
<li>Disable unready AI function</li>
<li>Fix linter errors</li>
<li>Fix editorconfig</li>
</ul>
<h2>[1.70.2] - 2021-03-12</h2>
<h3>Fixed 🐞</h3>
<ul>
<li>DevOps pipeline changes</li>
<li>Project naming for Docker deployment</li>
</ul>
<h2>[1.70.1] - 2021-03-12</h2>
<h3>Fixed 🐞</h3>
<ul>
<li>DevOps pipeline changes</li>
</ul>
<h2>[1.70.0] - 2021-03-09</h2>
<h3>Changed</h3>
<ul>
<li>Render on demand (<a href="https://github.com/MaibornWolff/codecharta/issues/1728">#1728</a>)</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Memory leaks</li>
</ul>
<h2>[1.69.0] - 2021-02-23</h2>
<h3>Added 🚀</h3>
<ul>
<li>Added WebGL FXAA antialias &#x26; PixelRatio Options in order to achieve better resolution on high dpi displays(https://github.com/MaibornWolff/codecharta/pull/1551).</br></br>
<img src="https://user-images.githubusercontent.com/74670211/106582136-f4404900-6543-11eb-8f5b-5e1ec47457c7.png" alt="option dialog">
There are 4 available modes:
<ul>
<li><strong>standard mode</strong>: the pixel density is only applied to the small cube with standard browser aliasing</li>
<li><strong>pixel ratio without aliasing</strong>: no antialiasing is used</li>
<li><strong>pixel ration with FXAA</strong>: Nvidia FXAA antialiasing shader is used as an alisaing technique. this has better perfromance the standard browser aliasing aliasing</li>
<li><strong>pixel ration with MSAA</strong>: this is the best aliasing quality, slower then FXAA.</li>
</ul>
</li>
<li>Added GPU Stats (only in dev mode)</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Unfocus now respects the focus depth (<a href="https://github.com/MaibornWolff/codecharta/issues/1099">#1099</a>)</li>
<li>Track anonymous usage data also for older CodeCharta API versions and fix some minor bugs.</li>
</ul>
<h2>[1.68.0] - 2021-02-08</h2>
<h3>Added 🚀</h3>
<ul>
<li>A new experimental feature has been added to track anonymous metadata of a currently loaded map.
<ul>
<li>Neither the map name nor file names will be tracked but anonymous metric values and statistics like (average, min, max).</li>
<li>The tracked data will not be sent to a server yet. Instead, it can be downloaded as a json file in the Global Settings for now.</li>
<li>It is planned to send the anonymous data to a server in the future, so that we can collect tracking data automatically.</li>
<li><img src="https://user-images.githubusercontent.com/26900540/106896300-ac5f2480-66f1-11eb-8096-246d1733c0ee.png" alt="example of new feature"></li>
</ul>
</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Errors occurred in delta mode if names of root folders were different</li>
<li>Switching maps in delta mode now shows the differences between the maps (<a href="https://github.com/maibornwolff/codecharta/issues/1606">#1606</a>)</li>
<li>Label over hovered building not shown for height Metric value of zero (<a href="https://github.com/MaibornWolff/codecharta/issues/1623">#1623</a>)</li>
</ul>
<h3>Chore 👨‍💻 👩‍💻</h3>
<ul>
<li>CodeChartaStorage class has been introduced to dynamically store values either on disk (standalone version) or in the localStorage (web version). This is the first step to solve <a href="https://github.com/MaibornWolff/codecharta/issues/684">#684</a>.</li>
</ul>
<h2>[1.67.0] - 2021-01-26</h2>
<h3>Added 🚀</h3>
<ul>
<li>
<p>Allow opening files from local drive by double clicking on the buildings or clicking on their names (<a href="https://github.com/MaibornWolff/codecharta/issues/1314">#1314</a>)</p>
<ul>
<li>Only available in the standalone version!</li>
<li>files are opened in associated third-party applications</li>
<li>web-links are opened in a browser window</li>
</ul>
</li>
<li>
<p>Allow customized color in the node context menu (<a href="https://github.com/MaibornWolff/codecharta/issues/1556">#1556</a>).</p>
<p><a href="https://user-images.githubusercontent.com/3596742/104302048-a007f300-54c8-11eb-86c1-287483884783.png">!example of new feature #1556</a></p>
</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>fixed wrong max tree map visibility (<a href="https://github.com/MaibornWolff/codecharta/issues/1624">#1624</a>)</li>
<li>fixed incorrect label placement on delta maps that share no common nodes (<a href="https://github.com/MaibornWolff/codecharta/issues/1686">#1686</a>)</li>
</ul>
<h2>[1.66.0] - 2021-01-18</h2>
<h3>Added 🚀</h3>
<ul>
<li>Allow color of buildings to be customizable in the ribbon bar and in the legend. Colors of edges are now customizable as well (<a href="https://github.com/MaibornWolff/codecharta/issues/1533">#1533</a>)<br/><br/>
<img src="https://user-images.githubusercontent.com/3596742/103547861-3c1c7380-4ea5-11eb-8df2-541caf65b9df.png" alt="example of new feature"></li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Global settings not reverting to default ones (<a href="https://github.com/MaibornWolff/codecharta/issues/1632">#1632</a>)</li>
<li>Maximum treemap files shown in squarified node (<a href="https://github.com/MaibornWolff/codecharta/issues/1624">#1624</a>)</li>
<li>Wrong folder names and colors in legend when using the highlight folder feature (<a href="https://github.com/MaibornWolff/codecharta/issues/1555">#1555</a>)</li>
<li>Temporary labels are placed at the wrong height for scaled buildings (<a href="https://github.com/MaibornWolff/codecharta/issues/1618">#1618</a>)</li>
<li>Visible labels will disappear or placed lower for scaled buildings (<a href="https://github.com/MaibornWolff/codecharta/issues/1619">#1619</a>)</li>
<li>Unnecessary break line for secondary metrics (<a href="https://github.com/MaibornWolff/codecharta/issues/1093">#1093</a>)</li>
</ul>
<h2>[1.65.0] - 2020-12-23</h2>
<h3>Added 🚀</h3>
<ul>
<li>Highlight label while hovering over building, draw a temporary label for hovered buildings that have none (<a href="https://github.com/MaibornWolff/codecharta/issues/1529">#1529</a>)</li>
<li>Integrated streetlayout (<a href="https://github.com/MaibornWolff/codecharta/issues/904">#904</a>)
<img src="https://user-images.githubusercontent.com/63230711/78872405-87eed900-7a49-11ea-984a-c0ef738779b9.png" alt="cc_street_ccv">
In street layout file nodes are displayed as buildings and directories are displayed as streets. A street layout has the advantage of a more apparent directory structure and stable positioning of nodes after metric changes.
two different Street layout are integrated : - StreetLayout : as described above. - TMStreet : a combination of street layout and squarified layout.</li>
</ul>
<h3>Changed</h3>
<ul>
<li>The button to see excluded buildings is now merged into the flattened button. Excluded and flattened buildings can now be seen by opening the building with the eye slash icon (<a href="https://github.com/MaibornWolff/codecharta/issues/1543">#1543</a>)</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Height scaling not applied to buildings (<a href="https://github.com/MaibornWolff/codecharta/issues/1595">#1595</a>))</li>
<li>Fixed multiple label positioning/scaling bugs</li>
</ul>
<h3>Chore 👨‍💻 👩‍💻</h3>
<ul>
<li>e2e flaky test (<a href="https://github.com/MaibornWolff/codecharta/issues/1322">#1322</a>)</li>
</ul>
<h2>[1.64.0] - 2020-12-15</h2>
<h3>Added 🚀</h3>
<ul>
<li>
<p>Download and upload Custom Configurations is now possible (<a href="https://github.com/MaibornWolff/codecharta/issues/1472">#1472</a>)</p>
<ul>
<li>Open the Custom Configs menu in the toolbar on top of the map</li>
<li>Next to the <code>plus</code> Button you can see two new buttons: Upload and download.
<ul>
<li>Download: If you already have added Custom Configs you can download them by clicking the download button.
<ul>
<li>Custom Configs which are applicable for the currently selected map(s) will be downloaded as <code>.cc.config.json</code> files.</li>
</ul>
</li>
<li>Upload: Click the upload button and specify your Custom Config file (<code>&#x3C;file-name>.cc.config.json</code>)
<ul>
<li>Already existing Custom Configs will be skipped.</li>
<li>Different Custom Configs with same names will be renamed.</li>
<li>Another way to upload your Custom Configs is to upload a <code>.cc.json</code> file together with one or multiple <code>.cc.config.json</code> files using the default <code>Load .cc.json map</code> button in the upper left corner.</li>
</ul>
</li>
</ul>
</li>
<li>The Configs are stored to the local storage of your browser.
<ul>
<li>If a limit of <code>768KB</code> is exceeded you will see a warning when trying to add a new Custom Config.</li>
<li>You can click the displayed "download and purge" button to download/backup at least 6 months old Configs and then purge them from the local storage to make space for new ones.</li>
<li>If we cannot purge any Configs, you might have to do that by your own by deleting specific Configs manually.</li>
</ul>
</li>
</ul>
</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Increase possible margin size (<a href="https://github.com/MaibornWolff/codecharta/pull/1490">#1490</a>)
<ul>
<li>change displayed margin value from % to pixel</li>
<li>change dynamic margin value to a default margin value that should fit the map</li>
</ul>
</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Re-enabled color selection for folders and on hover (<a href="https://github.com/MaibornWolff/codecharta/pull/1544">#1544</a>)</li>
<li>Labels do not take delta height into account (<a href="https://github.com/MaibornWolff/codecharta/issues/1523">#1523</a>)</li>
<li>The calculation of the map resolution scale factor was wrong (<a href="https://github.com/MaibornWolff/codecharta/issues/1491">#1491</a>)
<ul>
<li>The factor is used to decrease the map resolution especially for big maps to avoid performance issues.</li>
<li>Now only the selected maps will be considered for the calculation. Unselected maps will be skipped.</li>
</ul>
</li>
</ul>
<h2>[1.63.0] - 2020-11-30</h2>
<h3>Added 🚀</h3>
<ul>
<li>Add the folder name onto the floor on the first 3 layers to get a better overview of the map (<a href="https://github.com/MaibornWolff/codecharta/issues/1491">#1491</a>)</li>
<li>UX Improvements related to labels allowing for user interaction #1404
<ul>
<li>Labels can be hovered, hovering their corresponding node</li>
<li>Selecting a label will select the corresponding node</li>
<li>Hovering a label will remove its transparency and move towards the user:
<ul>
<li>If other labels obstruct the hovered label it will move to the front</li>
</ul>
</li>
<li>Increased the transparency of other labels; this makes it easier to distinguish the hovered label</li>
<li>Increase the amount of labels to 250.</li>
</ul>
</li>
<li>Show file count of folders in Attribute-Side-Bar (<a href="https://github.com/MaibornWolff/codecharta/issues/1255">#1255</a>):
<img src="https://user-images.githubusercontent.com/3596742/100371884-be915800-3008-11eb-89f5-ed57c62680cc.png" alt="img showing file count of folder"></li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Buildings are flattened when delta is active #824.</li>
<li>Selected Building now stays highlighted when map is rotated #1498</li>
</ul>
<h2>[1.62.0] - 2020-11-12</h2>
<h3>Added 🚀</h3>
<ul>
<li>
<p>A new option in the Global Settings allows to enable/disable experimental features #1318</p>
<ul>
<li>Click on the settings button in the upper right corner to open the Global Settings dialog.</li>
<li>Activate/Deactivate the new option "Enable Experimental Features"</li>
<li>The features will be shown/hidden accordingly</li>
</ul>
</li>
<li>
<p>"CustomViews", the first experimental feature has been added #1318</p>
<ul>
<li>It must be enabled by activating the new option in the Global Settings dialog as mentioned before.</li>
<li>You can save your current map configurations to replay/restore them later.</li>
<li>A saved CustomView can only be applied for it's original map.</li>
<li>This will enable you to be more efficient in analizing projects by switching between different CustomViews.</li>
</ul>
</li>
<li>
<p>NodeContextMenu now contains option to keep buildings highlighted #1323</p>
</li>
<li>
<p>Fixed Folder algorithm supports nested (parent-child) Fixed Folders #1431</p>
<ol>
<li>Define children of a Fixed Folder also as Fixed Folders by adding the <code>fixedPosition</code> attribute manually in <code>.cc.json</code>.</li>
<li>All children of a parent Fixed Folder must be fixed.</li>
<li>Read the how-to guide for further information: https://maibornwolff.github.io/codecharta/how-to/fixate_folders_with_a_custom_cc_json/</li>
</ol>
</li>
</ul>
<h3>Changed</h3>
<ul>
<li>
<p>Improved search</p>
<ol>
<li>Not providing any star in the search bar from now on expects the input to
be a wildcard search. Thus, files are going to match paths that have
leading or following characters. E.g., <code>oo</code> is going to match
<code>/root/foobar</code>.</li>
<li>To use the explicit former search mode, wrap the search entry in quotes as
in: <code>"oo"</code>. This would only match filenames that are exactly <code>oo</code>.</li>
<li>The search field accepts multiple search entries at once, separated by
commata. <code>foo,bar</code> is going to search for both <code>*foo*</code> and <code>*bar*</code> and
marks all matched files accordingly.</li>
<li>It is possible to invert the search with a leading exclamation mark as in
<code>!foobar</code>. That will match any file that does not match <code>*foobar*</code>. It is
only possible to invert the complete input, not individual search entries.</li>
<li>Whitespace handling changed to ignore leading whitespace.</li>
</ol>
</li>
<li>
<p>Distribution metric #1188</p>
<ol>
<li>set rloc to default distribution metric, showing language percentages for real lines of code, if available. Else set to unary to show language distribution over files</li>
</ol>
</li>
<li>
<p>Improved file sorting in the file overview of the search bar</p>
<ul>
<li>Numbers are sorted naturally</li>
<li>Characters are compared with their base character (e.g., <code>a</code> is now next to <code>á</code>).</li>
</ul>
</li>
<li>
<p>Label metric not shown by default anymore</p>
</li>
</ul>
<h2>[1.61.0] - 2020-10-30</h2>
<h3>Changed</h3>
<ul>
<li>Disable highlighting buildings during map movement #1432</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>File tree/flattened/excluded overlay visualization is buggy #1269</li>
<li>EdgePreview on Map broken when selecting zero #1276</li>
</ul>
<h3>Chore 👨‍💻 👩‍💻</h3>
<ul>
<li>Schedules and merge retries of dependabot dependency updates changed</li>
</ul>
<h2>[1.60.2] - 2020-10-24</h2>
<h3>Fixed 🐞</h3>
<ul>
<li>Mouse cursor flickering #1170</li>
<li>Fix flipping map when clicking any option in the toolbar #1410</li>
<li>Fix edge metric not working correctly</li>
</ul>
<h2>[1.60.1] - 2020-10-20</h2>
<h3>Fixed 🐞</h3>
<ul>
<li>Issue with first start without an internet connection not working#1266</li>
<li>Issue with ribbon bar sizes for opened cards #1035</li>
</ul>
<h2>[1.60.0] - 2020-10-16</h2>
<h3>Added 🚀</h3>
<ul>
<li>Parsing feedback with progressbar and probable ETA for parsers and SonarImporter #847</li>
<li>Mark node names and make the names clickable for nodes that have a link to them #1313</li>
<li>Indicate the metric name next to a shown value in a new line on labels #1035</li>
<li>Checkboxes to display metric names and values and to display node names on labels #1035</li>
<li>Mark node names and make the names clickable for nodes that have a link to them #1313</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Label design #1035</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>First start without an internet connection of standalone not working #1266</li>
<li>Comparing a map in delta mode shows the correct differences</li>
<li>This mainly applies to maps compared with itself while it also fixes some other minor miscalculations</li>
<li>File extensions detection is improved</li>
<li>Zooming in and out the map will now close the node context menu #1324
<ul>
<li>Improved and simplified event handling in NodeContextMenu component</li>
</ul>
</li>
</ul>
<h3>Chore 👨‍💻 👩‍💻</h3>
<ul>
<li>Improved performance of multiple operations (e.g., delta mode).</li>
</ul>
<h2>[1.59.0] - 2020-10-09</h2>
<h3>Added 🚀</h3>
<ul>
<li>New EXPERIMENTAL SCMLogParser version</li>
<li>Improved performance around 300% when parsing CodeCharta</li>
<li>Improved memory usage</li>
<li>Fixed issue with old parser creating incorrect nodes in CodeCharta #871</li>
<li>ATTENTION: the parser is experimental, therefore some potential issues might remain, e.g. potentially an unhandled edge case when parsing node</li>
<li>To use the new parser a reversed git log is needed, as well as a git file list, refer to <code>ccsh scmlogparserv2 -h</code> for additional information</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Color-Metric slider is set and activated in the map accordingly to the released sliderbutton #1319</li>
<li>Deselcting a building will instantly dehighlight the buildings which were connected through edges #890</li>
</ul>
<h2>[1.58.1] - 2020-10-02</h2>
<h3>Fixed 🐞</h3>
<ul>
<li>Showing wrong edges when hovering a building after selecting one #1137</li>
</ul>
<h2>[1.58.0] - 2020-10-02</h2>
<h3>Added 🚀</h3>
<ul>
<li>Add active color metric to the top of the legend panel #1278</li>
<li>SourceCodeParser: Java 14 Support #1277</li>
</ul>
<h2>[1.57.4] - 2020-09-25</h2>
<h3>Fixed 🐞</h3>
<ul>
<li>Metric-Settings-Panels closed when clicking an option inside the panel #1258</li>
<li>Improve loading and rendering maps performance</li>
</ul>
<h2>[1.57.3] - 2020-09-18</h2>
<h3>Fixed 🐞</h3>
<ul>
<li>Improve overall performance for loading and rendering maps</li>
<li>Improve error messages when a file can't be loaded with the URL parameters</li>
</ul>
<h2>[1.57.2] - 2020-09-11</h2>
<h3>Fixed 🐞</h3>
<ul>
<li>New API version 1.2 not set correctly in analysis</li>
</ul>
<h2>[1.57.1] - 2020-09-11</h2>
<h3>Fixed 🐞</h3>
<ul>
<li>Validation of unique filenames not checking for the complete path and instead throwing an error on duplicate filename</li>
</ul>
<h2>[1.57.0] - 2020-09-11</h2>
<h3>Added 🚀</h3>
<ul>
<li><code>fixedPosition</code> as a new property in the <code>cc.json</code> that allows to fixate folders in the map</li>
</ul>
<h3>Changed</h3>
<ul>
<li><code>cc.json</code> version updated to <code>1.2</code></li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Compressed \`cc.jsons (.gz) not marked as accepted when selecting a file in the file chooser</li>
</ul>
<h3>Docs 🔎</h3>
<ul>
<li><a href="https://maibornwolff.github.io//codecharta/how-to/fixate_folders_with_a_custom_cc_json/">How-To: Fixate Folders in the <code>cc.json</code></a></li>
<li>CC-Json-API changes</li>
</ul>
<h2>[1.56.0] - 2020-09-04</h2>
<h3>Fixed 🐞</h3>
<ul>
<li>Improve performance when switching to multiple or delta mode when edges are available</li>
<li>Scenario with EdgeMetric is only appliable when EdgeMetric is existing for the Map #1201</li>
<li>Starting standalone version results in infinite loading loop #1202</li>
<li>Expanded metric selection will close when clicking anywhere outside of that selection #1036</li>
</ul>
<h2>[1.55.0] - 2020-08-28</h2>
<h3>Added 🚀</h3>
<ul>
<li>Cursor indicator for different mouse actions #1042</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Edge-Metrics sorted by name now instead of number of incoming and outgoing edges</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Number of incoming and outgoing edges not visible when hovering over a node #1095</li>
<li>Highlighting buildings in multiple mode now works #956</li>
</ul>
<h2>[1.54.0] - 2020-08-21</h2>
<h3>Added 🚀</h3>
<ul>
<li>Opening NodeContextMenu in the tree-view marks the node until it is closed #1068</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Missing Sonarcloud metrics in demo</li>
</ul>
<h3>Docs 🔎</h3>
<ul>
<li>Added note how to fix missing <code>sh</code> command issue when running integration tests on Windows</li>
</ul>
<h2>[1.53.0] - 2020-08-14</h2>
<h3>Changed</h3>
<ul>
<li>NodeContextMenu will show up when releasing the right-mouse-button now #1027</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>NodeContextMenu showing up after moving the mouse while holding right-mouse-button #1027</li>
</ul>
<h2>[1.52.0] - 2020-08-07</h2>
<h3>Added 🚀</h3>
<ul>
<li>Support for Tokei 12 new JSON schema #1103</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Rename master branch to main for a more inclusive naming #1117</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>After loading an invalid file the filechooser pops up again, so that the user can choose a valid file #1021</li>
<li>Quality gates on sonarcloud.io are red #879</li>
</ul>
<h3>Docs 🔎</h3>
<ul>
<li>Moved developer guides to our <a href="https://maibornwolff.github.io/codecharta/">gh-pages</a> #986</li>
</ul>
<h2>[1.51.0] - 2020-07-24</h2>
<h3>Added 🚀</h3>
<ul>
<li>File chooser now accept ".json" files only to avoid accidentally loading incorrect files #1094</li>
<li>Lots of tooltips #1030</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Blacklisting a building would sometimes not update the map #1098</li>
<li>Changes made after opening the filechooser and closing it won't be applied #875</li>
<li>Edge metric list not always updated correctly when loading a new file #1106</li>
</ul>
<h2>[1.50.0] - 2020-07-10</h2>
<h3>Added 🚀</h3>
<ul>
<li>Line between scenario indicator and remove button #1069</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Reduced transition time when opening or collapsing parts of the ribbon bar #1043</li>
<li>Search Panel will open now when clicking in the search field and collapse when clicking somewhere else #1071</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Opening the same file again will now reload the file and reset the application #1032</li>
<li>Improve render performance by persisting color conversions #1034</li>
<li>Sorting in tree-view not being applied #1040</li>
</ul>
<h2>[1.49.1] - 2020-07-03</h2>
<h3>Fixed 🐞</h3>
<ul>
<li>Improved performance significantly when switching between single, multiple and delta</li>
<li>Color-Range-Slider sometimes misbehaved when loading a new map or excluding buildings #926</li>
</ul>
<h2>[1.49.0] - 2020-06-19</h2>
<h3>Added 🚀</h3>
<ul>
<li>Custom scenarios can be created and saved through the scenario menu #675</li>
<li>Importer and parser documentation can now be found on the github Website #954</li>
<li>Output of sourcemonitor can now be compressed with the compression flag</li>
</ul>
<h3>Chore 👨‍💻 👩‍💻</h3>
<ul>
<li>[Security] Bump angular from 1.7.9 to 1.8.0 in /visualization #995</li>
</ul>
<h2>[1.48.0] - 2020-06-12</h2>
<h3>Added 🚀</h3>
<ul>
<li>Support of compressed cc.json files. Files can be compressed in the analysis #848</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Improved performance of several importers #846</li>
</ul>
<h2>[1.47.1] - 2020-05-08</h2>
<h3>Fixed 🐞</h3>
<ul>
<li>Attribute-Side-Bar being invisible</li>
</ul>
<h2>[1.47.0] - 2020-05-02</h2>
<h3>Added 🚀</h3>
<ul>
<li>When hovering over a folder, all buildings inside it will be highlighted as well #694</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Rename the button Show-Complete-Map button to Unfocus #642</li>
<li>Move the Unfocus button (visible when right-clicking a focused node) to the node-context-menu #948</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Generating a delta map with merged empty folders in between is now working correctly #730</li>
<li>Reduced time when opening a new file #932</li>
</ul>
<h3>Chore 👨‍💻 👩‍💻</h3>
<ul>
<li>[Security] Bump jquery from 3.4.0 to 3.5.0 in /visualization #944</li>
</ul>
<h2>[1.46.1] - 2020-04-24</h2>
<h3>Added 🚀</h3>
<ul>
<li>Error dialogs in case of validation or api version issues #610</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Improved overall rendering performance of larger maps by roughly 40% #836</li>
</ul>
<h2>[1.45.5] - 2020-04-17</h2>
<h3>Added 🚀</h3>
<ul>
<li>Median symbol for aggregated relative metrics #365</li>
<li>AttributeTypes for tokeiImporter and SCMLogParser #365</li>
<li>Ellipsis button in TreeView list when hovering a node to access context menu #780</li>
<li>Show gray eye-icon next to the ellipsis-button to indicate a flattened node #780</li>
<li>Attribute Type selector in the metric dropdowns for edges and nodes</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Metrics with AttributeType relative are now aggregated using the median #365</li>
<li>Showing absolute number of files instead of relative number when hovering list item in TreeView #780</li>
<li>Clicking a hovered list item inside the TreeView opens folders #780</li>
<li>Color node name in gray when flattened #780</li>
</ul>
<h3>Removed 🗑</h3>
<ul>
<li>Eye-icon in TreeView list to flatten a node #780</li>
<li>Option to focus a node when clicking the node name inside the TreeView #780</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Consistency of AttributeTypes representation #365</li>
<li>Wrong file description for tokeiimporter</li>
<li>Improved search performance #837</li>
</ul>
<h2>[1.44.0] - 2020-03-27</h2>
<h3>Added 🚀</h3>
<ul>
<li>Dialog to select between different sorting options #388</li>
<li>Button to reverse the current selected sorting #388</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Show file selection in toolBar after excluding or hiding a node instead of an empty toolBar #896</li>
</ul>
<h2>[1.43.0] - 2020-03-20</h2>
<h3>Changed</h3>
<ul>
<li>Selectable metrics will only contain metrics from the visible maps</li>
<li>Closing the attribute-side-bar by clicking somewhere in the map will now be triggered on mouse up instead of mouse down</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Search-panel opening for a short duration when importing a new file</li>
</ul>
<h3>Chore 👨‍💻 👩‍💻</h3>
<ul>
<li>Fix vulnerability with nokogiri &#x3C;1.10.8</li>
</ul>
<h2>[1.42.3] - 2020-03-13</h2>
<h3>Fixed 🐞</h3>
<ul>
<li>Loading Gif not displayed when preparing to render a new map #857</li>
<li>Selecting zero files in Multiple mode will not trigger the 3D CodeMap creation</li>
<li>Metrics in the dropdown menu now show the correct max value for the visible maps #876</li>
</ul>
<h2>[1.42.2] - 2020-02-14</h2>
<h3>Fixed 🐞</h3>
<ul>
<li>Replaced non standard <code>[[</code> in sh scripts #849</li>
<li>Improved performance for loading a new file #836</li>
<li>Marked Packages are loaded from files #798</li>
</ul>
<h2>[1.42.1] - 2020-02-07</h2>
<h3>Fixed 🐞</h3>
<ul>
<li>GC Overhead Limit (OutOfMemory Exception) during analysis of large SCMLogs fixed #845</li>
</ul>
<h2>[1.42.0] - 2020-01-31</h2>
<h3>Added 🚀</h3>
<ul>
<li>Support for camel and kebab-case for ccsh arguments #772</li>
<li>RawTextParser for analysis #660</li>
<li>IndentationLevel as metric for RawTextParser #660</li>
<li>Show additional Pairing Rate of Selected Building, simultaneously to the currently hovered Buildings #736</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Options of the ccsh are now consistently in kebab-case #772</li>
</ul>
<h3>Fixed 🐞</h3>
<ul>
<li>Path prefix handling in tokeiimporter #841</li>
</ul>
<h2>[1.41.8] - 2020-01-17</h2>
<h3>Removed 🗑</h3>
<ul>
<li>Project name parameters in the ccsh #773</li>
</ul>
<h2>[1.41.6] - 2020-01-10</h2>
<h3>Fixed 🐞</h3>
<ul>
<li>Deployment</li>
</ul>
<h2>[1.41.1] - 2020-01-10</h2>
<h3>Fixed 🐞</h3>
<ul>
<li>Performance of loading maps with edges improved #823</li>
<li>Calculation of other Group for fileExtensionBar #768</li>
<li>Remove focus of UI elements when they are not visible anymore</li>
</ul>
<h2>[1.41.0] - 2019-12-06</h2>
<h3>Added 🚀</h3>
<ul>
<li>Show the relative number of files a folder includes compared to the project in the TreeView #380</li>
<li>Show the number of files a folder includes in the TreeView when hovering #380</li>
<li>When the File Extension Bar is hovered, all buildings corresponding to that extension are highlighted #545</li>
<li>Toggle between percentage and absolute values when clicking the file extension details section #545</li>
<li>Sum hovered delta values for folders #781</li>
</ul>
<h2>[1.40.0] - 2019-11-22</h2>
<h3>Changed</h3>
<ul>
<li>Replaced Blacklist Hide with Flatten option #691</li>
<li>Flattened buildings are not hidden by default #691</li>
</ul>
<h3>Chore 👨‍💻 👩‍💻</h3>
<ul>
<li>Bump @types/three from 0.89.12 to 0.103.2 in /visualization #453</li>
<li>Bump angularjs-slider from 6.5.1 to 7.0.0 in /visualization #454</li>
<li>Bump webpack from 3.12.0 to 4.41.2 in /visualization #436</li>
<li>[Security] Bump angular from 1.7.7 to 1.7.9 in /visualization #800</li>
</ul>
<h2>[1.39.0] - 2019-11-15</h2>
<h3>Added</h3>
<ul>
<li>Progress indicator for SonarImporter #544</li>
</ul>
<h3>Changed</h3>
<ul>
<li>New style for hovered metric values #696</li>
<li>Redesigned slider labels in ribbonBar sections #696</li>
<li>Shortened ribbonBar sections #696</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Missing pictures and broken links in docs #785</li>
<li>SCMLogParser is now more resilient to unusual SVN commit messages #763</li>
</ul>
<h2>[1.38.1] - 2019-11-13</h2>
<h3>Added</h3>
<ul>
<li>New github-pages https://maibornwolff.github.io/codecharta/</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Sum symbol for hovered metric values only shows for folders #775</li>
</ul>
<h2>[1.38.0] - 2019-11-08</h2>
<h3>Added</h3>
<ul>
<li>Temporal coupling edges generated by SCMLogParser #622</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Downloaded files are no longer formatted #679</li>
<li>Added highly and median coupled files metrics to non-churn metric list of SCMLogParser #622</li>
<li>Moved nodePathPanel to toolBar and updated style #607</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Removed attributes from downloaded files that should not be there #679</li>
</ul>
<h2>[1.37.0] - 2019-10-25</h2>
<h3>Added</h3>
<ul>
<li>Sidebar with information regarding the selected building #527</li>
<li>Sidebar closes when selected buildings is excluded #748</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Animation to show or hide the legend panel #527</li>
</ul>
<h3>Removed</h3>
<ul>
<li>Expandable detail panel in lower left corner #527</li>
<li>Removed option to maximize/minimize detail panel #527</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Autofocus and label size for focused nodes #747</li>
<li>Selected buildings stays selected when settings are changed #748</li>
<li>IllegalStateException when scanning single file in SourceCodeParser #573</li>
<li>SourceCodeParser places files in the project root correctly into the hierarchy #574</li>
</ul>
<h2>[1.36.0] - 2019-10-18</h2>
<h3>Changed</h3>
<ul>
<li>Open and close the ribbonBar sections independently with an updated animation</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Camera is now resetted correctly, when unfocusing #634</li>
<li>Inputs of Color Range Slider now waits a second before it commits its values #676</li>
<li>Fixed root folder name in TreeView after new map after loading new map #649</li>
<li>Increased size of ribbonBar for big screens #644</li>
<li>File-Extension-Bar will not display excluded nodes anymore #725</li>
<li>Sanitize input for shelljs #600</li>
</ul>
<h3>Chore</h3>
<ul>
<li>Bump jacoco from 0.8.1 to 0.8.4 in /analysis</li>
</ul>
<h2>[1.35.0] - 2019-10-04</h2>
<h3>Added</h3>
<ul>
<li>Checkbox in global Settings for disabling camera reset, when new map is loaded #685</li>
<li>Pipe support for SourceCodeParser #716</li>
<li>Pipe support for SCMLogParser #717</li>
<li>Pipe support for SonarImporter #715</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Exclude and Hide options are disabled for empty and already existing search patterns #654</li>
</ul>
<h2>[1.34.0] - 2019-09-20</h2>
<h3>Added</h3>
<ul>
<li>Tokei Importer #538</li>
<li>Prominent Notice that we use Sonar-jar #713</li>
</ul>
<h3>Chore</h3>
<ul>
<li>Bump kotlin-reflect from 1.3.41 to 1.3.50 in /analysis</li>
<li>Bump json from 20180813 to 20190722 in /analysis</li>
<li>Bump rxjava from 2.2.9 to 2.2.12 in /analysis</li>
<li>Bump assertj-core from 3.12.2 to 3.13.2 in /analysis</li>
<li>Bump sonar-java-plugin from 5.12.1.17771 to 5.14.0.18788 in /analysis</li>
</ul>
<h2>[1.33.0] - 2019-09-10</h2>
<h3>Added</h3>
<ul>
<li>Edge Previews (Palm-Tree-Effect) #529</li>
<li>Dropdown to select Edge Metric, including Edge Counter #529</li>
<li>Edge Metric settings for Edge Height, Number of Previews &#x26; show only building with Edges #529</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Edge Visualization to better distinguish between incoming and outgoing edges #529</li>
<li>Distribution metric is by default the same as area metric #689</li>
<li>MapTreeView below searchBar opens the first level by default #690</li>
<li>Focus metric search when opening metricChooser #693</li>
</ul>
<h3>Removed</h3>
<ul>
<li>Edge Options in Context menu #529</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>SourceCodeParser now skips custom metrics for files, if the syntax tree cannot be created</li>
<li>Nodes with color metric equals 0 are colored correct again #677</li>
</ul>
<h3>Chore</h3>
<ul>
<li>[Security] Bump mixin-deep from 1.3.1 to 1.3.2 in /visualization</li>
</ul>
<h2>[1.32.0] - 2019-08-09</h2>
<h3>Added</h3>
<ul>
<li>Search for metrics and an indicator for the highest value in dropdown #575</li>
<li>Button to enable PresentationMode that uses Flashlight-Hovering #576</li>
<li>Clarifying information which file is which in the file bar when in delta mode #615</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Replaced Scenario dropdown with button on the left of the metric sections #628</li>
</ul>
<h2>[1.31.0] - 2019-08-02</h2>
<h3>Added</h3>
<ul>
<li>New Metric in SourceCodeParser: Maximum-Nesting-Level #659</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Label hight adjustment now matches scaling of map #594</li>
<li>SCMLogParser now guesses the input file encoding #614</li>
</ul>
<h2>[1.30.0] - 2019-07-26</h2>
<h3>Added</h3>
<ul>
<li>New Search Bar #526</li>
<li>Number of Renames Metric to SCMLogParser #621</li>
<li>Age In Weeks Metric for SCMLogParser #620</li>
</ul>
<h3>Changed</h3>
<ul>
<li>ToolBar now shows partially cut-off controls if the window is too small #582</li>
<li>Position of the legendPanel was moved to the bottom-right corner #633</li>
<li>RibbonBar only opens the three metric section</li>
<li>Moved Scenario-select to the right in order to use less space</li>
<li>Moved loading-gif from ribbonBar to toolBar</li>
</ul>
<h3>Removed</h3>
<ul>
<li>RibbonBar toggle button</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>FileExtensionBar height to not show a bottom-margin in Chrome</li>
<li>PointerEvents not being propagated when RibbonBar was extended</li>
<li>Reduced memory usage of SCMLogParser to avoid OutOfMemory Exception #631</li>
</ul>
<h3>Chore</h3>
<ul>
<li>[Security] Bump lodash.mergewith from 4.6.1 to 4.6.2 in /visualization</li>
<li>[Security] Bump lodash from 4.17.11 to 4.17.13 in /visualization</li>
<li>[Security] Bump fstream from 1.0.11 to 1.0.12 in /visualization</li>
</ul>
<h2>[1.29.0] - 2019-07-12</h2>
<h3>Changed</h3>
<ul>
<li>Moved Button to reset the map to the center next to the view-cube #606</li>
<li>Moved FileExtensionBar #527</li>
</ul>
<h3>Removed</h3>
<ul>
<li>Burger Menu / SideNav #526</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Colors in File-Extension-Bar will be displayed in MS Edge and Standlone now #584</li>
</ul>
<h2>[1.28.0] - 2019-06-28</h2>
<h3>Added</h3>
<ul>
<li>Releasing will now remind the developer to manually add the release notes #533</li>
<li>StructureModifier to remove and move nodes and set root of projects #547 / #181</li>
</ul>
<h3>Changed</h3>
<ul>
<li>More informative log messages regarding the success of project merging #547</li>
</ul>
<h3>Removed</h3>
<ul>
<li>Release Notes are not generated and added automatically to a release #533</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Margin will now be set correctly depending on whether dynamicMargin is enabled or not #602</li>
</ul>
<h2>[1.27.0] - 2019-06-25</h2>
<h3>Added</h3>
<ul>
<li>Automatically generates release notes from changelog and appends it to release #533</li>
<li>Adds global settings-menu with settings from options panel and weblinks #528</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Moved File Settings from Ribbon Bar to new File Setting Bar #525</li>
<li>Rename sample file codemap-nodes #587</li>
<li>Hide checkbox to select white-positive-buildings in delta state #345</li>
</ul>
<h3>Removed</h3>
<ul>
<li>Removes Options panel from sidebar #528</li>
<li>Removes Weblinks panel from sidebar #528</li>
<li>Removed URL-parameter info from sidebar #525</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Unary Metric will no longer be auto-selected when a new map is loaded #579</li>
</ul>
<h2>[1.26.0] - 2019-06-14</h2>
<h3>Added</h3>
<ul>
<li>FileExtensionBar to show file-distribution of chosen metric #495</li>
<li>sum icon is now displayed on the left of the metric value #364</li>
<li>Added Pop-up dialog before downloading file to set filename and see what data will be stored #523</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Fix set default ColorRange when resetting color section #560</li>
</ul>
<h2>[1.25.1] - 2019-05-30</h2>
<h3>Added</h3>
<ul>
<li>SVN log parser keeps track of renaming of files for metric calculation #542</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Entries with renaming information in SVN logs are attributed to correct file #542</li>
<li>Unary metric will no longer be removed from the MetricChooser-Dropdown when a folder was excluded or hidden #548</li>
<li>Changing margin and then file or mode will no longer freeze the application #524</li>
</ul>
<h3>Chore</h3>
<ul>
<li>[Security] Bump tar from 2.2.1 to 2.2.2 in /visualization</li>
</ul>
<h2>[1.25.0] - 2019-05-17</h2>
<h3>Added</h3>
<ul>
<li>Added SonarJava to Source code parser #343</li>
<li>Added exclude and defaultExclude options to SourceCodeParser #508</li>
<li>Show loading-gif in ribbonBar when rerendering map</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Using Sonar Plugins for Source code parser, giving the Sonar Metrics #343</li>
<li>Use debounced settings update instead of throttled</li>
<li>Filename of downloaded file now contains time #484</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Fixed issue with too long line in ccsh.bat #506</li>
<li>Prevent downloaded files from having multiple Timestamps #484</li>
<li>Do not show loadingGif when cancelling the fileChooser #498</li>
<li>Excluding a building now updates the maximum value of colorRange #355</li>
</ul>
<h3>Chore</h3>
<ul>
<li>Bump angular-material from 1.1.9 to 1.1.14 in /visualization</li>
<li>[Security] Bump jquery from 3.3.1 to 3.4.0 in /visualization</li>
</ul>
<h2>[1.24.0] - 2019-04-23</h2>
<h3>Removed</h3>
<ul>
<li>Settings as URL parameters #470</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Fixed issue with trailing slash in URL parameter of SonarImporter #356</li>
</ul>
<h3>Chore</h3>
<ul>
<li>Bump d3 from 4.13.0 to 5.9.2 in /visualization</li>
<li>Bump sinon from 4.5.0 to 7.3.1 in /visualization</li>
</ul>
<h2>[1.23.0] - 2019-03-22</h2>
<h3>Added</h3>
<ul>
<li>Project Name can be specified for merge filter #394</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Throw a MergeException if project names do not match in MergeFilter #394</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Excluded buildings are no longer used for aggregated metric calculation #352</li>
</ul>
<h3>Chore</h3>
<ul>
<li>Bump browser-sync-webpack-plugin from 1.2.0 to 2.2.2 in /visualization</li>
<li>Bump @types/node from 8.10.19 to 11.11.3 in /visualization</li>
<li>Bump html-webpack-plugin from 2.30.1 to 3.2.0 in /visualization</li>
<li>Bump load-grunt-tasks from 3.5.2 to 4.0.0 in /visualization #444</li>
<li>Bump ajv from 5.5.2 to 6.10.0 in /visualization #447</li>
<li>Bump resolve-url-loader from 2.3.0 to 3.0.1 in /visualization #448</li>
</ul>
<h2>[1.22.0] - 2019-03-15</h2>
<h3>Added</h3>
<ul>
<li>Added buttons to select all/none/inversion of revisions/maps in multiple mode #391</li>
<li>Merge filter can merge all files of folders #392</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Fixed bug that code map was not re-loaded when changing from multiple to single revision mode #396</li>
<li>Fixed missing apiVersion in aggregated map #398</li>
<li>Input Fields of color sliders adjust width according to content #409</li>
</ul>
<h3>Chore</h3>
<ul>
<li>Bump nouislider from 11.1.0 to 13.1.1 in /visualization</li>
<li>Bump typescript from 2.7.2 to 3.3.3333 in /visualization</li>
<li>Bump @types/d3 from 4.13.0 to 5.7.1 in /visualization</li>
</ul>
<h2>[1.21.2] - 2019-02-26</h2>
<h3>Added</h3>
<ul>
<li>When entering Multiple Mode, all Maps/revisions are preselected</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Fixing non-existent metric aggregation on root-level when using multiple Files</li>
</ul>
<h2>[1.21.1] - 2019-02-22</h2>
<h3>Added</h3>
<ul>
<li>Hovering a node in the map also hovers it in the tree view #351</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Fixing sync between treeview hovering and map hovering #351</li>
<li>Folders can no longer be colored in the CodeMap or TreeView #359</li>
</ul>
<h2>[1.21.0] - 2019-02-16</h2>
<h3>Added</h3>
<ul>
<li>Color searched node names green in TreeView #225</li>
<li>Add option buttons (three dots) in TreeViewSearch to <code>Hide</code> or <code>Exclude</code> matching nodes #298</li>
<li>Show blacklist entry counter in blacklistPanel header #298</li>
<li>Option checkbox 'Hide Flattened Buildings' #225</li>
<li>Hide/Flatten non-searched buildings #225</li>
<li>Hide/Flatten all buildings, if searchPattern can't find any matching nodes #225</li>
<li>Show maxValue of each metric in metricChooser select list #204</li>
<li>Colored color-slider inside the RibbonBar #318</li>
<li>Option to color positive buildings white #311</li>
<li>Clicking the ribbonBar section-titles toggles the ribbonBar #324</li>
<li>View-Cube displayed in top right corner #274</li>
<li>Adding prettier formatter</li>
<li>Adapt colorRange when changing colorMetric #330</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Update TreeView filter with search field #225</li>
<li>Use 'gitignore' style matching in TreeViewSearch #225</li>
<li>Reorder <code>Focus</code>, <code>Hide</code> and <code>Exclude</code> buttons in nodeContextMenu #298</li>
<li>Reorder sidebarPanels (BlacklistPanel beneath TreeViewSearchPanel) #298</li>
<li>Use <code>fa-ban</code>-icon as symbols for blacklistPanel (instead of <code>fa-list</code>) #298</li>
<li>Use <code>fa-ban</code>-icon as symbols for blacklistType <code>Exclude</code> (instead of <code>fa-times</code>) #298</li>
<li>Label size keeps readable for large maps or a high distance between camera and map #237</li>
<li>updated dependencies to fix vulnerabilities</li>
<li>Scenarios only update settings which exist in Scenario and not all #224</li>
<li>MergeFilter to merge unique blacklist entries #275</li>
<li>MergeFilter to only merge unique attributeType entries #275</li>
</ul>
<h3>Removed</h3>
<ul>
<li>Remove invertHeight checkbox in delta-view #306</li>
<li>Remove option to add blacklist entries from inside the blacklistPanel #298</li>
<li>Remove statistic functions in Experimental panel #308</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>CodeMap does not move anymore when navigating in text-fields #307</li>
<li>Merge blacklist in multipleFile view and convert paths #275</li>
<li>Show logo in NW.js standalone application #233</li>
</ul>
<h2>[1.20.1] - 2018-12-19</h2>
<p>Fixed release issues.</p>
<h2>[1.20.0] - 2018-12-19</h2>
<h3>Added</h3>
<ul>
<li>button to unfocus node</li>
<li>NodeContextMenu: Option to only hide dependent edges</li>
<li>plop support</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Renaming 'isolate node' to 'focus node'</li>
<li>Focusing a node does not remove the blacklist items of type Hide</li>
</ul>
<h3>Removed</h3>
<ul>
<li>NodeContextMenu: Option to 'show all' nodes, which used to unhide all nodes</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Reshow hidden nodes from Treeview or Blacklist</li>
</ul>
<h2>[1.19.0] - 2018-11-02</h2>
<h3>Added</h3>
<ul>
<li>Deleted files in delta view use their previous area value in order to be visible #254</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Buildings in the delta view are not colored correctly #253</li>
<li>Reset Button in RibbonBar to reset 'Invert Colors' #255</li>
<li>Remove lag of 'Invert Color' checkboxes, when selecting single/delta mode #255</li>
</ul>
<h2>[1.18.1] - 2018-10-31</h2>
<p>Fixed release issues</p>
<h2>[1.18.0] - 2018-10-29</h2>
<h3>Added</h3>
<ul>
<li>Integration with Jasome through JasomeImporter #245</li>
<li>URL parameter 'mode' with the values Single, Multiple or Delta</li>
<li>Blacklist to persist excluded or hidden nodes #205</li>
<li>Option to exclude nodes in nodeContextMenu #205</li>
<li>BlacklistPanel in SettingsSidebar to manage blacklist #205</li>
<li>Save-Button to download current CodeMap #205</li>
<li>Publishing visualization on Docker Hub #252</li>
</ul>
<h3>Changed</h3>
<ul>
<li>No longer fat jar of every subcomponent of analysis, baked into ccsh</li>
<li>Changed simple syserr write to logger call for analysis #243</li>
</ul>
<h3>Removed</h3>
<ul>
<li>URL parameter 'delta' does not exist anymore</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Show delta of CodeMap when URL parameter mode=delta is set</li>
</ul>
<h2>[1.17.0] - 2018-09-28</h2>
<h3>Changed</h3>
<ul>
<li>Invert delta colors moved from color to heigh metric column in ribbon bar #220</li>
<li>Delta value now as kindOfMap shown #220</li>
<li>Aggreate maps as multiple rename #220</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Single/delta buttons now correctly activated when delta in ulr shown #220</li>
</ul>
<h2>[1.17.0] - 2018-09-21</h2>
<h3>Added</h3>
<ul>
<li>CodeMaatImport for temporal coupling dependencies #172</li>
<li>EdgeFilter to aggregate edge-attributes as node-attributes #222</li>
<li>Option to show and hide dependent edges from node-context-menu #218</li>
</ul>
<h3>Changed</h3>
<ul>
<li>MergeFilter merges edges #172</li>
</ul>
<h2>[1.16.2] - 2018-09-10</h2>
<h3>Fixed</h3>
<ul>
<li>missing event in firefox #232</li>
</ul>
<h2>[1.16.1] - 2018-08-31</h2>
<h3>Added</h3>
<ul>
<li>gitlab + dotnet manual</li>
</ul>
<h2>[1.16.0] - 2018-08-31</h2>
<h3>Added</h3>
<ul>
<li>add the option to add multiple files via url parameter (e.g. ?file=a&#x26;file=b...)</li>
</ul>
<h2>[1.15.1] - 2018-08-13</h2>
<p>Fixed release issues</p>
<h2>[1.15.0] - 2018-08-13</h2>
<h3>Added</h3>
<ul>
<li>e2e tests are running in CI Environment (headless)</li>
<li>pupeteer as e2e test framework</li>
<li>Show names of marked packages in legend</li>
<li>Added a source code importer that can analyse rloc,mcc for java source code</li>
<li>keep settings when the user changes a file</li>
<li>Added option to set white background</li>
</ul>
<h3>Removed</h3>
<ul>
<li>cypress</li>
</ul>
<h2>[1.14.2] - 2018-07-16</h2>
<h3>Changed</h3>
<ul>
<li>Changed folder detail metrics from mean to sum</li>
</ul>
<h2>[1.14.1] - 2018-07-13</h2>
<p>Fixed release issues</p>
<h2>[1.14.0] - 2018-07-13</h2>
<h3>Added</h3>
<ul>
<li>Added UnderstandImporter to Analysis</li>
<li>Packages can be highlighted in different colors #152</li>
<li>Adding a context menu with highlighting colors and convenience methods for the tree view and 3D view #155</li>
<li>Folders and files to highlight can be described in the cc.json #165</li>
<li>Dynamic/automatic margin computing de/activated by tick</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Details panel: using the sum of the childrens metrics instead of the mean value</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Display buttons do not trigger map changes #185</li>
<li>Flickering surfaces when zooming out</li>
</ul>
<h2>[1.13.0] - 2018-06-08</h2>
<h3>Added</h3>
<ul>
<li>Layout switcher #141</li>
<li>Added CrococosmoImporter to Analysis</li>
<li>Added type, dirs, name to CSVExporter</li>
<li>Invert height of building checkbox</li>
<li>Aggregate multiple maps in visualization #110</li>
<li>Auto Focus selected map part</li>
<li>Timmer added to applySettings in SettingsService</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Crococosmo xml files will now generate a cc.json file for each version</li>
<li>Suppressing ARIA warnings</li>
<li>Simplified gradle structure of analysis part</li>
<li>Deltas added in the metric quick access panel #138</li>
<li>Ticks and ResetValue Buttons call to onSettingsChange to avoid applySettings timer</li>
<li>compacting empty middle packages #150</li>
<li>Detail panel minimized by default</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>filter by regex shows parent nodes #116</li>
<li>typo in scss file</li>
</ul>
<h2>[1.12.0] - 2018-04-27</h2>
<h3>Added</h3>
<ul>
<li>horizontal quick access metric chooser</li>
<li>Link behind filepath in detailPanel #84</li>
<li>Double click event-handler on Buildings #84</li>
<li>Detail Panel can be minimized and maximized</li>
<li>Settings option to minimize Detail Panel</li>
<li>cypress as an e2e test runner</li>
</ul>
<h3>Removed</h3>
<ul>
<li>metric details from legend</li>
<li>metric chooser from settings panel</li>
</ul>
<h2>[1.11.2] - 2018-04-13</h2>
<h3>Fixed</h3>
<ul>
<li>a sonar importer bug which prevented the importer to fetch the last page #122</li>
</ul>
<h2>[1.11.1] - 2018-04-11</h2>
<p>Fixed release issues</p>
<h2>[1.11.0] - 2018-04-11</h2>
<h3>Added</h3>
<ul>
<li>SASS support</li>
<li>simple regex filter</li>
<li>Reset Button</li>
<li>Dialog Service replaces console log calls and window.alert calls</li>
<li>linking tree view and map hover</li>
<li>auto fit scene button</li>
<li>anugularJS material</li>
<li>Scenarios are now filtered by compatibility for the given map</li>
<li>Link in visualization #84</li>
</ul>
<h3>Removed</h3>
<ul>
<li>materialize-css</li>
<li>grunt</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>less flickering and artifacts</li>
</ul>
<h2>[1.10.0] - 2018-03-22</h2>
<h3>Changed</h3>
<ul>
<li>Clean up UI #86</li>
<li>Updated analysis dependencies</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Delta View shows Deltas of itself as non-trivial if nodes have same name #89: Compare deltas by path not name</li>
<li>Delta calculation performance boost #91</li>
<li>Problems when intermediate nodes missed metrics #92</li>
<li>removed unnecessary calculations</li>
<li>removed bug in SonarImporter that slowed up performance and missed out multiple metrics</li>
<li>minor bugs</li>
</ul>
<h2>[1.9.3] - 2018-02-23</h2>
<h3>Changed</h3>
<ul>
<li>sorting treeview by folders and names</li>
</ul>
<h2>[1.9.2] - 2018-02-20</h2>
<h3>Added</h3>
<ul>
<li>added preliminary CSVExporter for visualisation data</li>
</ul>
<h3>Changed</h3>
<ul>
<li>padding rendering</li>
<li>minimal building height is 1 to prevent clipping issues</li>
<li>fallback values for visualization when no metric is available (area = 1, height = 1, color = grey). Data in data structure will not be changed.</li>
</ul>
<h2>[1.9.1] - 2018-02-20</h2>
<h3>Fixed</h3>
<ul>
<li>detail panel bug fix</li>
</ul>
<h2>[1.9.0] - 2018-02-20</h2>
<h3>Changed</h3>
<ul>
<li>moved to unscoped npm packages</li>
</ul>
<h2>[1.8.2] - 2018-02-20</h2>
<h3>Changed</h3>
<ul>
<li>detail panel background is white now. better visibility</li>
</ul>
<h2>[1.8.1] - 2018-02-20</h2>
<h3>Changed</h3>
<ul>
<li>revision chooser moved to settings panel and uses now understandable dropdowns instead of links. Part of the #82 proposals</li>
</ul>
<h2>[1.8.0] - 2018-02-20</h2>
<h3>Added</h3>
<ul>
<li>Experimental dependency support</li>
<li>loading indicator</li>
<li>file path to detail panel</li>
<li>collapsible tree view and visibility/isolation per node toggles</li>
</ul>
<h3>Changed</h3>
<ul>
<li>added a ray-aabb intersection test before precise testing. Less time is spent in intersection methods.</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>fixed a minor bug</li>
<li>canvas mouse event listener are now limited to the canvas dom element. UI events will not trigger the canvas listeners anymore</li>
<li>canvas mouse events distinguish now between click and drag. Dragging does not reset selection anymore</li>
<li>slider input #64</li>
<li>rz slider initialization bug</li>
<li>increasing test coverage</li>
<li>deltas where calculated on map loading even though, they were disabled</li>
</ul>
<h2>[1.7.2] - 2018-02-02</h2>
<h3>Fixed</h3>
<ul>
<li>url to homepage</li>
<li>analysis package</li>
</ul>
<h2>[1.7.1] - 2018-02-02</h2>
<p>Fixed release issues</p>
<h2>[1.7.0] - 2018-02-02</h2>
<h3>Changed</h3>
<ul>
<li>npm pachage scoped to @maibornwolff</li>
<li>Defined further scenarios via json file</li>
<li>Added description for metrics and scenarios</li>
<li>using fixed point values in detail panel (ui) to truncate infinite or long decimals</li>
<li>folders now use the mean attributes of their buildings(leaves)</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Bugfix: detail panel should be cleared before setting new details else old values may survive</li>
</ul>
<h2>[1.6.7] - 2018-02-01</h2>
<p>Fixed release issues</p>
<h2>[1.6.6] - 2018-02-01</h2>
<h3>Added</h3>
<ul>
<li>added anonymous git log generator anongit</li>
<li>browser demo shows codecharta-visualization sonar analysis</li>
</ul>
<h3>Changed</h3>
<ul>
<li>rewrote command line interface</li>
<li>linking ccsh to bin/ccsh will be deleted later</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>No underscore for scenarios in tooltips #71</li>
</ul>
<h2>[1.6.5] - 2018-01-30</h2>
<p>Fixed release issues</p>
<h2>[1.6.4] - 2018-01-30</h2>
<h3>Fixed</h3>
<ul>
<li>fixed broken SonarImporter due to jdk9 migration</li>
</ul>
<h2>[1.6.3] - 2018-01-26</h2>
<h3>Added</h3>
<ul>
<li>added npm publish for analysis</li>
<li>simple release script for automatic changelog updates, commits, tags, version bumps</li>
</ul>
<h2>[1.6.2] - 2018-01-25</h2>
<h3>Added</h3>
<ul>
<li>added support for git log --raw and git log --numstat --raw</li>
<li>added support for git log --numstat and codechurn</li>
<li>added support for renames in SCMLogParser for git log --name-status</li>
<li>added support for renames in SCMLogParser for git log --numstat, git log --raw and git log --numstat --raw</li>
<li>added new SCM experimental metrics range_of_weeks_with_commits and successive_weeks_of_commits</li>
<li>the file origin of a node is displayed in the details now</li>
<li>sonarqube analysis on CI build</li>
<li>npm publish support in visualization</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Deltas are no longer experimental</li>
<li>two selected delta maps now merge their nodes correctly. The map where
a node was missing get's a copy of this node with metrics=0.
File additions/deletions are therefore only visible when areaMetric is
unary and deltas are activated.</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>delta display bug for heights</li>
<li>going back from delta view now correctly removes deltas from node data</li>
<li>Delta shown although not in delta mode #60</li>
<li>Allow inversion of delta colors #57</li>
<li>npm binary error</li>
</ul>
<h2>[1.5.2] - 2018-01-04</h2>
<h3>Changed</h3>
<ul>
<li>scaling slider now has steps of 0.1. This allows the user to select precise values like 2.0</li>
<li>updated jdk to jdk9</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Opening the same file a second time does not work #53</li>
<li>added missing require declaration</li>
<li>added glsl loader in testing environment</li>
<li>Native Application support is bugged while building in Travis CI #48</li>
</ul>
<h2>[1.5.1] - 2017-11-14</h2>
<h3>Added</h3>
<ul>
<li>command line parameter to toggle "authors" attribute in SCMLogParser</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>when passing a file through the "file" parameter in the URL, the map now renders correctly</li>
</ul>
<h2>[1.5.0] - 2017-10-24</h2>
<h3>Added</h3>
<ul>
<li>experimental delta functionality</li>
<li>loading multiple maps</li>
<li>experimental margin slider</li>
</ul>
<h3>Changed</h3>
<ul>
<li>faster rendering</li>
</ul>
<h3>Removed</h3>
<ul>
<li>nwjs packages and native apps due to a bug</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>using color metric instead of height metric for color range slider ceil</li>
</ul>
<h2>[1.4.0] - 2017-09-14</h2>
<h3>Added</h3>
<ul>
<li>Typescript support</li>
<li>Browsersync</li>
<li>added advanced merging strategy "leaf" in MergeFilter</li>
<li>advanced merging with restructuring</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Browserify replaced with Webpack</li>
<li>Better debugging</li>
<li>Karma instead of Mocha</li>
</ul>
<h2>[1.3.2] - 2017-08-18</h2>
<h3>Added</h3>
<ul>
<li>add slider controls for color thresholds #19</li>
<li>Added additional structuring in SonarImporter for multi-module projects</li>
<li>button to generate current url parameters</li>
<li>camera position is now a setting (e.g. in scenarios or url parameters)</li>
<li>margin slider: make it easier to find out to which package/folder a class belongs #20</li>
</ul>
<h3>Changed</h3>
<ul>
<li>better url parameter resolution (nested parameters are handled correctly)</li>
<li>changed hover color. Allows better distinction between hover and select</li>
</ul>
<h3>Removed</h3>
<ul>
<li>obsolete helper grid</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>changing display or color settings resets scaling #18</li>
<li>scenario description #32</li>
<li>Scaling should not scale the labels #35</li>
</ul>
<h2>[1.3.1] - 2017-07-05</h2>
<h3>Fixed</h3>
<ul>
<li>Prevented override of URL-parameters by default scenario</li>
</ul>
<h2>[1.3.0] - 2017-07-05</h2>
<h3>Added</h3>
<ul>
<li>Adding simple merge functionality for multiple json files</li>
<li>Added CSVImporter</li>
<li>Added Translation for SonarQube metrics</li>
<li>Added descriptions for metrics</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Changed uppercase metrics, e.g. RLOC, to lowercase metrics</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>Simple cc.json does not display anything #17</li>
</ul>
<h2>[1.2.0] - 2017-06-19</h2>
<h3>Added</h3>
<ul>
<li>Adding Labels and UI</li>
<li>Support for links to source page of SonarQube in sonarimporter</li>
<li>Added SCMLogParser</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>GitHub Issue: legend is wrong #21</li>
</ul>
<h2>[1.1.5] - 2017-05-31</h2>
<h3>Fixed</h3>
<ul>
<li>Wrong version numbers in analysis part</li>
</ul>
<h2>[1.1.4] - 2017-05-26</h2>
<h3>Added</h3>
<ul>
<li>Scenarios and default scenario</li>
<li>Translation API for Metrics</li>
<li>Metric tooltips in dropdown</li>
</ul>
<h3>Fixed</h3>
<ul>
<li>GitHub Issue: Sonarimporter crashes with null pointer exception when there is a component without path. #13</li>
</ul>
<h2>[1.1.3] - 2017-05-01</h2>
<h3>Added</h3>
<ul>
<li>Support for SonarQube Measures-API</li>
<li>Error logging for sonarqube errors</li>
</ul>
<h3>Changed</h3>
<ul>
<li>Standard Sonar metric is now complexity,ncloc,functions,duplicated_lines,classes,blocker_violations,generated_lines,bugs,commented_out_code_lines,lines,violations,comment_lines,duplicated_blocks</li>
</ul>
<h2>[1.1.2] - 2017-04-28</h2>
<h3>Added</h3>
<ul>
<li>Translation API for Metrics</li>
</ul>
<h2>[1.1.1] - 2017-04-07</h2>
<h3>Fixed</h3>
<ul>
<li>GitHub Issue: Flickering surfaces #3</li>
<li>GitHub Issue: Unable to install due to readlink error on macOS #4</li>
</ul>
<h2>[1.1.0] - 2017-03-27</h2>
<h3>Added</h3>
<ul>
<li>SourceMonitorImporter for importing projects from SourceMonitor.</li>
</ul>
<h2>[1.0.0] - 2017-03-17</h2>
<h3>Added</h3>
<ul>
<li>SonarImporter for importing projects from SonarQube.</li>
<li>ValidationTool for validating an existing json file.</li>
</ul>
`
