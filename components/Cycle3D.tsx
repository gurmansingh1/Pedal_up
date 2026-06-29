'use client'
import { useEffect, useRef } from 'react'

export default function Cycle3D() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return
    const container = mountRef.current
    let animFrameId: number
    let renderer: any, scene: any, camera: any
    let bikeGroup: any, riderGroup: any
    let frontWheel: any, rearWheel: any, pedalGroup: any
    let leftLegUpper: any, leftLegLower: any, rightLegUpper: any, rightLegLower: any
    let leftArmUpper: any, leftArmLower: any, rightArmUpper: any, rightArmLower: any

    // Scroll state
    let scrollProgress = 0
    let lastScrollY = 0
    let isScrolling = false
    let scrollTimer: ReturnType<typeof setTimeout>

    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
    script.onload = () => {
      const THREE = (window as any).THREE

      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100)
      camera.position.set(0, 1.0, 7.5)
      camera.lookAt(0, 0.6, 0)

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(container.clientWidth, container.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.outputEncoding = THREE.sRGBEncoding
      container.appendChild(renderer.domElement)

      // ── Materials ──────────────────────────────────────────────────────
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.18, metalness: 0.85 })
      const accentMat = new THREE.MeshStandardMaterial({ color: 0x2F855A, roughness: 0.2, metalness: 0.7 })
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0xCCCBC8, roughness: 0.05, metalness: 0.95 })
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x2A2622, roughness: 0.88, metalness: 0.05 })
      const rimMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.12, metalness: 0.9 })
      const saddleMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7, metalness: 0.15 })

      // Rider materials
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xD4A574, roughness: 0.8, metalness: 0.0 })
      const shirtMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.7, metalness: 0.1 })
      const pantsMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.75, metalness: 0.1 })
      const shoesMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85, metalness: 0.05 })
      const helmetMat = new THREE.MeshStandardMaterial({ color: 0x2F855A, roughness: 0.4, metalness: 0.3 })
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x93C5FD, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.7 })
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x1C1917, roughness: 0.9, metalness: 0.0 })

      // ── Helpers ────────────────────────────────────────────────────────
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

      const createWheel = () => {
        const group = new THREE.Group()
        const tire = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.115, 18, 52), tireMat)
        tire.castShadow = true
        group.add(tire)
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.032, 10, 52), rimMat)
        group.add(rim)
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.2, 16), chromeMat)
        hub.rotation.x = Math.PI / 2
        group.add(hub)
        for (let i = 0; i < 9; i++) {
          const angle = (i / 9) * Math.PI * 2
          const sx = Math.cos(angle) * 0.08, sy = Math.sin(angle) * 0.08
          const ex = Math.cos(angle) * 0.72, ey = Math.sin(angle) * 0.72
          group.add(createTube([sx, sy, 0], [ex, ey, 0], 0.016, chromeMat))
        }
        group.rotation.y = Math.PI / 2
        return group
      }

      // ── Bike Group ─────────────────────────────────────────────────────
      bikeGroup = new THREE.Group()

      rearWheel = createWheel()
      rearWheel.position.set(-1.25, 0, 0)
      bikeGroup.add(rearWheel)

      frontWheel = createWheel()
      frontWheel.position.set(1.25, 0, 0)
      bikeGroup.add(frontWheel)

      // Frame
      bikeGroup.add(createTube([-1.25, 0.0, 0], [0, 0.2, 0], 0.048, frameMat))
      bikeGroup.add(createTube([-1.25, 0.0, 0], [-0.5, 1.25, 0], 0.042, accentMat))
      bikeGroup.add(createTube([0, 0.2, 0], [-0.5, 1.25, 0], 0.055, frameMat))
      bikeGroup.add(createTube([-0.5, 1.25, 0], [1.0, 1.15, 0], 0.055, frameMat))
      bikeGroup.add(createTube([0, 0.2, 0], [1.0, 0.6, 0], 0.065, frameMat))
      bikeGroup.add(createTube([1.0, 0.6, 0.08], [1.25, 0.0, 0.08], 0.038, chromeMat))
      bikeGroup.add(createTube([1.0, 0.6, -0.08], [1.25, 0.0, -0.08], 0.038, chromeMat))
      bikeGroup.add(createTube([1.0, 0.6, 0], [1.0, 1.15, 0], 0.07, frameMat))

      // Saddle
      const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.07, 0.22), saddleMat)
      seatMesh.position.set(-0.52, 1.35, 0)
      bikeGroup.add(seatMesh)
      const seatNose = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.28, 8), saddleMat)
      seatNose.position.set(-0.18, 1.34, 0)
      seatNose.rotation.z = Math.PI / 2
      bikeGroup.add(seatNose)
      bikeGroup.add(createTube([-0.78, 1.28, 0.06], [-0.18, 1.28, 0.06], 0.013, chromeMat))
      bikeGroup.add(createTube([-0.78, 1.28, -0.06], [-0.18, 1.28, -0.06], 0.013, chromeMat))

      // Handlebar
      bikeGroup.add(createTube([1.0, 1.15, 0], [1.0, 1.48, 0], 0.04, chromeMat))
      bikeGroup.add(createTube([1.0, 1.48, 0], [1.12, 1.48, 0], 0.04, chromeMat))
      bikeGroup.add(createTube([1.12, 1.48, -0.32], [1.12, 1.48, 0.32], 0.03, frameMat))
      bikeGroup.add(createTube([1.12, 1.48, 0.32], [1.12, 1.22, 0.32], 0.03, frameMat))
      bikeGroup.add(createTube([1.12, 1.48, -0.32], [1.12, 1.22, -0.32], 0.03, frameMat))
      const gripGeo = new THREE.CylinderGeometry(0.044, 0.044, 0.14, 10)
      const gripR = new THREE.Mesh(gripGeo, saddleMat)
      gripR.rotation.z = Math.PI / 2
      gripR.position.set(1.12, 1.22, 0.32)
      bikeGroup.add(gripR)
      const gripL = new THREE.Mesh(gripGeo, saddleMat)
      gripL.rotation.z = Math.PI / 2
      gripL.position.set(1.12, 1.22, -0.32)
      bikeGroup.add(gripL)

      // Bottom bracket & cranks
      const bb = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.24, 16), frameMat)
      bb.rotation.x = Math.PI / 2
      bb.position.set(0, 0.1, 0)
      bikeGroup.add(bb)

      pedalGroup = new THREE.Group()
      pedalGroup.position.set(0, 0.1, 0)
      pedalGroup.add(createTube([0, 0, 0.12], [0.45, 0, 0.12], 0.04, accentMat))
      pedalGroup.add(createTube([0, 0, -0.12], [-0.45, 0, -0.12], 0.04, accentMat))
      const pedalGeo = new THREE.BoxGeometry(0.22, 0.04, 0.1)
      const pedalR = new THREE.Mesh(pedalGeo, saddleMat)
      pedalR.position.set(0.45, 0, 0.12)
      pedalGroup.add(pedalR)
      const pedalL = new THREE.Mesh(pedalGeo, saddleMat)
      pedalL.position.set(-0.45, 0, -0.12)
      pedalGroup.add(pedalL)
      bikeGroup.add(pedalGroup)

      const chainRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.024, 8, 32), accentMat)
      chainRing.rotation.x = Math.PI / 2
      chainRing.position.set(0, 0.1, 0.13)
      bikeGroup.add(chainRing)

      bikeGroup.position.set(0, -0.1, 0)
      scene.add(bikeGroup)

      // ── Rider Group ────────────────────────────────────────────────────
      riderGroup = new THREE.Group()

      // Pelvis / hip (pivot)
      const hipPivot = new THREE.Group()
      hipPivot.position.set(-0.52, 1.42, 0)
      riderGroup.add(hipPivot)

      // Torso
      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.55, 6, 12), shirtMat)
      torso.position.set(0.1, 0.40, 0)
      torso.rotation.z = -0.22
      torso.castShadow = true
      hipPivot.add(torso)

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.165, 16, 16), skinMat)
      head.position.set(0.38, 0.98, 0)
      head.castShadow = true
      hipPivot.add(head)

      // Hair
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.168, 16, 16), hairMat)
      hair.position.set(0.36, 1.04, 0)
      hair.scale.set(1, 0.65, 1)
      hipPivot.add(hair)

      // Helmet
      const helmetBase = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16), helmetMat)
      helmetBase.position.set(0.38, 0.98, 0)
      helmetBase.scale.set(1, 0.75, 1)
      hipPivot.add(helmetBase)

      // Visor/glasses
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.24), glassMat)
      visor.position.set(0.55, 0.95, 0)
      visor.rotation.z = 0.1
      hipPivot.add(visor)

      // Face features - nose
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), skinMat)
      nose.position.set(0.55, 0.96, 0)
      hipPivot.add(nose)

      // ── Right Arm (front-side, closer to handlebars) ──
      const rArmPivot = new THREE.Group()
      rArmPivot.position.set(0.22, 0.7, 0.22)
      hipPivot.add(rArmPivot)

      rightArmUpper = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.28, 4, 8), shirtMat)
      rightArmUpper.position.set(0.15, -0.15, 0)
      rightArmUpper.rotation.z = -0.55
      rightArmUpper.rotation.x = 0.2
      rightArmUpper.castShadow = true
      rArmPivot.add(rightArmUpper)

      rightArmLower = new THREE.Mesh(new THREE.CapsuleGeometry(0.046, 0.26, 4, 8), skinMat)
      rightArmLower.position.set(0.4, -0.28, 0)
      rightArmLower.rotation.z = -1.4
      rightArmLower.rotation.x = 0.15
      rightArmLower.castShadow = true
      rArmPivot.add(rightArmLower)

      // ── Left Arm (back-side) ──
      const lArmPivot = new THREE.Group()
      lArmPivot.position.set(0.22, 0.7, -0.22)
      hipPivot.add(lArmPivot)

      leftArmUpper = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.28, 4, 8), shirtMat)
      leftArmUpper.position.set(0.15, -0.15, 0)
      leftArmUpper.rotation.z = -0.55
      leftArmUpper.rotation.x = -0.2
      leftArmUpper.castShadow = true
      lArmPivot.add(leftArmUpper)

      leftArmLower = new THREE.Mesh(new THREE.CapsuleGeometry(0.046, 0.26, 4, 8), skinMat)
      leftArmLower.position.set(0.4, -0.28, 0)
      leftArmLower.rotation.z = -1.4
      leftArmLower.rotation.x = -0.15
      leftArmLower.castShadow = true
      lArmPivot.add(leftArmLower)

      // ── Right Leg (front-side, z = 0.12 to match crank) ──
      const rLegPivot = new THREE.Group()
      rLegPivot.position.set(0, 0, 0.18)
      hipPivot.add(rLegPivot)

      rightLegUpper = new THREE.Group()
      rLegPivot.add(rightLegUpper)

      const rThigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.42, 4, 10), pantsMat)
      rThigh.position.set(0, -0.22, 0)
      rThigh.castShadow = true
      rightLegUpper.add(rThigh)

      rightLegLower = new THREE.Group()
      rightLegLower.position.set(0, -0.44, 0)
      rightLegUpper.add(rightLegLower)

      const rShin = new THREE.Mesh(new THREE.CapsuleGeometry(0.062, 0.38, 4, 10), pantsMat)
      rShin.position.set(0, -0.2, 0)
      rShin.castShadow = true
      rightLegLower.add(rShin)

      const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.085, 0.12), shoesMat)
      rShoe.position.set(0.06, -0.42, 0)
      rShoe.castShadow = true
      rightLegLower.add(rShoe)

      // ── Left Leg (back-side, z = -0.12) ──
      const lLegPivot = new THREE.Group()
      lLegPivot.position.set(0, 0, -0.18)
      hipPivot.add(lLegPivot)

      leftLegUpper = new THREE.Group()
      lLegPivot.add(leftLegUpper)

      const lThigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.42, 4, 10), pantsMat)
      lThigh.position.set(0, -0.22, 0)
      lThigh.castShadow = true
      leftLegUpper.add(lThigh)

      leftLegLower = new THREE.Group()
      leftLegLower.position.set(0, -0.44, 0)
      leftLegUpper.add(leftLegLower)

      const lShin = new THREE.Mesh(new THREE.CapsuleGeometry(0.062, 0.38, 4, 10), pantsMat)
      lShin.position.set(0, -0.2, 0)
      lShin.castShadow = true
      leftLegLower.add(lShin)

      const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.085, 0.12), shoesMat)
      lShoe.position.set(0.06, -0.42, 0)
      lShoe.castShadow = true
      leftLegLower.add(lShoe)

      scene.add(riderGroup)

      // ── Lights ──────────────────────────────────────────────────────
      const ambient = new THREE.AmbientLight(0xfdf6ee, 1.4)
      scene.add(ambient)

      const keyLight = new THREE.DirectionalLight(0xfff8f0, 3.2)
      keyLight.position.set(5, 8, 4)
      keyLight.castShadow = true
      keyLight.shadow.mapSize.set(2048, 2048)
      scene.add(keyLight)

      const fillLight = new THREE.DirectionalLight(0xd4e8ff, 1.4)
      fillLight.position.set(-5, 2, -2)
      scene.add(fillLight)

      const rimLight = new THREE.DirectionalLight(0xffffff, 0.7)
      rimLight.position.set(0, -2, -5)
      scene.add(rimLight)

      const accentLight = new THREE.PointLight(0x2F855A, 1.5, 8)
      accentLight.position.set(-1, 2, 2)
      scene.add(accentLight)

      // ── Scroll tracking ─────────────────────────────────────────────
      const handleScroll = () => {
        const heroEl = document.getElementById('hero-section')
        if (!heroEl) return
        const heroHeight = heroEl.offsetHeight
        scrollProgress = Math.min(window.scrollY / heroHeight, 1)
        isScrolling = true
        clearTimeout(scrollTimer)
        scrollTimer = setTimeout(() => { isScrolling = false }, 80)
      }
      window.addEventListener('scroll', handleScroll, { passive: true })

      // ── Resize ──────────────────────────────────────────────────────
      const onResize = () => {
        if (!container) return
        camera.aspect = container.clientWidth / container.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(container.clientWidth, container.clientHeight)
      }
      window.addEventListener('resize', onResize)

      // ── Animate loop ────────────────────────────────────────────────
      const animate = () => {
        animFrameId = requestAnimationFrame(animate)

        // Scroll-driven pedal angle (full rotation over scroll)
        const pedalAngle = scrollProgress * Math.PI * 8  // multiple rotations

        // Right leg follows pedal (right crank is at 0.12 Z, starts at top)
        const rCrankAngle = pedalAngle
        // Crank positions relative to BB center
        const rCrankX = Math.sin(rCrankAngle) * 0.45   // forward/back
        const rCrankY = Math.cos(rCrankAngle) * 0.45   // up/down (0.1 + this)

        // Right thigh angle: from hip to pedal
        const rHipToKnee = Math.atan2(rCrankX + 0.52, -(rCrankY - 1.32))
        rightLegUpper.rotation.z = rHipToKnee - 0.1

        // Right shin angle: knee to pedal
        const rKneeAngle = Math.max(-2.2, Math.min(-0.2, rHipToKnee * 1.4))
        rightLegLower.rotation.z = rKneeAngle

        // Left leg: opposite phase
        const lCrankAngle = pedalAngle + Math.PI
        const lCrankX = Math.sin(lCrankAngle) * 0.45
        const lCrankY = Math.cos(lCrankAngle) * 0.45

        const lHipToKnee = Math.atan2(lCrankX + 0.52, -(lCrankY - 1.32))
        leftLegUpper.rotation.z = lHipToKnee - 0.1
        const lKneeAngle = Math.max(-2.2, Math.min(-0.2, lHipToKnee * 1.4))
        leftLegLower.rotation.z = lKneeAngle

        // Wheel and pedal group rotation
        const wheelRot = pedalAngle * 0.85
        if (frontWheel) frontWheel.rotation.x = wheelRot
        if (rearWheel) rearWheel.rotation.x = wheelRot
        if (pedalGroup) pedalGroup.rotation.x = pedalAngle

        // Bike + rider translate right as scroll increases
        const translateX = scrollProgress * 5.5
        bikeGroup.position.x = translateX
        riderGroup.position.x = translateX

        // Slight subtle body lean/breath when idle
        if (!isScrolling && scrollProgress < 0.05) {
          const t = Date.now() * 0.001
          riderGroup.position.y = Math.sin(t * 0.7) * 0.018
          bikeGroup.position.y = -0.1 + Math.sin(t * 0.7) * 0.018
        }

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
      style={{ width: '100%', height: '100%' }}
    />
  )
}
