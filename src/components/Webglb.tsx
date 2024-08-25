
import { useEffect, useState, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export const displayGLB = (container: HTMLDivElement, glbArrayBuffer: ArrayBuffer) => {
    const glbBlob = new Blob([glbArrayBuffer], { type: 'model/gltf-binary' })
    const url = URL.createObjectURL(glbBlob)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer()

    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)
        
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(1, 1, 1).normalize()
    scene.add(directionalLight)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.25
    controls.enableZoom = true

    const loader = new GLTFLoader()
    loader.load(url, (gltf) => {
        const model = gltf.scene
        scene.add(model)
        model.position.set(0, 0, 0)
        camera.position.z = 2 // zoom
        
        const animate = () => {
            requestAnimationFrame(animate)
            model.rotation.y += 0.01 // rotation speed
            renderer.render(scene, camera)
        }
        animate()
    }, undefined, (error) => {
        console.error('An error happened while loading the GLB:', error)
    })

    const resizeHandler = () => {
        camera.aspect = container.clientWidth / container.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(container.clientWidth, container.clientHeight)
    }

    window.addEventListener('resize', resizeHandler)
    resizeHandler()

    return () => {
        window.removeEventListener('resize', resizeHandler)
        URL.revokeObjectURL(url)
    }
}

export const GLBViewer = ({ id }: { id: string }) => {
    const gridRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let cleanUp: (() => void) | undefined

        const fetchGLB = async () => {
            const response = await fetch(`/uploads/${id}`)
            const arrayBuffer = await response.arrayBuffer()
            if (gridRef.current) {
                cleanUp = displayGLB(gridRef.current, arrayBuffer);
            }
        }
        fetchGLB()

        return () => {
            if (cleanUp) cleanUp()
        }
    }, [id])

    return <div ref={gridRef} className='w-full rounded-md border bg-muted aspect-square overflow-hidden' />
}