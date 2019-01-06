require('@alancnet/three-csg/src/index')
const { distance, min, max, PHI, flatten } = require('./util')
const origin = require('./origin')

const G = 1.618
const g2 = G / 2
const icosahedron = ({size = 1, ratio = PHI - 1} = {}) => {
  return {
    vertices: [
      // Vertical rectangle
      [-size * ratio, -size, 0],
      [ size * ratio, -size, 0],
      [ size * ratio,  size, 0],
      [-size * ratio,  size, 0],
      
      // Horizontal rectangle
      [0, -size * ratio, -size],
      [0,  size * ratio, -size],
      [0,  size * ratio,  size],
      [0, -size * ratio,  size],
      
      // Flat rectangle
      [-size, 0, -size * ratio],
      [ size, 0, -size * ratio],
      [ size, 0,  size * ratio],
      [-size, 0,  size * ratio]
    ],
    faces: [
      [ 4,  1,  0],            //  1
      [10,  2,  6],            //  2
      [ 5,  4,  8],            //  3
      [ 7,  6, 11],            //  4
      [10,  7,  1],            //  5
      [ 8, 11,  3],            //  6
      [ 9,  1,  4],            //  7
      [ 5,  3,  2],            //  8
      [11,  8,  0],            //  9
      [ 9,  5,  2],            // 10
      [11,  0,  7],            // 11
      [ 9,  2, 10],            // 12
      [ 7,  0,  1],            // 13
      [11,  6,  3],            // 14
      [10,  1,  9],            // 15
      [ 8,  3,  5],            // 16
      [ 5,  9,  4],            // 17
      [ 7, 10,  6],            // 18
      [ 8,  4,  0],            // 19
      [ 6,  2,  3],            // 20
    ]
  }
}

const d20 = ({
  size = 5,
  material = new THREE.MeshNormalMaterial()
} = {}) => {
  const ico = icosahedron({size})

  const obj = new THREE.Object3D()

//  obj.add(origin())

  // Calculate the error of the triangles
  obj.error = ico.faces.map(face => {
    const [a, b, c] = face.map(x => ico.vertices[x])
    const ds = [
      distance(a, b),
      distance(b, c),
      distance(c, a)
    ]
    const avg = (ds[0] + ds[1] + ds[2]) / 3
    const maxD = ds.reduce(max)
    const minD = ds.reduce(min)
    const D = maxD - minD
    const error = D / avg
    return error
  }).reduce(max)


  // The die itself
  const dieGeo = new THREE.Geometry()
  ico.vertices.forEach(([x, y, z]) => {
    dieGeo.vertices.push(new THREE.Vector3(x, y, z))
  })
  ico.faces.forEach(([a, b, c]) => {
    dieGeo.faces.push(new THREE.Face3(a, b, c))
  })
  dieGeo.computeBoundingSphere()
  dieGeo.computeFaceNormals()
  
  const dieMesh = new THREE.Mesh(dieGeo, material)
  obj.die = dieMesh
  //obj.add(dieMesh)
  obj.origins = []
  obj.lines = []

  let dieCsg = THREE.CSG.fromMesh(dieMesh).setColor([0x22,0x88,0xaa,0])

  const loader = new THREE.FontLoader()
  obj.die.geometry.faces.forEach((face, f) => {
    const lineGeo = new THREE.Geometry()
    const va = obj.die.geometry.vertices[face.a]
    const vb = obj.die.geometry.vertices[face.b]
    const vc = obj.die.geometry.vertices[face.c]
    const center = new THREE.Vector3()
      .add(va)
      .add(vb)
      .add(vc)
      .divideScalar(3)

    lineGeo.vertices.push(
      new THREE.Vector3(0,0,0),
      center.clone().multiplyScalar(1),
      center.clone().multiplyScalar(2)
    )

    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xff00ff }))
    obj.lines[f] = line
    //obj.add(line)

    const org = new THREE.Object3D() // origin({ size: .05 })
    obj.origins[f] = org
    org.position.copy(center)
    obj.add(org)

    org.up.copy(va)
    org.lookAt(center.clone().multiplyScalar(2))
    org.updateWorldMatrix(false, true) // Save rotation to objects so when we move them later, it retains its oritentation

    const textMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      flatShading: true
    })

    // loader.load('three/examples/fonts/droid/droid_sans_regular.typeface.json', font => {
      const n = f + 1

      const textGeo = 
        THREE.CSG.toGeometry(THREE.CSG.fromText(n.toString(), {
          weight: 4,
          height: 2,
          size: .03
        }))
      /*new THREE.TextGeometry(n.toString(), {
        font: font,
        size: .040,
        height: .01,
        curveSegments: 12,
        bevelEnabled: false,
        bevelThickness: 0.01,
        bevelSize: 0.0008,
        bevelSegments: 5
      });*/
    
      const textMesh = new THREE.Mesh(
        textGeo,
        textMaterial
      )
      
      const textSize = new THREE.Vector3
      textGeo.computeBoundingBox()
      textGeo.boundingBox.getSize(textSize)
      const textCenter = textSize.clone().multiplyScalar(-.5)
      textMesh.position.sub(textGeo.boundingBox.min)
      textMesh.position.add(textCenter)

      if (n === 9 || n === 6) {
        // Add underline
        const underlineGeo = new THREE.BoxGeometry(textSize.x, 0.005, textSize.z)
        const underlineMesh = new THREE.Mesh(underlineGeo, textMaterial)
        underlineMesh.position.setY(-.0175)
        textMesh.position.setY(textMesh.position.y + 0.01)
        org.add(underlineMesh)

        underlineMesh.updateMatrix()
        flatten(underlineMesh, obj)
        const underlineCsg = THREE.CSG.fromMesh(underlineMesh).setColor([255,255,255,128])
        dieCsg = dieCsg.subtract(underlineCsg)
        obj.remove(underlineMesh)
      }
      textMesh.updateMatrix()

      const box = new THREE.Box3Helper(textGeo.boundingBox)
      textMesh.add(box)


      org.add(textMesh)
      flatten(textMesh, obj)
      const textCsg = THREE.CSG.fromMesh(textMesh).setColor([255,255,255,1])
      dieCsg = dieCsg ? dieCsg.subtract(textCsg) : textCsg; //dieCsg.union(textCsg)
      obj.remove(textMesh)
      
    })

    // const csgGeo = THREE.CSG.toGeometry(dieCsg)
    // const dieMaterial = new THREE.MeshLambertMaterial({
    //   color: 0x2288aa
    // })
    // const textMaterial = new THREE.MeshLambertMaterial({
    //   color: 0xeeeeee
    // })
    // const csgMaterials = [dieMaterial, textMaterial]
    // csgGeo.faces.forEach((face, i) => {
    //   if (i < 20) {
    //     face.materialIndex = 0
    //   } else {
    //     face.materialIndex = 1
    //   }
    // })


    const csgMesh = THREE.CSG.toMesh(dieCsg, THREE.MeshPhysicalMaterial)
    obj.add(csgMesh)
    //obj.add(dieMesh)
  //})
  return obj
}

module.exports = {
  icosahedron,
  d20
}