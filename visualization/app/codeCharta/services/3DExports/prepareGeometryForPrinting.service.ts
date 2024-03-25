import {BufferGeometry, ExtrudeGeometry, Mesh, MeshBasicMaterial, Shape} from "three";


export interface GeometryOptions {
	width: number,
	frontText?: string,
	zScale?: number
}

export async function prepareGeometryForPrinting(mapMesh: Mesh, geometryOptions: GeometryOptions): Promise<Mesh> {
	const mapSideOffset = 10

	const printMesh: Mesh = new Mesh()
	printMesh.clear()

	const map = prepareMap(mapMesh.geometry.clone(), geometryOptions.width - (2 * mapSideOffset), (geometryOptions.zScale || 1))
	map.translate(0, 0, 1)
	const newMapMesh: Mesh = mapMesh.clone() as Mesh
	newMapMesh.clear()
	newMapMesh.geometry = map
	printMesh.attach(newMapMesh)

	const baseplateMesh = baseplate(geometryOptions.width, mapSideOffset)
	printMesh.attach(baseplateMesh)

	return printMesh
}

function prepareMap(map: BufferGeometry, width, zScale): BufferGeometry {
	//rotate 90 degrees around x-axis so map is horizontal
	map.rotateX(Math.PI / 2)

	//scale
	const normalizeFactor = map.boundingBox.max.x
	const xyScale = width / normalizeFactor
	map.scale(xyScale, xyScale, zScale * xyScale)

	return map
}

function baseplate(width, mapSideOffset): Mesh {
	let edgeRadius = 5; // Adjust this value to change the roundness of the corners
	const maxRoundRadius = Math.sqrt(2 * Math.pow(mapSideOffset, 2)) / (Math.sqrt(2) - 1) - 1
	if (maxRoundRadius < edgeRadius) {
		edgeRadius = maxRoundRadius
	}

	// Create the shape
	const shape = new Shape();

	shape.absarc(width - edgeRadius, edgeRadius, edgeRadius, Math.PI * 1.5, Math.PI * 2, false);
	shape.absarc(width - edgeRadius, width - edgeRadius, edgeRadius, 0, Math.PI * 0.5, false);
	shape.absarc(edgeRadius, width - edgeRadius, edgeRadius, Math.PI * 0.5, Math.PI, false);
	shape.absarc(edgeRadius, edgeRadius, edgeRadius, Math.PI, Math.PI * 1.5, false);

	// Create the geometry
	const geometry = new ExtrudeGeometry(shape, {depth: 1, bevelEnabled: false});
	geometry.translate(-mapSideOffset, -width + mapSideOffset, 0);

	// Create the material
	const material = new MeshBasicMaterial({color: 0xff_00_00});

	// Create the mesh
	const baseplateMesh = new Mesh(geometry, material);
	baseplateMesh.name = "Baseplate";

	console.log(baseplateMesh)
	return baseplateMesh
}


/*

baseplate = (x, y, z, mapSideOffset, roundRadius = Number.MAX_VALUE): Geom3 => {
	const maxRoundRadius = Math.sqrt(2 * Math.pow(mapSideOffset, 2)) / (Math.sqrt(2) - 1) - 1
	if (maxRoundRadius < roundRadius) {
		roundRadius = maxRoundRadius
	}

	const flatBaselate = roundedRectangle({ size: [x, y], roundRadius, center: [x / 2 - mapSideOffset, y / 2 - mapSideOffset] })
	let baseplate = extrudeLinear({ height: z }, flatBaselate)
	baseplate = colorize(colorNameToRgb("gray"), baseplate)
	return baseplate
}

const print = (txt, x, y, z, size, t, font = "Arial", halign = "left", valign = "baseline") => {
	const txtModel = text({text: txt, height: t, align: halign, valign, font, size});
	return translate([x, y, z], txtModel);
}



const backside = (thickness = 0.6) => {
	const back = union(
		logo("logos/mw_logo_text.svg", -20, 10, 0, thickness),
		translate([15, 60, 0],
			union(
				logo("icons/area.svg", 0, 30-1, 0, 8, 8, thickness),
				logo("icons/height.svg", 0, 15-1, 0, 8, 8, thickness),
				logo("icons/color.svg", 0, -1, 0, 8, 8, thickness),
				print("rloc (total: 338,540 real lines)", 15, 30, 0, 6, thickness, "Liberation Mono:style=Bold"),
				print("mcc  (min: 0, max: 338)", 15, 15, 0, 6, thickness, "Liberation Mono:style=Bold"),
				print("test line coverage", 15, 0, 0, 6, thickness, "Liberation Mono:style=Bold"),
				print("     (0-33% / 33-66% / 66-100%)", 15, -10, 0, 6, thickness, "Liberation Mono:style=Bold")
			)
		),
		print("IT Stabilization & Modernization", baseplate_x / 2, 135, 0, 8, thickness, "Arial:style=Bold", "center"),
		print("maibornwolff.de/service/it-sanierung", baseplate_x / 2, 122, 0, 6, thickness, "Arial:style=Bold", "center"),
		print("maibornwolff.github.io/codecharta", baseplate_x / 2, 20, 0, 6, thickness, "Arial:style=Bold", "center")
	);
	return translate([baseplate_x, 0, -0.01], mirror([1,0,0], back));
}

const mcolor = (c) => {
	return (geometry) => color(c, geometry);
}


logo = async (file: string, positionOfUpperLeftCorner: Vec3, size: Vec3, rotate = 0, color = "white"): Promise<Geom3> => {
	const svgData = await firstValueFrom(this.httpClient.get(`codeCharta/assets/${file}`, { responseType: "text" }).pipe(timeout(5000)))
	const svgModels: Geom2[] = deserialize({ output: "geometry", addMetaData: false, target: "geom2", pathSelfClosed: "trim" }, svgData)
	const models: Geom3[] = svgModels.map(object => {
		return extrudeLinear({ height: size[2] }, object)
	})

	let model: Geom3 = union(models) //normally I would have used "union" here - but somehow union and intersect seem to be mistakenly swapped in this library
	model = scale([size[0], size[1], 1], model)
	model = rotateZ((rotate / 180) * Math.PI, model)
	const centerPosition: Vec3 = [
		positionOfUpperLeftCorner[0] - size[0] * 20,
		positionOfUpperLeftCorner[1],
		positionOfUpperLeftCorner[2] + size[2] / 2
	]
	model = center({ relativeTo: centerPosition }, model)
	model = colorize(colorNameToRgb(color), model)
	return model
}*/
