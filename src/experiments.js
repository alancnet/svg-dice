const { rateLimit, rateMeasure, sample, rotateAroundWorldAxis } = require('./util')
const THREE = require('./three')
const dice = require('./dice')
const {
  PerspectiveCamera,
  Vector2,
  Scene
} = THREE

document.addEventListener('DOMContentLoaded', () => {
  const size = new Vector2(2000, 2000)
  const camera = new PerspectiveCamera(30, size.x / size.y, 0.1, 10)
  camera.position.z = 1

  const scene = new Scene()

  const gimble = new THREE.Object3D()
  scene.add(gimble)

  gimble.add(dice.d20({size: .1}))

  {
    const light = new THREE.PointLight(0xffffff, 1, 100)
    light.position.set(10, 10, 10)

    const helper = new THREE.PointLightHelper(light)

    gimble.add(light)
    gimble.add(helper)
  }

  {
    const light = new THREE.PointLight(0xffffff, 1, 100)
    light.position.set(-10, -10, -10)

    const helper = new THREE.PointLightHelper(light)

    gimble.add(light)
    gimble.add(helper)
  }


  // const geometry = dice.d20({size: .1})//new THREE.BoxGeometry(0.2, 0.2, 0.2)
  // const material = new THREE.MeshNormalMaterial()

//  const mesh = new THREE.Mesh(geometry, material)
//  gimble.add(mesh)



  if (false) {
    const loader = new THREE.FontLoader()
    loader.load('three/examples/fonts/droid/droid_sans_regular.typeface.json', font => {
      console.log(font)
      geometry.faces.forEach((face, i) => {
        const textGeo = new THREE.TextGeometry( (i + 1).toString(), {
          font: font,
          size: .040,
          height: .01,
          curveSegments: 12,
          bevelEnabled: false,
          bevelThickness: 10,
          bevelSize: 8,
          bevelSegments: 5
        });
    
        const textMesh = new THREE.Mesh(
          textGeo,
          new THREE.MeshNormalMaterial()
        )
        
        const center = new THREE.Vector3
        textGeo.computeBoundingBox()
        textGeo.boundingBox.getSize(center)
        center.multiplyScalar(.5)
        const pos =
          new THREE.Vector3()
          .add(geometry.vertices[face.a])
          .add(geometry.vertices[face.b])
          .add(geometry.vertices[face.c])
          .divideScalar(3)
        const lookAt = pos.clone().multiplyScalar(20)
        const nrm = pos.clone().normalize()
        // textMesh.rotateX(nrm.x)
        // textMesh.rotateY(nrm.y)
        // textMesh.rotateZ(nrm.z)
        textMesh.lookAt(pos)
        textMesh.translateX(-center.x)
        textMesh.translateY(-center.y)
        textMesh.translateZ(-center.z)
        textMesh.translateX(pos.x)
        textMesh.translateY(pos.y)
        textMesh.translateZ(pos.z)
        gimble.add(textMesh)
  
      })
  
    })
  }

  renderer = new THREE.WebGLRenderer({ antialias:true, alpha: true })
  renderer.setSize(size.x, size.y)
  document.body.appendChild(renderer.domElement)

  let saved = localStorage.getItem('rotation')
  if (saved) {
    saved = JSON.parse(saved)
    gimble.rotation.set(saved[0], saved[1], saved[2])
  } else {
    gimble.rotation.y += Math.PI
    gimble.rotation.x += 1.2
  }
  const animate = rateLimit(
    rateMeasure(
      () => {
//        requestAnimationFrame(animate)
        gimble.rotation.x += 0.01;
        gimble.rotation.y += 0.02;
    
        renderer.render(scene, camera)
      },
      sample(rateLimit(perSec => console.log(`${perSec} per sec`)), 1000)
    ),
    1000 / 60
  )
  animate()

  document.addEventListener('contextmenu', ev => {
    //ev.preventDefault()
  })
  document.addEventListener('mousedown', down => {
    let x = down.screenX
    let y = down.screenY
    const mousemove = move => {
      const dx = move.screenX - x
      const dy = move.screenY - y
      x = move.screenX
      y = move.screenY
      requestAnimationFrame(() => {
        if (move.buttons === 1) {
          rotateAroundWorldAxis(gimble, new THREE.Vector3(1, 0, 0), dy * 0.01)
          rotateAroundWorldAxis(gimble, new THREE.Vector3(0, 1, 0), dx * 0.01)
        } else if (move.buttons === 2) {
          rotateAroundWorldAxis(gimble, new THREE.Vector3(0, 0, 1), -dx * 0.01)
        }
        // gimble.rotation.x += dy * 0.01
        // gimble.rotation.y += dx * 0.01
        renderer.render(scene, camera)
      })
    }
    const mouseup = up => {
      window.removeEventListener('mousemove', mousemove)
      window.removeEventListener('mouseup', mouseup)
      localStorage.setItem('rotation', JSON.stringify([
        gimble.rotation.x,
        gimble.rotation.y,
        gimble.rotation.z
      ]))
    }
    window.addEventListener('mousemove', mousemove)
    window.addEventListener('mouseup', mouseup)
  })
})