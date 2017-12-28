describe('initial state', function() {

    function navigateToCC() {
        browser.get('http://localhost:3000');
    }

    function clickLegendPanelButton() {
        element(by.css("#legendButton > a")).click();
    };

    describe('of app', function() {

        it('should print current version in title', function () {
            navigateToCC();
            var title = element(by.css('#title > h1 > span')).getText();
            expect(title).toContain(require("../package.json").version);
        });

        it('should contain link to maibornwolff.de', function () {
            navigateToCC();
            var link = element(by.css('#title a')).getAttribute("href");
            expect(link).toContain("maibornwolff.de");
        });

        it('should contain link to maibornwolff.de', function () {
            navigateToCC();
            var link = element(by.css('#title a')).getAttribute("href");
            expect(link).toContain("maibornwolff.de");
        });

    });

    describe('of legend panel', function() {

        it('should print default metrics', function () {
            navigateToCC();
            clickLegendPanelButton()
            var html = element(by.css('#legendPanel > div.legendInfo.ng-binding')).getAttribute("innerHTML");
            expect(html).toContain("Area: rloc");
            expect(html).toContain("Height: mcc");
            expect(html).toContain("Color: mcc");
        })

        it('should print correct neutralColorRange', function () {
            navigateToCC();
            clickLegendPanelButton()
            var html = element(by.css('#legendPanel > div:nth-child(2) > span')).getAttribute("innerHTML");
            expect(html).toContain("0 to &lt; 20");
        })

    });

});