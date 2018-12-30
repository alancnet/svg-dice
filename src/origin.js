const THREE = require('three')

const origin = ({
  style = 'solid' || 'dashed',
  xColor = 0xff0000,
  yColor = 0x00ff00,
  zColor = 0x0000ff,
  size = 5
} = {}) => {
  const obj = new THREE.Object3D()

  const o = new THREE.Vector3(0, 0, 0)
  const xGeo = new THREE.Geometry()
  xGeo.vertices.push(o, new THREE.Vector3(size, 0, 0))
  const yGeo = new THREE.Geometry()
  yGeo.vertices.push(o, new THREE.Vector3(0, size, 0))
  const zGeo = new THREE.Geometry()
  zGeo.vertices.push(o, new THREE.Vector3(0, 0, size))
  
  const Material = style === 'solid' ? THREE.LineBasicMaterial : THREE.LineDashedMaterial

  const xLine = new THREE.Line(xGeo, new Material({color: xColor}))
  const yLine = new THREE.Line(yGeo, new Material({color: yColor}))
  const zLine = new THREE.Line(zGeo, new Material({color: zColor}))

  obj.add(xLine)
  obj.add(yLine)
  obj.add(zLine)

  obj.x = xLine
  obj.y = yLine
  obj.z = zLine

  return obj
}

module.exports = origin