require("./codeMap.js");

/**
 * @test {CodeMapService}
 */
describe("app.codeCharta.codeMap.codeMapService", function() {

    let codeMapService, $scope, sandbox, mesh, data;

    beforeEach(angular.mock.module("app.codeCharta.codeMap"));

    beforeEach(angular.mock.inject((_codeMapService_, _$rootScope_)=>{
        codeMapService = _codeMapService_;
        $scope = _$rootScope_;
        const geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        mesh = new THREE.Mesh( geometry, material );
        codeMapService.addRoot();
        data = data = {
            "name": "root",
            "attributes": {},
            "children": [
                {
                    "name": "big leaf",
                    "attributes": {"rloc": 100, "functions": 10, "mcc": 1},
                    "link": "http://www.google.de"
                },
                {
                    "name": "Parent Leaf",
                    "attributes": {},
                    "children": [
                        {
                            "name": "small leaf",
                            "attributes": {"rloc": 30, "functions": 100, "mcc": 100},
                            "children": []
                        },
                        {
                            "name": "other small leaf",
                            "attributes": {"rloc": 70, "functions": 1000, "mcc": 10},
                            "children": []
                        }
                    ]
                }
            ]
        };
    }));

    beforeEach(()=>{
        sandbox = sinon.sandbox.create();
    });

    afterEach(()=>{
        sandbox.restore();
    });

    /**
     * @test {CodeMapService#drawMap}
     */
    it("drawMap should showLabels for the highest building", ()=>{

        const smallSpy = sinon.spy();
        const otherSpy = sinon.spy();
        const elseSpy = sinon.spy();

        codeMapService.addNode = (node, heightKey, showLabel) => {
            if(node.name === "small leaf"){
                expect(showLabel);
                smallSpy();
            } else if(node.name === "other small leaf"){
               expect(!showLabel);
               otherSpy();
           } else {
               expect(!showLabel);
               elseSpy();
           }
        };

        codeMapService.drawMap(data, 2, 2, "rloc", "mcc", "mcc", "colorConfig", 1);

        expect(smallSpy.calledOnce);
        expect(otherSpy.calledOnce);
        expect(elseSpy.called);

    });

    /**
     * @test {CodeMapService#addLabel}
     */
    it("should addLabel to root if node has height attribute", ()=>{
        codeMapService.root.add = sinon.spy();
        codeMapService.addLabel(0,0,0,0,0,0,{attributes:{heightKey:0}},"heightKey");
        expect(codeMapService.root.add.called);
    });

    /**
     * @test {CodeMapService#addLabel}
     */
    it("should not addLabel to root if node has no height attribute", ()=>{
        codeMapService.root.add = sinon.spy();
        codeMapService.addLabel(0,0,0,0,0,0,{attributes:{heightKey:0}},"heightKeyZZZZZ");
        expect(!codeMapService.root.add.called);
    });

    /**
     * @test {CodeMapService#addLabel}
     * @test {CodeMapService#addNode}
     */
    it("should call addLabel when showLabel is true", ()=>{
        codeMapService.addLabel = sinon.spy();
        codeMapService.addBuilding(1,1,1,1,1,1,2,{ isDelta:true}, true);
        expect(codeMapService.addLabel);
    });

    /**
     * @test {CodeMapService#addLabel}
     * @test {CodeMapService#addNode}
     */
    it("should not call addLabel when showLabel is false", ()=>{
        codeMapService.addLabel = sinon.spy();
        codeMapService.addBuilding(1,1,1,1,1,1,2,{ isDelta:true}, false);
        expect(!codeMapService.addLabel);
    });

    /**
     * @test {CodeMapService#addLabel}
     */
    it("should not addLabel to root if node has no attributes", ()=>{
        codeMapService.root.add = sinon.spy();
        codeMapService.addLabel(0,0,0,0,0,0,{},"heightKey");
        expect(!codeMapService.root.add.called);
    });

    /**
     * @test {CodeMapService#scaleTo}
     */
    it("should not try to scale when no root with a scale method exists", ()=>{
        codeMapService.root = "something";
        codeMapService.scaleTo(1,1,1);
        expect(codeMapService.root).to.equal("something");

        codeMapService.root = undefined;
        codeMapService.scaleTo(1,1,1);
        expect(codeMapService.root).to.equal(undefined);
    });

    /**
     * @test {CodeMapService#drawMap}
     */
    it("draw map should clear the scene, add a root, call the treemap service, call addNode for every node, center the map, draw the scene and color the map, grid is deactivated", ()=>{

        codeMapService.clearScene = sandbox.spy();
        codeMapService.addRoot = sandbox.spy();
        codeMapService.addGrid = sandbox.spy();
        codeMapService.treemapService.createTreemapNodes = sandbox.stub().returns([{},{},{}]);
        codeMapService.addNode = sandbox.spy();
        codeMapService.centerMap = sandbox.spy();
        codeMapService.drawScene = sandbox.spy();
        codeMapService.colorMap = sandbox.spy();
        codeMapService.settingsService.settings.grid = false;

        codeMapService.drawMap("map", "s", "p", "areaKey", "heightKey", "colorKey", "colorConfig");

        expect(codeMapService.clearScene.calledOnce);
        expect(codeMapService.addRoot.calledOnce);
        expect(!codeMapService.addGrid.called);
        expect(codeMapService.treemapService.createTreemapNodes.calledOnce);
        expect(codeMapService.addNode.calledThrice);
        expect(codeMapService.centerMap.calledOnce);
        expect(codeMapService.drawScene.calledOnce);
        expect(codeMapService.colorMap.calledOnce);

    });

    /**
     * @test {CodeMapService#drawMap}
     */
    it("draw map should clear the scene, add a root, call the treemap service, call addNode for every node, center the map, draw the scene and color the map, grid is activated", ()=>{

        codeMapService.clearScene = sandbox.spy();
        codeMapService.addRoot = sandbox.spy();
        codeMapService.addGrid = sandbox.spy();
        codeMapService.treemapService.createTreemapNodes = sandbox.stub().returns([{},{},{}]);
        codeMapService.addNode = sandbox.spy();
        codeMapService.centerMap = sandbox.spy();
        codeMapService.drawScene = sandbox.spy();
        codeMapService.colorMap = sandbox.spy();
        codeMapService.settingsService.settings.grid = true;

        codeMapService.drawMap("map", "s", "p", "areaKey", "heightKey", "colorKey", "colorConfig");

        expect(codeMapService.clearScene.calledOnce);
        expect(codeMapService.addRoot.calledOnce);
        expect(codeMapService.addGrid.calledOnce);
        expect(codeMapService.treemapService.createTreemapNodes.calledOnce);
        expect(codeMapService.addNode.calledThrice);
        expect(codeMapService.centerMap.calledOnce);
        expect(codeMapService.drawScene.calledOnce);
        expect(codeMapService.colorMap.calledOnce);

    });

    /**
     * @test {CodeMapService#applySettings}
     */
    it("applySettings should call drawFromData and scaleTo when all variables are set", ()=>{

        codeMapService.drawFromData = sandbox.spy();
        codeMapService.scaleTo = sandbox.spy();

        const s = {
            areaMetric:1,
            heightMetric:1,
            colorMetric:1,
            map: {},
            range: {},
            scale: {x:1,y:1,z:1}
        };

        codeMapService.applySettings(s);

        expect(codeMapService.drawFromData.calledOnce);
        expect(codeMapService.scaleTo.calledOnce);

    });

    /**
     * @test {CodeMapService#addLightsToScene}
     */
    it("should add something to scene when addLightsToScene is called", () => {
        codeMapService.scene.add = sandbox.spy();
        codeMapService.addLightsToScene();
        expect(codeMapService.scene.add.called);
    });

    /**
     * @test {CodeMapService#addLightsToScene}
     */
    it("should add something to scene when addLightsToScene is called", () => {
        codeMapService.scene.add = sandbox.spy();
        codeMapService.addLightsToScene();
        expect(codeMapService.scene.add.called);
    });

    /**
     * @test {CodeMapService#getTransformedMesh}
     */
    it("getTransformedMesh should create correct mesh", ()=>{
        const mesh = codeMapService.getTransformedMesh(1,1,1,0,0,0,new THREE.MeshLambertMaterial({color: 0x69AE40}), "something");
        expect(mesh.node).to.equal("something");
        expect(mesh.scale.x).to.equal(1);
    });

    /**
     * @test {CodeMapService#applySettings}
     */
    it("applySettings should not call drawFromData when variables are missing", ()=>{

        codeMapService.drawFromData = sandbox.spy();

        const s = {
            areaMetric:1,
            heightMetric:1,
            colorMetric:1,
            map: {}
            //no range
        };

        codeMapService.applySettings(s);

        expect(!codeMapService.drawFromData.called);

    });

    /**
     * @test {CodeMapService#addBuilding}
     */
    it("addBuilding should add a group to the root when heightDelta is >0", () => {
        codeMapService.root.add = sandbox.spy();
        codeMapService.addBuilding(1,1,1,1,1,1,2,{ isDelta:true});
        expect(codeMapService.root.add.calledOnce);
    });

    /**
     * @test {CodeMapService#addBuilding}
     */
    it("addBuilding should add a group to the root when heightDelta is <0", () => {
        codeMapService.root.add = sandbox.spy();
        codeMapService.addBuilding(1,1,1,1,1,1,-2,{});
        expect(codeMapService.root.add.calledOnce);
    });

    /**
     * @test {CodeMapService#addBuilding}
     */
    it("addBuilding should add a group to the root when heightDelta is =0", () => {
        codeMapService.root.add = sandbox.spy();
        codeMapService.addBuilding(1,1,1,1,1,1,0,{});
        expect(codeMapService.root.add.calledOnce);
    });

    /**
     * @test {CodeMapService#addBuilding}
     */
    it("addBuilding should add a group to the root when heightDelta < h and heightDelta > 0", () => {
        codeMapService.root.add = sandbox.spy();
        codeMapService.addBuilding(1,3,1,1,1,1,2,{});
        expect(codeMapService.root.add.calledOnce);
    });

    /**
     * @test {CodeMapService#addBuilding}
     */
    it("addBuilding should add a group to the root when -heightDelta > h and heightDelta < 0", () => {
        codeMapService.root.add = sandbox.spy();
        codeMapService.addBuilding(1,3,1,1,1,1,-4,{});
        expect(codeMapService.root.add.calledOnce);
    });

    /**
     * @test {CodeMapService#addBuilding}
     */
    it("addBuilding with heightDelta > 0 should request two meshes (delta and building)", () => {
        codeMapService.getTransformedMesh = sandbox.stub().returns(mesh);
        codeMapService.addBuilding(1,3,1,1,1,1,4,{});
        expect(codeMapService.getTransformedMesh.calledTwice);
    });

    /**
     * @test {CodeMapService#addBuilding}
     */
    it("addBuilding with heightDelta < 0 should request two meshes (delta and building)", () => {
        codeMapService.getTransformedMesh = sandbox.stub().returns(mesh);
        codeMapService.addBuilding(1,3,1,1,1,1,-4,{});
        expect(codeMapService.getTransformedMesh.calledTwice);
    });

    /**
     * @test {CodeMapService#addBuilding}
     */
    it("addBuilding with heightDelta = 0 should request one meshes (only building)", () => {
        codeMapService.getTransformedMesh = sandbox.stub().returns(mesh);
        codeMapService.addBuilding(1,3,1,1,1,1,0,{});
        expect(codeMapService.getTransformedMesh.calledOnce);
    });

    it("should retrieve the angular service instance", ()=>{
        expect(codeMapService).to.not.equal(undefined);
    });

    /**
     * @test {CodeMapService#applySettings}
     */
    it("should call applySettings on settings-changed event", ()=>{
        codeMapService.applySettings = sandbox.spy();
        $scope.$broadcast("settings-changed");
        expect(codeMapService.applySettings.calledOnce);
    });

    /**
     * @test {CodeMapService#scaleTo}
     */
    it("scaleTo should scale buildings if available", ()=>{
        codeMapService.drawMap(data, 2, 2, "rloc", "mcc", "mcc", "colorConfig", 1);

        codeMapService.buildings = {
            scale: {
                set: sandbox.spy()
            }
        };
        codeMapService.scaleTo(1,2,3);
        expect(codeMapService.buildings.scale.set.calledOnce);
    });

    /**
     * @test {CodeMapService#scaleTo}
     */
    it("scaleTo should scale floors if available", ()=>{
        codeMapService.drawMap(data, 2, 2, "rloc", "mcc", "mcc", "colorConfig", 1);

        codeMapService.floors = {
            scale: {
                set: sandbox.spy()
            }
        };
        codeMapService.scaleTo(1,2,3);
        expect(codeMapService.floors.scale.set.calledOnce);
    });

    /**
     * @test {CodeMapService#addNode}
     */
    it("addNode should call addFloor if node is no leaf", ()=>{
        codeMapService.addFloor = sandbox.spy();
        codeMapService.addNode({isLeaf: false}, "heightKey");
        expect(codeMapService.addFloor.calledOnce);
    });

    /**
     * @test {CodeMapService#addNode}
     */
    it("addNode should call addBuilding if node is leaf", ()=>{
        codeMapService.addBuilding = sandbox.spy();
        codeMapService.addNode({isLeaf: true}, "heightKey");
        expect(codeMapService.addBuilding.calledOnce);
    });

    /**
     * @test {CodeMapService#repositionLabelsAndConnectors}
     */
    it("should change values correctly", ()=>{

        codeMapService.labels.children = [
            {
                position: {
                    x:2,
                    y:3,
                    z:4
                },
                labelBuildingConnector: {
                    geometry: {
                        vertices: [
                            {
                                x:5,
                                y:6,
                                z:7
                            },
                            {
                                x:8,
                                y:9,
                                z:10
                            }
                        ]
                    }
                }
            }
        ];

        codeMapService.repositionLabelsAndConnectors(2,3,4);
        expect(codeMapService.labels.children[0].position.x).to.be.equal(4);
        expect(codeMapService.labels.children[0].position.y).to.be.equal(9);
        expect(codeMapService.labels.children[0].position.z).to.be.equal(16);

        expect(codeMapService.labels.children[0].labelBuildingConnector.geometry.vertices[0].x).to.be.equal(10);
        expect(codeMapService.labels.children[0].labelBuildingConnector.geometry.vertices[0].y).to.be.equal(18);
        expect(codeMapService.labels.children[0].labelBuildingConnector.geometry.vertices[0].z).to.be.equal(28);

        expect(codeMapService.labels.children[0].labelBuildingConnector.geometry.vertices[1].x).to.be.equal(16);
        expect(codeMapService.labels.children[0].labelBuildingConnector.geometry.vertices[1].y).to.be.equal(27);
        expect(codeMapService.labels.children[0].labelBuildingConnector.geometry.vertices[1].z).to.be.equal(40);

    });

    /**
     * @test {CodeMapService#centerMap}
     */
    it("centerMap", ()=>{
        codeMapService.root.translateX = sandbox.spy();
        codeMapService.root.translateZ = sandbox.spy();
        codeMapService.centerMap(500,400);
        expect(codeMapService.root.translateX.calledWithExactly(250));
        expect(codeMapService.root.translateX.calledWithExactly(200));
    });

    /**
     * @test {CodeMapService#scaleTo}
     */
    it("scaleTo should not scale root if not available", ()=>{
        codeMapService.scaleTo(1,2,3);
    });

    /**
     * @test {CodeMapService#applySettings}
     */
    it("applySettings should redraw scene if there is enough data", ()=>{

        codeMapService.drawFromData = sandbox.spy();

        const min = {
            areaMetric: "area",
            heightMetric: "height",
            colorMetric: "color",
            map: {},
            range: {}
        };

        codeMapService.applySettings(min);

        expect(codeMapService.drawFromData.calledOnce);

    });

    /**
     * @test {CodeMapService#applySettings}
     */
    it("applySettings should not redraw scene if there is not enough data", ()=>{

        codeMapService.drawFromData = sandbox.spy();

        const min = {
            areaMetric: "area",
            colorMetric: "color",
            map: {},
            range: {}
        };

        codeMapService.applySettings(min);

        expect(codeMapService.drawFromData.called).to.equal(false);

    });

    /**
     * @test {CodeMapService#addGrid}
     */
    it("adding a helper grid to the scene should add a group of 3 Meshes to the scene", ()=>{

        codeMapService.root.add = (mesh) => {
            expect(mesh.children.length).to.equal(3);
        };

        codeMapService.addGrid(500, 10);

    });

    /**
     * @test {CodeMapService#colorDelta}
     */
    it("colorDelta should color the first delta node in a group (since buildings only have one delta node)", ()=>{

        //stub a group and children
        let a = {
            isDelta: false,
            material: new THREE.MeshLambertMaterial({color: 0x012345})
        };

        let b = {
            isDelta: true,
            material: new THREE.MeshLambertMaterial({color: 0x123456})
        };

        let c = {
            isDelta: true,
            material: new THREE.MeshLambertMaterial({color: 0x234567})
        };

        let group = {
            children: [a, b, c]
        };

        codeMapService.colorDelta(group);

        let foundDelta = false;

        group.children.forEach((c)=>{
            if(c.isDelta && c.originalMaterial && c.selectedMaterial){ // a set originalMaterial indicates a colored cube
                foundDelta = true;
            }
        });

        expect(foundDelta).to.equal(true);

    });

    /**
     * @test {CodeMapService#centerMap}
     */
    it("center map should translate root in xz plane at some point", ()=>{
        const x = codeMapService.root.translateX = sandbox.spy();
        const z = codeMapService.root.translateZ = sandbox.spy();
        codeMapService.centerMap(0,0);
        expect(x.calledOnce);
        expect(z.calledOnce);
    });

});