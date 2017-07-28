"use strict";

class LegendPanelController {

    /* @ngInject */
    constructor(codeMapMaterialFactory, $timeout, $scope, settingsService, dataService) {

        this.mats = codeMapMaterialFactory;
        this.$timeout = $timeout;

        let ctx = this;
        $timeout(ctx.onDataChanged(dataService.revisions));
        $timeout(ctx.onSettingsChanged(settingsService.settings));
        $scope.$on("data-changed", (e,d)=>{ctx.onDataChanged(d);});
        $scope.$on("settings-changed", (e,s)=>{ctx.onSettingsChanged(s);});

    }

    onDataChanged(data) {
        if(data && data.revisions && data.revisions.length > 1){
            this.deltas = true;
            this.pd = this.getImageDataUri(this.mats.positiveDelta().color.getHex());
            this.nd = this.getImageDataUri(this.mats.negativeDelta().color.getHex());
            this.$timeout(()=>$("#positiveDelta").attr("src", this.pd),200);
            this.$timeout(()=>$("#negativeDelta").attr("src", this.nd),200);
        }
    }

    onSettingsChanged(s) {
        this.range =s.neutralColorRange;
        this.areaMetric = s.areaMetric;
        this.heightMetric = s.heightMetric;
        this.colorMetric = s.colorMetric;

        this.positive = this.getImageDataUri(this.mats.positive().color.getHex());
        this.neutral = this.getImageDataUri(this.mats.neutral().color.getHex());
        this.negative = this.getImageDataUri(this.mats.negative().color.getHex());
        this.select = this.getImageDataUri(this.mats.selected().color.getHex());

        $("#green").attr("src", this.positive);
        $("#yellow").attr("src", this.neutral);
        $("#red").attr("src", this.negative);
        $("#select").attr("src", this.select);
    }

    getImageDataUri(hex){
        hex = "#"+hex.toString(16);
        var color = this.encodeHex(hex);
        return this.generatePixel(color);
    }

    encodeHex(s) {
        s = s.substring(1, 7);
        if (s.length < 6) {
            s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
        }
        return this.encodeRGB(
            parseInt(s[0] + s[1], 16), parseInt(s[2] + s[3], 16), parseInt(s[4] + s[5], 16));
    }

    encodeRGB(r, g, b) {
        return this.encodeTriplet(0, r, g) + this.encodeTriplet(b, 255, 255);
    }

    encodeTriplet(e1, e2, e3) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var enc1 = e1 >> 2;
        var enc2 = ((e1 & 3) << 4) | (e2 >> 4);
        var enc3 = ((e2 & 15) << 2) | (e3 >> 6);
        var enc4 = e3 & 63;
        return keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }


    generatePixel(color) {
        return "data:image/gif;base64,R0lGODlhAQABAPAA" + color + "/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
    }


}

export {LegendPanelController};


