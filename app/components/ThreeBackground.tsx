'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const particlesRef = useRef<THREE.Points | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 30
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create particles for a floating particle effect
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 2000
    const posArray = new Float32Array(particlesCount * 3)
    const colorsArray = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Spread particles in a wide area
      posArray[i] = (Math.random() - 0.5) * 100 // x
      posArray[i + 1] = (Math.random() - 0.5) * 100 // y
      posArray[i + 2] = (Math.random() - 0.5) * 50 // z

      // Light emerald/teal colors for particles
      colorsArray[i] = 0.06 + Math.random() * 0.1 // r (dark green)
      colorsArray[i + 1] = 0.6 + Math.random() * 0.2 // g (bright green)
      colorsArray[i + 2] = 0.5 + Math.random() * 0.2 // b (teal)
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3))

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })

    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)
    particlesRef.current = particles

    // Add floating geometric shapes
    const shapesGroup = new THREE.Group()
    
    // Create some floating icosahedrons
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.IcosahedronGeometry(Math.random() * 2 + 1, 0)
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x10b981),
        wireframe: true,
        transparent: true,
        opacity: 0.15
      })
      const mesh = new THREE.Mesh(geometry, material)
      
      mesh.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20
      )
      
      mesh.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01
        },
        floatSpeed: Math.random() * 0.02 + 0.01,
        floatOffset: Math.random() * Math.PI * 2
      }
      
      shapesGroup.add(mesh)
    }
    
    scene.add(shapesGroup)

    // Mouse interaction
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)

      // Smooth camera movement based on mouse
      targetX += (mouseX * 2 - targetX) * 0.02
      targetY += (mouseY * 2 - targetY) * 0.02
      
      camera.position.x = targetX
      camera.position.y = targetY
      camera.lookAt(scene.position)

      // Rotate particles slowly
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.0003
        particlesRef.current.rotation.x += 0.0001
      }

      // Animate floating shapes
      shapesGroup.children.forEach((mesh) => {
        const typedMesh = mesh as THREE.Mesh & {
          userData: {
            rotationSpeed: { x: number; y: number }
            floatSpeed: number
            floatOffset: number
          }
        }
        
        typedMesh.rotation.x += typedMesh.userData.rotationSpeed.x
        typedMesh.rotation.y += typedMesh.userData.rotationSpeed.y
        
        // Floating motion
        typedMesh.position.y += Math.sin(Date.now() * typedMesh.userData.floatSpeed + typedMesh.userData.floatOffset) * 0.01
      })

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return
      
      cameraRef.current.aspect = window.innerWidth / window.innerHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
      
      particlesGeometry.dispose()
      particlesMaterial.dispose()
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  )
}