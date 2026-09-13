'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

/**
 * Ambient 3D background: a GPU-shader particle galaxy with a wireframe core,
 * additive glow sprites and mouse parallax. Fully disposed on unmount.
 */
export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ---------- renderer ----------
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400)
    camera.position.set(0, 2, 34)

    // ---------- custom shader particles (the main galaxy) ----------
    const COUNT = 5200
    const RADIUS = 46
    const pos = new Float32Array(COUNT * 3)
    const rnd = new Float32Array(COUNT)
    const scale = new Float32Array(COUNT)
    const tint = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      // ball-ish distribution, denser towards center
      const r = RADIUS * Math.pow(Math.random(), 0.72)
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * (6 + 30 * (r / RADIUS))
      pos[i * 3] = Math.cos(theta) * r
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = Math.sin(theta) * r
      rnd[i] = Math.random() * Math.PI * 2
      scale[i] = Math.random()
      tint[i] = Math.random()
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    pGeo.setAttribute('aRandom', new THREE.BufferAttribute(rnd, 1))
    pGeo.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))
    pGeo.setAttribute('aTint', new THREE.BufferAttribute(tint, 1))
    const pMat = new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        attribute float aRandom;
        attribute float aScale;
        attribute float aTint;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uSize;
        varying float vAlpha;
        varying float vTint;

        void main() {
          vec3 p = position;

          // gentle wave through the field
          p.x += sin(uTime * 0.18 + aRandom * 2.0) * 1.2;
          p.y += cos(uTime * 0.14 + aRandom * 3.0) * 0.9;
          p.z += sin(uTime * 0.10 + aRandom * 4.0) * 1.2;

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float dist = -mv.z;
          gl_PointSize = uSize * aScale * (34.0 / dist);
          gl_PointSize = min(gl_PointSize, 9.0);

          // particles closer to the mouse sway away slightly
          vec4 world = modelMatrix * vec4(p, 1.0);
          float md = distance(world.xy, uMouse * 18.0);
          vAlpha = smoothstep(46.0, 10.0, dist) * (0.35 + 0.65 * smoothstep(40.0, 6.0, md));
          vTint = aTint;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vAlpha;
        varying float vTint;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float glow = pow(1.0 - d * 2.0, 2.2);
          vec3 mint  = vec3(0.30, 1.00, 0.75);
          vec3 teal  = vec3(0.00, 0.83, 0.67);
          vec3 white = vec3(0.88, 1.00, 0.95);
          vec3 col = mix(teal, mint, vTint);
          col = mix(col, white, glow * 0.55);
          gl_FragColor = vec4(col, glow * vAlpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uSize: { value: 22 * Math.min(window.devicePixelRatio, 2) }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    // ---------- wireframe icosahedron core ----------
    const coreGeo = new THREE.IcosahedronGeometry(9, 1)
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x22d3a5, wireframe: true, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, depthWrite: false
    })
    const core = new THREE.Mesh(coreGeo, coreMat)
    core.position.set(6, 0, -14)
    scene.add(core)

    // ---------- additive glow sprites ----------
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(45, 212, 168, 0.9)')
    g.addColorStop(0.4, 'rgba(45, 212, 168, 0.25)')
    g.addColorStop(1, 'rgba(45, 212, 168, 0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    const glowTex = new THREE.CanvasTexture(c)

    const glowMat = new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.8 })
    const glows: THREE.Sprite[] = []
    const glowCfg: Array<[number, number, number, number]> = [
      [-26, 8, -30, 40], [30, -6, -34, 34], [0, -14, -20, 26], [14, 16, -40, 44]
    ]
    for (const [x, y, z, s] of glowCfg) {
      const sp = new THREE.Sprite(glowMat)
      sp.position.set(x, y, z)
      sp.scale.setScalar(s)
      scene.add(sp)
      glows.push(sp)
    }

    // ---------- postprocessing ----------
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.55, 0.75, 0.72)
    composer.addPass(bloom)

    // ---------- interaction state ----------
    const target = { x: 0, y: 0 }
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1
      target.x = mouse.current.x * 3.2
      target.y = mouse.current.y * 1.6
    }
    const onScroll = () => {
      const p = Math.min(window.scrollY / (document.body.scrollHeight - window.innerHeight || 1), 1)
      particles.rotation.y = p * 0.7
      core.rotation.z = p * 1.2
      camera.position.z = 34 - p * 6
    }
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      composer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    // ---------- animation loop ----------
    const clock = new THREE.Clock()
    let running = true
    const speed = prefersReduced ? 0 : 1
    let simT = 0
    const onVisibility = () => { running = document.visibilityState === 'visible' }
    document.addEventListener('visibilitychange', onVisibility)

    const animate = () => {
      if (running) {
        simT += clock.getDelta() * speed
        pMat.uniforms.uTime.value = simT
        pMat.uniforms.uMouse.value.set(mouse.current.x, -mouse.current.y)

        particles.rotation.y += 0.0006 * speed
        core.rotation.x += 0.0012 * speed
        core.rotation.y += 0.0008 * speed
        core.position.y = Math.sin(simT * 0.45) * 1.4

        glows.forEach((sp, i) => {
          const s = 1 + Math.sin(simT * (0.5 + i * 0.17) + i * 2) * 0.08 * speed
          sp.scale.setScalar([40, 34, 26, 44][i] * s)
        })

        camera.position.x += (target.x - camera.position.x) * 0.04
        camera.position.y += (2 + target.y - camera.position.y) * 0.04
        camera.lookAt(0, 0, 0)
        composer.render()
      }
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()

    // ---------- cleanup ----------
    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      pGeo.dispose(); pMat.dispose()
      coreGeo.dispose(); coreMat.dispose()
      glowTex.dispose(); glowMat.dispose()
      composer.dispose()
      renderer.dispose()
      if (renderer.domElement.parentElement) renderer.domElement.parentElement.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
