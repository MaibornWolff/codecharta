import * as THREE from "three";

export const getBaseMaterialEdge = () =>
    new THREE.MeshLambertMaterial({ color: 0x8cb5c8 });
export const getBaseMaterialFace = () =>
    new THREE.MeshLambertMaterial({ color: 0xbafffe });
export const getBaseMaterialVertices = () =>
    new THREE.MeshLambertMaterial({ color: 0x3f83a3 });
