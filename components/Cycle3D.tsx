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
    let accentLight: any
    let targetRotationY = -0.3
    let currentRotationY = -0.3
    let isDragging = false
    let previousMouseX = 0
    let mouseX = 0
    let mouseY = 0
    let targetCamX = 0
    let targetCamY = 0.5

    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
    script.onload = () => {
      const THREE = (window as any).THREE

      // Scene
      scene = new THREE.Scene()

      // Camera
      camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100)
      camera.position.set(0, 0.5, 5.8)

      // Renderer — transparent background to match page
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(container.clientWidth, container.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.outputEncoding = THREE.sRGBEncoding
      container.appendChild(renderer.domElement)

      // ── Materials (light palette) ──────────────────────────────────────
      // Frame: deep charcoal / dark graphite
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x1F2937,
        roughness: 0.18,
        metalness: 0.85,
      })
      // Accent parts: forest green (#2F855A)
      const accentMat = new THREE.MeshStandardMaterial({
        color: 0x2F855A,
        roughness: 0.2,
        metalness: 0.7,
      })
      // Chrome / silver
      const chromeMat = new THREE.MeshStandardMaterial({
        color: 0xCCCBC8,
        roughness: 0.05,
        metalness: 0.95,
      })
      // Tires: near-black with slight warm undertone
      const tireMat = new THREE.MeshStandardMaterial({
        color: 0x2A2622,
        roughness: 0.88,
        metalness: 0.05,
      })
      // Rim: charcoal accent
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x1F2937,
        roughness: 0.12,
        metalness: 0.9,
      })
      // Saddle/grips: deep matte
      const saddleMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.7,
        metalness: 0.15,
      })

      bikeGroup = new THREE.Group()

      // Helper — tube between two points
      const createTube = (from: number[], to: number[], radius: number, mat: any) => {
        const start = new THREE.Vector3(...from)
        const end = new THREE.Vector3(...to)
        const dir = new THREE.Vector3().subVectors(end, start)
        const length = dir.length()
        const geo = new THREE.CylinderGeometry(radius, radius, length, 10)
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.copy(start).addScaledVector(dir.normalize(), length / 2)
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
        mesh.castShadow = true
        return mesh
      }

      // Helper — wheel
      const createWheel = () => {
        const group = new THREE.Group()
        // Tire (torus)
        const tire = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.115, 18, 52), tireMat)
        tire.castShadow = true
        group.add(tire)
        // Rim
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.032, 10, 52), rimMat)
        group.add(rim)
        // Hub
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.2, 16), chromeMat)
        hub.rotation.x = Math.PI / 2
        group.add(hub)
        // Spokes
        for (let i = 0; i < 9; i++) {
          const angle = (i / 9) * Math.PI * 2
          const sx = Math.cos(angle) * 0.08
          const sy = Math.sin(angle) * 0.08
          const ex = Math.cos(angle) * 0.72
          const ey = Math.sin(angle) * 0.72
          group.add(createTube([sx, sy, 0], [ex, ey, 0], 0.016, chromeMat))
        }
        group.rotation.y = Math.PI / 2
        return group
      }

      // Wheels
      rearWheel = createWheel()
      rearWheel.position.set(-1.25, 0, 0)
      bikeGroup.add(rearWheel)

      frontWheel = createWheel()
      frontWheel.position.set(1.25, 0, 0)
      bikeGroup.add(frontWheel)

      // ── Frame ─────────────────────────────────────────────────────────
      bikeGroup.add(createTube([-1.25, 0.0, 0], [0, 0.2, 0], 0.048, frameMat))      // chain stay
      bikeGroup.add(createTube([-1.25, 0.0, 0], [-0.5, 1.25, 0], 0.042, accentMat)) // seat stay
      bikeGroup.add(createTube([0, 0.2, 0], [-0.5, 1.25, 0], 0.055, frameMat))      // seat tube
      bikeGroup.add(createTube([-0.5, 1.25, 0], [1.0, 1.15, 0], 0.055, frameMat))  // top tube
      bikeGroup.add(createTube([0, 0.2, 0], [1.0, 0.6, 0], 0.065, frameMat))       // down tube
      bikeGroup.add(createTube([1.0, 0.6, 0.08], [1.25, 0.0, 0.08], 0.038, chromeMat)) // fork R
      bikeGroup.add(createTube([1.0, 0.6, -0.08], [1.25, 0.0, -0.08], 0.038, chromeMat)) // fork L
      bikeGroup.add(createTube([1.0, 0.6, 0], [1.0, 1.15, 0], 0.07, frameMat))     // head tube

      // ── Saddle ───────────────────────────────────────────────────────
      const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.07, 0.22), saddleMat)
      seatMesh.position.set(-0.52, 1.35, 0)
      seatMesh.castShadow = true
      bikeGroup.add(seatMesh)
      const seatNose = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.28, 8), saddleMat)
      seatNose.position.set(-0.18, 1.34, 0)
      seatNose.rotation.z = Math.PI / 2
      bikeGroup.add(seatNose)
      // Saddle rails
      bikeGroup.add(createTube([-0.78, 1.28, 0.06], [-0.18, 1.28, 0.06], 0.013, chromeMat))
      bikeGroup.add(createTube([-0.78, 1.28, -0.06], [-0.18, 1.28, -0.06], 0.013, chromeMat))

      // ── Handlebar ────────────────────────────────────────────────────
      bikeGroup.add(createTube([1.0, 1.15, 0], [1.0, 1.48, 0], 0.04, chromeMat))   // stem vertical
      bikeGroup.add(createTube([1.0, 1.48, 0], [1.12, 1.48, 0], 0.04, chromeMat))  // stem reach
      bikeGroup.add(createTube([1.12, 1.48, -0.32], [1.12, 1.48, 0.32], 0.03, frameMat)) // bar
      bikeGroup.add(createTube([1.12, 1.48, 0.32], [1.12, 1.22, 0.32], 0.03, frameMat)) // bar drop R
      bikeGroup.add(createTube([1.12, 1.48, -0.32], [1.12, 1.22, -0.32], 0.03, frameMat)) // bar drop L
      // Grips
      const gripGeo = new THREE.CylinderGeometry(0.044, 0.044, 0.14, 10)
      const gripR = new THREE.Mesh(gripGeo, saddleMat)
      gripR.rotation.z = Math.PI / 2
      gripR.position.set(1.12, 1.22, 0.32)
      bikeGroup.add(gripR)
      const gripL = new THREE.Mesh(gripGeo, saddleMat)
      gripL.rotation.z = Math.PI / 2
      gripL.position.set(1.12, 1.22, -0.32)
      bikeGroup.add(gripL)

      // ── Bottom bracket & cranks ───────────────────────────────────────
      const bb = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.24, 16), frameMat)
      bb.rotation.x = Math.PI / 2
      bb.position.set(0, 0.1, 0)
      bikeGroup.add(bb)

      pedalGroup = new THREE.Group()
      pedalGroup.position.set(0, 0.1, 0)
      pedalGroup.add(createTube([0, 0, 0.12], [0.45, 0, 0.12], 0.04, accentMat))   // crank R
      pedalGroup.add(createTube([0, 0, -0.12], [-0.45, 0, -0.12], 0.04, accentMat)) // crank L
      const pedalGeo = new THREE.BoxGeometry(0.22, 0.04, 0.1)
      const pedalR = new THREE.Mesh(pedalGeo, saddleMat)
      pedalR.position.set(0.45, 0, 0.12)
      pedalGroup.add(pedalR)
      const pedalL = new THREE.Mesh(pedalGeo, saddleMat)
      pedalL.position.set(-0.45, 0, -0.12)
      pedalGroup.add(pedalL)
      bikeGroup.add(pedalGroup)

      // Chain ring
      const chainRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.024, 8, 32), accentMat)
      chainRing.rotation.x = Math.PI / 2
      chainRing.position.set(0, 0.1, 0.13)
      bikeGroup.add(chainRing)

      bikeGroup.position.set(0, -0.1, 0)
      scene.add(bikeGroup)

      // ── Lights ────────────────────────────────────────────────────────
      const ambient = new THREE.AmbientLight(0xfdf6ee, 1.2)
      scene.add(ambient)

      // Warm key light (top-right, simulates natural window light)
      const keyLight = new THREE.DirectionalLight(0xfff8f0, 3.0)
      keyLight.position.set(5, 7, 4)
      keyLight.castShadow = true
      keyLight.shadow.mapSize.set(2048, 2048)
      scene.add(keyLight)

      // Cool fill from left
      const fillLight = new THREE.DirectionalLight(0xd4e8ff, 1.2)
      fillLight.position.set(-5, 2, -2)
      scene.add(fillLight)

      // Subtle rim/back light
      const rimLight = new THREE.DirectionalLight(0xffffff, 0.6)
      rimLight.position.set(0, -2, -5)
      scene.add(rimLight)

      // Green accent point light (subtle)
      accentLight = new THREE.PointLight(0x2F855A, 1.5, 6)
      accentLight.position.set(-1, 1.5, 2)
      scene.add(accentLight)

      // ── Mouse interaction ─────────────────────────────────────────────
      const onMouseDown = (e: MouseEvent) => {
        isDragging = true
        previousMouseX = e.clientX
      }
      const onMouseMove = (e: MouseEvent) => {
        // Track mouse position for parallax
        const rect = container.getBoundingClientRect()
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2
        mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2

        if (!isDragging) return
        const delta = e.clientX - previousMouseX
        targetRotationY += delta * 0.008
        previousMouseX = e.clientX
      }
      const onMouseUp = () => { isDragging = false }

      const onTouchStart = (e: TouchEvent) => {
        isDragging = true
        previousMouseX = e.touches[0].clientX
      }
      const onTouchMove = (e: TouchEvent) => {
        if (!isDragging) return
        targetRotationY += (e.touches[0].clientX - previousMouseX) * 0.01
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

      // ── Animate loop ──────────────────────────────────────────────────
      const clock = new THREE.Clock()
      const animate = () => {
        animFrameId = requestAnimationFrame(animate)
        const elapsed = clock.getElapsedTime()

        // Auto-rotate slowly when not dragging
        if (!isDragging) {
          targetRotationY += 0.003
        }

        // Smooth lerp rotation
        currentRotationY += (targetRotationY - currentRotationY) * 0.04

        bikeGroup.rotation.y = currentRotationY
        // Gentle vertical sway
        bikeGroup.rotation.x = Math.sin(elapsed * 0.35) * 0.02
        bikeGroup.position.y = -0.1 + Math.sin(elapsed * 0.5) * 0.04

        // Camera parallax from mouse (subtle)
        targetCamX = mouseX * 0.25
        targetCamY = 0.5 + mouseY * -0.15
        camera.position.x += (targetCamX - camera.position.x) * 0.03
        camera.position.y += (targetCamY - camera.position.y) * 0.03
        camera.lookAt(0, 0.3, 0)

        // Spin wheels and pedals in sync with auto-rotate
        const wheelSpeed = 1.2
        if (frontWheel) frontWheel.rotation.x = elapsed * wheelSpeed
        if (rearWheel) rearWheel.rotation.x = elapsed * wheelSpeed
        if (pedalGroup) pedalGroup.rotation.x = elapsed * 0.7

        // Subtle accent light pulse
        if (accentLight) accentLight.intensity = 1.2 + Math.sin(elapsed * 1.8) * 0.3

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
