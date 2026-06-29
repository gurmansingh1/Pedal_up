'use client'
import { useEffect, useRef } from 'react'

export default function Cycle3D() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return
    const container = mountRef.current
    let animFrameId: number
    let renderer: any, scene: any, camera: any, bikeGroup: any
    let frontWheel: any, rearWheel: any, pedalGroup: any
    let isDragging = false
    let previousMouseX = 0
    let targetRotationY = 0.4
    let currentRotationY = 0.4
    let targetRotationX = 0
    let currentRotationX = 0

    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
    script.onload = () => {
      const THREE = (window as any).THREE

      // Scene
      scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(0x0a0a0a, 0.08)

      // Camera
      camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100)
      camera.position.set(0, 0.5, 5.5)

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(container.clientWidth, container.clientHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.outputEncoding = THREE.sRGBEncoding
      container.appendChild(renderer.domElement)

      // Materials
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0xc5f135,
        roughness: 0.15,
        metalness: 0.9,
        emissive: 0x1a2200,
        emissiveIntensity: 0.3,
      })
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5, metalness: 0.7 })
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.05, metalness: 1.0 })
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9, metalness: 0.1 })
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xc5f135, roughness: 0.1, metalness: 1.0 })
      const saddleMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.6, metalness: 0.3 })

      bikeGroup = new THREE.Group()

      // Helper to create a tube between two points
      const createTube = (from: number[], to: number[], radius: number, mat: any) => {
        const start = new THREE.Vector3(...from)
        const end = new THREE.Vector3(...to)
        const dir = new THREE.Vector3().subVectors(end, start)
        const length = dir.length()
        const geo = new THREE.CylinderGeometry(radius, radius, length, 8)
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.copy(start).addScaledVector(dir.normalize(), length / 2)
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
        mesh.castShadow = true
        return mesh
      }

      // Create wheel
      const createWheel = (x: number) => {
        const group = new THREE.Group()
        // Tire (torus)
        const tireGeo = new THREE.TorusGeometry(0.85, 0.11, 16, 48)
        const tire = new THREE.Mesh(tireGeo, tireMat)
        tire.castShadow = true
        group.add(tire)
        // Rim
        const rimGeo = new THREE.TorusGeometry(0.72, 0.035, 10, 48)
        const rim = new THREE.Mesh(rimGeo, rimMat)
        group.add(rim)
        // Hub
        const hubGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.18, 16)
        const hub = new THREE.Mesh(hubGeo, chromeMat)
        hub.rotation.x = Math.PI / 2
        group.add(hub)
        // Spokes (8 per wheel)
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2
          const sx = Math.cos(angle) * 0.08
          const sy = Math.sin(angle) * 0.08
          const ex = Math.cos(angle) * 0.72
          const ey = Math.sin(angle) * 0.72
          const spoke = createTube([sx, sy, 0], [ex, ey, 0], 0.018, chromeMat)
          group.add(spoke)
        }
        group.rotation.y = Math.PI / 2
        group.position.x = x
        return group
      }

      // Wheels
      rearWheel = createWheel(0)
      rearWheel.position.set(-1.25, 0, 0)
      bikeGroup.add(rearWheel)

      frontWheel = createWheel(0)
      frontWheel.position.set(1.25, 0, 0)
      bikeGroup.add(frontWheel)

      // --- Frame tubes ---
      // Bottom bracket position: (0, 0.1, 0)
      // Rear dropout: (-1.25, 0, 0)
      // Front dropout: (1.25, 0, 0)
      // Top tube: from seat post top to head tube top
      // Seat post / top: (−0.5, 1.2, 0)
      // Head tube top: (1.0, 1.15, 0)
      // Head tube bottom: (1.0, 0.55, 0)

      // Chain stay (rear)
      bikeGroup.add(createTube([-1.25, 0.0, 0], [0, 0.2, 0], 0.05, darkMat))
      // Seat stay (rear top)
      bikeGroup.add(createTube([-1.25, 0.0, 0], [-0.5, 1.25, 0], 0.04, frameMat))
      // Seat tube (vertical)
      bikeGroup.add(createTube([0, 0.2, 0], [-0.5, 1.25, 0], 0.055, frameMat))
      // Top tube
      bikeGroup.add(createTube([-0.5, 1.25, 0], [1.0, 1.15, 0], 0.055, frameMat))
      // Down tube
      bikeGroup.add(createTube([0, 0.2, 0], [1.0, 0.6, 0], 0.065, frameMat))
      // Fork (two blades)
      bikeGroup.add(createTube([1.0, 0.6, 0.08], [1.25, 0.0, 0.08], 0.04, chromeMat))
      bikeGroup.add(createTube([1.0, 0.6, -0.08], [1.25, 0.0, -0.08], 0.04, chromeMat))
      // Head tube
      bikeGroup.add(createTube([1.0, 0.6, 0], [1.0, 1.15, 0], 0.07, darkMat))

      // --- Saddle ---
      const saddleGeo = new THREE.BoxGeometry(0.55, 0.06, 0.2)
      saddleGeo.translate(-0.04, 0, 0)
      const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.07, 0.22), saddleMat)
      seatMesh.position.set(-0.52, 1.34, 0)
      seatMesh.rotation.z = 0.03
      seatMesh.castShadow = true
      bikeGroup.add(seatMesh)
      // Seat nose
      const noseGeo = new THREE.ConeGeometry(0.06, 0.25, 8)
      const seatNose = new THREE.Mesh(noseGeo, saddleMat)
      seatNose.position.set(-0.2, 1.33, 0)
      seatNose.rotation.z = Math.PI / 2
      seatNose.castShadow = true
      bikeGroup.add(seatNose)
      // Saddle rails
      bikeGroup.add(createTube([-0.75, 1.28, 0.06], [-0.2, 1.28, 0.06], 0.015, chromeMat))
      bikeGroup.add(createTube([-0.75, 1.28, -0.06], [-0.2, 1.28, -0.06], 0.015, chromeMat))

      // --- Handlebar stem & bars ---
      bikeGroup.add(createTube([1.0, 1.15, 0], [1.0, 1.45, 0], 0.04, chromeMat))
      bikeGroup.add(createTube([1.0, 1.45, 0], [1.1, 1.45, 0], 0.04, chromeMat))
      // Drop bars (curved feel with two pieces)
      bikeGroup.add(createTube([1.1, 1.45, -0.3], [1.1, 1.45, 0.3], 0.03, darkMat))
      bikeGroup.add(createTube([1.1, 1.45, 0.3], [1.1, 1.2, 0.3], 0.03, darkMat))
      bikeGroup.add(createTube([1.1, 1.45, -0.3], [1.1, 1.2, -0.3], 0.03, darkMat))
      // Grips
      const gripGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.15, 10)
      const gripL = new THREE.Mesh(gripGeo, saddleMat)
      gripL.rotation.z = Math.PI / 2
      gripL.position.set(1.1, 1.2, 0.3)
      bikeGroup.add(gripL)
      const gripR = new THREE.Mesh(gripGeo, saddleMat)
      gripR.rotation.z = Math.PI / 2
      gripR.position.set(1.1, 1.2, -0.3)
      bikeGroup.add(gripR)

      // --- Bottom bracket & cranks ---
      const bbGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.22, 16)
      const bb = new THREE.Mesh(bbGeo, darkMat)
      bb.rotation.x = Math.PI / 2
      bb.position.set(0, 0.1, 0)
      bikeGroup.add(bb)

      pedalGroup = new THREE.Group()
      pedalGroup.position.set(0, 0.1, 0)
      // Right crank
      const crankR = createTube([0, 0, 0.11], [0.45, 0, 0.11], 0.04, frameMat)
      pedalGroup.add(crankR)
      // Left crank (opposite)
      const crankL = createTube([0, 0, -0.11], [-0.45, 0, -0.11], 0.04, frameMat)
      pedalGroup.add(crankL)
      // Pedals
      const pedalGeo = new THREE.BoxGeometry(0.22, 0.04, 0.1)
      const pedalR = new THREE.Mesh(pedalGeo, darkMat)
      pedalR.position.set(0.45, 0, 0.11)
      pedalGroup.add(pedalR)
      const pedalL = new THREE.Mesh(pedalGeo, darkMat)
      pedalL.position.set(-0.45, 0, -0.11)
      pedalGroup.add(pedalL)
      bikeGroup.add(pedalGroup)

      // Chain ring
      const chainRingGeo = new THREE.TorusGeometry(0.3, 0.025, 8, 32)
      const chainRing = new THREE.Mesh(chainRingGeo, rimMat)
      chainRing.rotation.x = Math.PI / 2
      chainRing.position.set(0, 0.1, 0.12)
      bikeGroup.add(chainRing)

      // Position bike group
      bikeGroup.position.set(0, -0.1, 0)
      scene.add(bikeGroup)

      // --- Lights ---
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
      scene.add(ambientLight)

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.5)
      keyLight.position.set(4, 6, 5)
      keyLight.castShadow = true
      keyLight.shadow.mapSize.set(2048, 2048)
      scene.add(keyLight)

      const fillLight = new THREE.DirectionalLight(0xc5f135, 0.8)
      fillLight.position.set(-5, 2, -3)
      scene.add(fillLight)

      const rimLight = new THREE.DirectionalLight(0x80aaff, 0.5)
      rimLight.position.set(0, -3, -5)
      scene.add(rimLight)

      const accentLight = new THREE.PointLight(0xc5f135, 2, 5)
      accentLight.position.set(0, 2, 2)
      scene.add(accentLight)

      // Ground glow (plane)
      const glowGeo = new THREE.PlaneGeometry(6, 2)
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xc5f135,
        transparent: true,
        opacity: 0.04,
        depthWrite: false,
      })
      const glow = new THREE.Mesh(glowGeo, glowMat)
      glow.rotation.x = -Math.PI / 2
      glow.position.y = -0.9
      scene.add(glow)

      // --- Mouse drag ---
      const onMouseDown = (e: MouseEvent) => {
        isDragging = true
        previousMouseX = e.clientX
      }
      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return
        const delta = e.clientX - previousMouseX
        targetRotationY += delta * 0.01
        previousMouseX = e.clientX
      }
      const onMouseUp = () => { isDragging = false }
      const onTouchStart = (e: TouchEvent) => { isDragging = true; previousMouseX = e.touches[0].clientX }
      const onTouchMove = (e: TouchEvent) => {
        if (!isDragging) return
        targetRotationY += (e.touches[0].clientX - previousMouseX) * 0.012
        previousMouseX = e.touches[0].clientX
      }
      const onTouchEnd = () => { isDragging = false }

      renderer.domElement.addEventListener('mousedown', onMouseDown)
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
      renderer.domElement.addEventListener('touchstart', onTouchStart)
      window.addEventListener('touchmove', onTouchMove)
      window.addEventListener('touchend', onTouchEnd)

      // Resize
      const onResize = () => {
        if (!container) return
        camera.aspect = container.clientWidth / container.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(container.clientWidth, container.clientHeight)
      }
      window.addEventListener('resize', onResize)

      // Animate
      const clock = new THREE.Clock()
      const animate = () => {
        animFrameId = requestAnimationFrame(animate)
        const elapsed = clock.getElapsedTime()

        // Auto-rotate when not dragging
        if (!isDragging) {
          targetRotationY += 0.004
        }
        // Gentle bob
        targetRotationX = Math.sin(elapsed * 0.4) * 0.04

        // Smooth lerp
        currentRotationY += (targetRotationY - currentRotationY) * 0.05
        currentRotationX += (targetRotationX - currentRotationX) * 0.05

        bikeGroup.rotation.y = currentRotationY
        bikeGroup.rotation.x = currentRotationX

        // Spin wheels and pedals
        const wheelSpeed = 1.5
        if (frontWheel) frontWheel.rotation.x = elapsed * wheelSpeed
        if (rearWheel) rearWheel.rotation.x = elapsed * wheelSpeed
        if (pedalGroup) pedalGroup.rotation.x = elapsed * 0.8

        // Pulsing accent light
        accentLight.intensity = 1.5 + Math.sin(elapsed * 2) * 0.5

        renderer.render(scene, camera)
      }
      animate()
    }
    document.head.appendChild(script)

    return () => {
      cancelAnimationFrame(animFrameId)
      if (renderer) {
        renderer.dispose()
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
      }
      if (script.parentNode) script.parentNode.removeChild(script)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        cursor: 'grab',
      }}
    />
  )
}
