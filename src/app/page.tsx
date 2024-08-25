/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import axios from 'axios'
import { Download, Trash2 } from 'lucide-react'
import Loading from '@/components/Loding'
import { displayGLB, GLBViewer } from '@/components/Webglb'
import { 
    openAIHeaders, 
    stabilityHeaders, 
    stability3DHeaders, 
    PostStabilityVideoHeaders, 
    GetStabilityVideoHeaders 
} from '@/components/HeaderAPI'
import Models from '@/components/Models'
import Dalle from '@/components/Dalle'
import StableImage from '@/components/StableImage'
import Stable3DVideo from '@/components/Stable3DVideo'
import ScrollTop from '@/components/ScrollTop'
import { arrayBufferToBase64, arrayBufferToBlob, convertBufferImage } from '@/components/ArrayBuffer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function Home() {
    const [loading, setLoding] = useState(true)
    const [active, setActive] = useState(false)
    const [create3d, setCreate3d] = useState(false)
    const [engine, setEngine] = useState('dall-e-3')
    const [prompt, setPrompt] = useState('')
    const [negative, setNegative] = useState('')
    const [ratio, setRatio] = useState('')
    const [size, setSize] = useState('')
    const [format, setFormat] = useState('')
    const [quality, setQuality] = useState('')
    const [style, setStyle] = useState('')
    const [stylePreset, setStylePreset] = useState('')
    const [file, setFile] = useState<File>()
    const [textureResolution, setTextureResolution] = useState('')
    const [foregroundRatio, setForegroundRatio] = useState<number>(0.85)
    const [credit, setCredit] = useState('')
    const [revised, setRevised] = useState('')
    const [list, setList] = useState<string[]>([])
    const [generatedImage, setGeneratedImage] = useState('')
    const [preview, setPreview] = useState('')
    const [cfgScale, setCfgScale] = useState<number>(1.8)
    const [motionBucket, setMotionBucket] = useState<number>(127)
    const [video, setVideo] = useState<Blob | null>(null)
    const [isOpen, setIsOpen] = useState<{ [key: string]: boolean }>({})
    const containerRef = useRef<HTMLDivElement>(null)
    
    useEffect(() => {
        const fetchData = async () => {
            const url = `https://api.stability.ai/v1/user/balance`
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_STABILITY_AI_KEY}`,
                    'Content-Type': 'application/json'
                },
            })
            
            if (!response.ok) {
                throw new Error(`Non-200 response: ${await response.text()}`)
            }
    
            const data = await response.json()
            setCredit(data.credits)
        }

        if (engine.includes('sd')) fetchData()
    }, [ engine ])

    useEffect(() => {
        fetchList()
    }, [])

    const fetchList = async () => {
        try {
            const response = await fetch('/api/data')
            const data = await response.json()
            setList(data.data)
            setLoding(false)
        } catch (error) {
            console.error('Error fetching images:', error)
        }
    }

    const handleGenerate = async () => {
        let modelAPI = ''
        let options = {}
        let payload
        
        if (!engine.includes('3d') && !engine.includes('video') && prompt == '') {
            alert('프롬프트를 입력해 주세요.')
            return
        }

        const setOpenAIPayload = () => ({
            model: engine,
            prompt: prompt,
            n: 1,
            size: size,
            quality: quality,
            style: style,
            response_format: 'b64_json'
        })
    
        const setStabilityPayload = () => {
            const formData = new FormData()
            formData.append('mode', 'text-to-image')
            formData.append('model', engine)
            formData.append('prompt', prompt)
            formData.append('negative_prompt', negative)
            formData.append('aspect_ratio', ratio)
            if (stylePreset) formData.append('style_preset', stylePreset)
            formData.append('output_format', format)
            return formData
        }
    
        const setStability3DPayload = () => {
            if (!file) {
                alert('파일을 선택하세요.')
                return
            }  
            const formData = new FormData()
            formData.append('image', file)
            formData.append('texture_resolution', textureResolution)
            formData.append('foreground_ratio', foregroundRatio.toString())
            console.log(formData)
            return formData
        }

        const setStabilityVideoPayload = () => {
            if (!file) {
                alert('파일을 선택하세요.')
                return
            }  
            const formData = new FormData()
            console.log(file)
            formData.append('image', file)
            formData.append('cfg_scale', cfgScale.toString())
            formData.append('motion_bucket_id', motionBucket.toString())
            return formData
        }

        switch (true) {
            case engine.includes('dall-e'):
                modelAPI = 'https://api.openai.com/v1/images/generations'
                options = openAIHeaders()
                payload = setOpenAIPayload()
                break
            case engine.includes('sd3'):
            case engine.includes('core'):
                modelAPI = `https://api.stability.ai/v2beta/stable-image/generate/${engine.includes('sd3') ? 'sd3' : 'core'}`
                options = stabilityHeaders()
                payload = setStabilityPayload()
                break
            case engine.includes('3d'):
                modelAPI = 'https://api.stability.ai/v2beta/3d/stable-fast-3d'
                options = stability3DHeaders()
                payload = setStability3DPayload()
                break
            case engine.includes('video'):
                modelAPI = 'https://api.stability.ai/v2beta/image-to-video'
                options = PostStabilityVideoHeaders()
                payload = setStabilityVideoPayload()
                break
            default:
                alert('유효하지 않은 엔진입니다.')
                return
        }
        
        try {
            console.log(modelAPI)
            console.log(payload)
            setLoding(true)
            setCreate3d(false)
            setGeneratedImage('')
            const response = await axios.post(modelAPI, payload, options)
            
            if (response.status === 200) {
                console.log( response )
                let baseImage
                if (engine.includes('video')) {
                    let isComplete = false
                    while (!isComplete) {
                        modelAPI = `https://api.stability.ai/v2beta/image-to-video/result/${response.data.id}`
                        options = GetStabilityVideoHeaders()
                        const result = await axios.get(modelAPI, options)
                        try {
                            if (result.status === 202) {
                                console.log('Generation is still running, try again in 1 seconds.')
                                await new Promise((resolve) => setTimeout(resolve, 1000))
                              } else if (result.status === 200) {
                                console.log(result)
                                isComplete = true
                                const blob = arrayBufferToBlob(result.data, 'video/mp4')
                                setVideo(blob)
                                handleUpload(blob)
                                setTimeout(() => {
                                    fetchList()
                                }, 3000)
                            }
                        } catch (err) {
                            console.error('Error fetching video')
                            break
                        }
                    }
                } else if (engine.includes('3d')) {
                    setCreate3d(true)
                    const glbArrayBuffer = response.data as ArrayBuffer
                    baseImage = URL.createObjectURL(new Blob([glbArrayBuffer], { type: 'model/gltf-binary' }))                
                    setTimeout(() => {
                        if (containerRef.current) displayGLB(containerRef.current, glbArrayBuffer)
                    }, 100)
                } else {
                    if (engine.includes('sd')) {
                        baseImage = `data:image/jpeg;base64,${arrayBufferToBase64(response.data)}`
                    } else {
                        baseImage = `data:image/jpeg;base64,${response.data.data[0].b64_json}`
                        setRevised(response.data.data[0]?.revised_prompt)
                    } 
                    setGeneratedImage(baseImage)    
                }
                handleUpload(baseImage)
                setTimeout(() => {
                    fetchList()
                }, 3000)
            } else {
                throw new Error(`${response.status}: ${response.data.toString()}`)
            }
        } catch (error) {
            setLoding(false)
            console.error('Error generating image:', error)
        } 
    }

    const handleUpload = async (baseImage: any) => {
        try {
            const formData = new FormData()
            if (engine.includes('video')) {
                formData.append('image', new File([baseImage], 'generated-video.mp4', { type: baseImage.type }))
            } else {
                const blob = await (await fetch(baseImage)).blob()
                if (engine.includes('3d')) {
                    formData.append('image', new File([blob], 'generated-image.glb', { type: blob.type }))
                } else {
                    formData.append('image', new File([blob], 'generated-image.png', { type: blob.type }))
                }
            }

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()
            if (result.success) {
                console.log(`Image uploaded successfully: ${result.filename}`)
                const data = {
                    'id': result.filename,
                    'model': engine,
                    'prompt': prompt,
                    'negative_prompt': negative,
                    'revised_prompt': revised,
                    'aspect_ratio': ratio,
                    'output_format': format,
                    'size': size,
                    'quality': quality,
                    'style': style,
                    'style_preset': stylePreset,
                    'texture_resolution': textureResolution,
                    'foreground_ratio': foregroundRatio,
                    'cfg_scale': cfgScale,
                    'motion_bucket_id': motionBucket
                }
                const res = await fetch('/api/data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                })
            } else {
                console.log('Image upload failed')
            }
        } catch (error) {
            console.error('Error uploading image:', error)
        }
    }

    const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        const file = engine.includes('video') ? await convertBufferImage(e.dataTransfer.files[0]) : e.dataTransfer.files[0]
        if (file) {
            setFile(file)
            setActive(false)
            handlePreview(file)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = engine.includes('video') ? await convertBufferImage(e.target.files?.[0]) : e.target.files?.[0]
        if (file) {
            setFile(file)
            handlePreview(file)
        }
    }
    
    const handlePreview = (file: Blob | MediaSource) => {
        const image = URL.createObjectURL(file)
        setPreview(image)
    }

    const handleOpenDialog = (id: string) => {
        setIsOpen(prev => ({
            ...prev,
            [id]: true,
        }))
    }

    const handleCloseDialog = (id: string) => {
        setIsOpen(prev => ({
            ...prev,
            [id]: false,
        }))
    }

    const handleDelete = async (id: string) => {
        setLoding(true)
        try {
            const response = await fetch('/api/data', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            })
    
            const result = await response.json()
            if (result) {
                handleCloseDialog(id)
                setTimeout(() => {
                    setGeneratedImage('')
                    setCreate3d(false)
                    setVideo(null)
                    fetchList()
                }, 2000)
            } else {
                alert(`Error: ${result.message}`)
                setLoding(false)
            }
        } catch (error) {
            console.error('Error deleting file:', error)
            alert('삭제하지 못하였습니다.')
            setLoding(false)
        }
    }

    const handleDownload = (id: string) => {
        const fileUrl = `/uploads/${id}`
        const link = document.createElement('a')
        link.href = fileUrl
        link.download = ''

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <>
        {
            <div className='h-full flex-col md:flex'>
                <div className='container max-w-screen-lg flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16'>
                <h2 className='text-lg font-semibold whitespace-nowrap'>GEN AI</h2>
                <div className='ml-auto flex w-full space-x-2 sm:justify-end'>
                    <Button onClick={ handleGenerate }>생성하기</Button>
                </div>
                </div>
                <Separator />
                <div className='container h-full py-6 max-w-screen-lg'>
                    <div className='grid h-full items-stretch'>
                        <div className='flex flex-col space-y-4'>
                            <div className='grid h-full gap-6 grid-cols-2'>
                                <div>
                                    <div className='rounded-md overflow-hidden'>
                                        { 
                                            generatedImage ? (<Image src={ generatedImage } alt='Generated Image' className='w-full rounded-md' width={100} height={100} />) 
                                            : create3d ? (
                                                <div className='w-full aspect-square rounded-md' ref={containerRef}></div>
                                            ) : video ? (
                                                <video src={URL.createObjectURL(video)} controls muted />
                                            ) : (<img src='./default.svg' alt='' className='w-full h-full object-cover rounded-md opacity-30' />) 
                                        }
                                    </div>
                                </div>
                                <div className='flex flex-col space-y-4'>
                                    <Models engine={engine} setEngine={setEngine} credit={credit} />
                                    {
                                        engine.includes('3d') || engine.includes('video') ? (
                                            <Stable3DVideo 
                                                engine={engine}
                                                active={active}
                                                setActive={setActive} 
                                                handleDrop={handleDrop}
                                                handleFileChange={handleFileChange}
                                                preview={preview}
                                                setPreview={setPreview}
                                                setTextureResolution={setTextureResolution}
                                                foregroundRatio={foregroundRatio}
                                                setForegroundRatio={setForegroundRatio}
                                                cfgScale={cfgScale}
                                                setCfgScale={setCfgScale}
                                                motionBucket={motionBucket}
                                                setMotionBucket={setMotionBucket}
                                            />
                                        ) : engine.includes('sd') ? (
                                            <StableImage 
                                            engine={engine}
                                            setPrompt={setPrompt}
                                            setNegative={setNegative}
                                            setRatio={setRatio}
                                            setStylePreset={setStylePreset}  
                                            setFormat={setFormat}
                                            />
                                        ) : (
                                            <Dalle 
                                            setPrompt={setPrompt} 
                                            engine={engine} 
                                            setSize={setSize} 
                                            setStyle={setStyle}
                                            setQuality={setQuality}
                                            />
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                { loading && <Loading /> }
                <Separator />
                <div className='container pb-4 py-6 relative max-w-screen-lg'>
                    <ul className='columns-3'>
                        {
                        list?.map((item: any, i) => (
                            <>
                            {
                                item.id.endsWith('.glb') ? (
                                    <li 
                                    key={ i }
                                    className='relative block w-full mb-4'
                                    >
                                        <div className='absolute top-1 left-2'>
                                            <Badge>{ item.model }</Badge>
                                        </div>
                                        <div className='absolute top-2 right-2 z-[10]'>
                                            <Button className='p-2 h-auto ml-1' onClick={ () => handleDownload(item.id) }>
                                                <Download className='w-4 h-4' />
                                            </Button>
                                            <Button className='p-2 h-auto ml-1' onClick={ () => handleDelete(item.id) }>
                                                <Trash2 className='w-4 h-4' />
                                            </Button>
                                        </div>
                                        <GLBViewer id={item.id} />
                                    </li>
                                ) : item.id.endsWith('.mp4') ? (
                                    <li 
                                    key={ i }
                                    className='relative block w-full mb-4'
                                    >
                                        <div className='absolute top-1 left-2'>
                                            <Badge>{ item.model }</Badge>
                                        </div>
                                        <div className='absolute top-2 right-2 z-[10]'>
                                            <Button className='p-2 h-auto ml-1' onClick={ () => handleDownload(item.id) }>
                                                <Download className='w-4 h-4' />
                                            </Button>
                                            <Button className='p-2 h-auto ml-1' onClick={ () => handleDelete(item.id) }>
                                                <Trash2 className='w-4 h-4' />
                                            </Button>
                                        </div>
                                        <video 
                                        src={`/uploads/${ item.id }`} 
                                        className='w-full rounded-md border bg-muted overflow-hidden'
                                        controls muted 
                                        />
                                    </li>
                                ) : (
                                    <Dialog
                                    open={!!isOpen[item.id]}
                                    onOpenChange={(isOpen) => {
                                        if (isOpen) {
                                            handleOpenDialog(item.id)
                                        } else {
                                            handleCloseDialog(item.id)
                                        }
                                    }}
                                    >
                                        <DialogTrigger>
                                        <li 
                                        key={ i }
                                        className='relative block w-full mb-4'
                                        >
                                            <div className='absolute top-1 left-2'>
                                                <Badge>{ item.model }</Badge>
                                            </div>
                                            <Image 
                                                className='w-full rounded-md border bg-muted overflow-hidden'
                                                src={`/uploads/${ item.id }`}
                                                width={ 800 }
                                                height={ 800 }
                                                quality= { 100 }
                                                alt=''
                                            />
                                        </li>
                                        </DialogTrigger>
                                        <DialogContent className='max-h-[calc(100vh_-_2rem)] overflow-y-auto'>
                                            <DialogHeader>
                                                <DialogTitle>{ item.model }</DialogTitle>
                                                <DialogDescription>
                                                    {
                                                        item.id.endsWith('.glb') ? (
                                                            <GLBViewer id={item. id} />
                                                        ) : (
                                                            <Image 
                                                                className='w-full rounded-md border bg-muted overflow-hidden'
                                                                src={`/uploads/${ item.id }`}
                                                                width={ 800 }
                                                                height={ 800 }
                                                                quality= { 100 }
                                                                alt=''
                                                            />
                                                        )
                                                    }
                                                </DialogDescription>
                                                { item.prompt && (
                                                    <DialogDescription>
                                                        <span className='font-semibold'>프롬프트:</span> { item.prompt }
                                                    </DialogDescription>
                                                ) }
                                                { (item.negative_prompt && item.model.includes('sd')) && (
                                                    <DialogDescription>
                                                        <span className='font-semibold'>네거티브 프롬프트:</span> { item.negative_prompt }
                                                    </DialogDescription>
                                                ) }
                                                { (item.revised_prompt && item.model.includes('dall-e')) && (
                                                    <DialogDescription>
                                                        <span className='font-semibold'>실제 프롬프트:</span> { item.revised_prompt }
                                                    </DialogDescription>
                                                ) }
                                                { (item.aspect_ratio && item.model.includes('sd')) && (
                                                    <DialogDescription>
                                                        <span className='font-semibold'>비율:</span> { item.aspect_ratio }
                                                    </DialogDescription>
                                                ) }
                                                { (item.size && item.model.includes('dall-e')) && (
                                                    <DialogDescription>
                                                        <span className='font-semibold'>사이즈:</span> { item.size }
                                                    </DialogDescription>
                                                ) }   
                                                { (item.style && item.model.includes('dall-e')) && (
                                                    <DialogDescription>
                                                        <span className='font-semibold'>스타일:</span> { item.style }
                                                    </DialogDescription>
                                                ) }   
                                                { (item.style_preset && item.model.includes('core')) && (
                                                    <DialogDescription>
                                                        <span className='font-semibold'>스타일:</span> { item.style_preset }
                                                    </DialogDescription>
                                                ) }             
                                                { (item.quality && item.model.includes('dall-e')) && (
                                                    <DialogDescription>
                                                        <span className='font-semibold'>품질:</span> { item.quality }
                                                    </DialogDescription>
                                                ) } 
                                            </DialogHeader>
                                            <Button className='w-full' onClick={ () => handleDownload(item.id) }>다운로드</Button>
                                            <Button className='w-full' onClick={ () => handleDelete(item.id) }>삭제</Button>
                                        </DialogContent>
                                    </Dialog>
                                    )
                                }
                            </>
                            ))
                        }
                    </ul>
                </div>
                <ScrollTop />
                <p className='text-sm text-center py-6 opacity-50'>© 2024 GEN AI.</p>
            </div>
        }
        </>
    )
}

