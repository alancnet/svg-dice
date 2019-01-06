const THREE = require('./three')

const now = () => typeof performance !== 'undefined' ? performance.now() : Date.now()

const rateLimit = (fn, ms = 1000) => {
  let last = 0
  let promise
  return (...args) => promise || (promise = new Promise((resolve, reject) => {
    const time = now()
    const sleep = Math.max(0, ms - (time - last))
    last = time + sleep
    setTimeout(() => {
      promise = null
      resolve(fn(...args))
    }, sleep)
  }))
}

const rateMeasure = (fn, cb) => {
  let last = undefined

  return (...args) => {
    const time = now()
    if (last) {
      const delta = time - last
      const perSec = 1000 / delta
      const perMin = perSec * 60
      cb(perSec, perMin)
    }
    last = time
    return fn(...args)
  }
}

const sum = (a, b) => a + b

const sample = (cb, n = 10) => {
  const buffer = new Array(n)
  let i = 0
  let max = 0
  return (v) => {
    buffer[i++] = v
    max = Math.max(max, i)
    if (i === n) i = 0
    const average = buffer.reduce(sum, 0) / max
    cb(average)
  }
}

const v = v => Array.isArray(v)
  ? new THREE.Vector3(v[0] || 0, v[1] || 0, v[2] || 0)
  : v

const distance2 = (a, b) => {
  a = v(a)
  b = v(b)

  const x1 = a.x
  const y1 = a.y
  const z1 = a.z

  const x2 = b.x
  const y2 = b.y
  const z2 = b.z
  
  return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2)
}

const max = (a, b) => Math.max(a, b)
const min = (a, b) => Math.min(a, b)

const distance = (a, b) => Math.sqrt(distance2(a, b))
const PHI = 1.6180339887498949025257388711906969547271728515625

const rotateAroundObjectAxis = (object, axis, radians) => {
  const rotationMatrix = new THREE.Matrix4()
  rotationMatrix.makeRotationAxis(axis.normalize(), radians)
  object.matrix.multiply(rotationMatrix)
  object.rotation.setFromRotationMatrix( object.matrix )
}

const rotateAroundWorldAxis = (object, axis, radians) => {

  const rotationMatrix = new THREE.Matrix4()

  rotationMatrix.makeRotationAxis( axis.normalize(), radians )
  rotationMatrix.multiply( object.matrix )
  object.matrix = rotationMatrix
  object.rotation.setFromRotationMatrix( object.matrix )
}

const flatten = (obj, stage) => {
  let scene = obj
  obj.updateMatrix()
  obj.updateWorldMatrix()
  while (scene.parent) scene = scene.parent
  THREE.SceneUtils.detach(obj, obj.parent, scene)
  THREE.SceneUtils.attach(obj, scene, stage)
}

const tripleProduct = (a,b,c) => a.clone().dot(new THREE.Vector3().cross(b,c))

const _isCoPlanar = (a, b, c, d) => {
  const ab = b.clone().sub(a)
  const ac = c.clone().sub(a)
  const ad = d.clone().sub(a)
  return tripleProduct(ab, ac, ad) === 0
}

const isCoPlanar = (vertices) => {
  if (vertices.length >= 4) {
    for (i = 0; i <= vertices.length - 4; i++) {
      const slice = vertices.slice(i, i + 4)
      if (!_isCoPlanar(...slice)) return false
    }
  }
  return true
}

module.exports = {
  rateLimit, rateMeasure, sum, sample, now,
  distance, distance2, min, max, PHI,
  rotateAroundWorldAxis, rotateAroundObjectAxis,
  flatten, isCoPlanar
}