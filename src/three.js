const fontJson = require('three/examples/fonts/droid/droid_sans_regular.typeface.json')
const THREE = Object.assign({}, require('three'))
window.THREE = THREE
THREE.Cache.enabled = true
THREE.Cache.files['three/examples/fonts/droid/droid_sans_regular.typeface.json'] = JSON.stringify(fontJson)
require('three/examples/js/renderers/Projector')
require('three/examples/js/renderers/SVGRenderer')
require('three/examples/js/utils/SceneUtils.js')
require('three/examples/js/renderers/CSS3DRenderer.js')
require('three/examples/js/renderers/CSS2DRenderer.js')

module.exports = THREE
