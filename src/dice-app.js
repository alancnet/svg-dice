const THREE = require('./three')

const main = () => {
  const scene = new THREE.Scene
  const size = new THREE.Vector2
  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 10)
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  document.body.appendChild(renderer.domElement)
  const resize = (ev) => {
    size.set(window.innerWidth, window.innerHeight)
    camera.aspect = size.x / size.y
    renderer.setSize(size.x, size.y)
  }

}

module.exports = { main }