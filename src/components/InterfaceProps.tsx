interface EngineProps {
    engine: string
}

interface PromptSchemaProps extends EngineProps {
    setPrompt: (prompt: string) => void
}

interface NegativePromptSchemaProps {
    setNegative: (negative: string) => void
}

interface RadioSchemaProps {
    title: string
    setData: (data: string) => void
    data: string[]
    description: string
}

interface RatioAspectSchemaProps {
    title: string
    setData: (data: string) => void
    data: string[]
}

interface DalleDTO extends 
PromptSchemaProps
{
    setSize: (size: string) => void
    setStyle: (style: string) => void
    setQuality: (quality: string) => void
}

interface StableImageDTO extends 
PromptSchemaProps,
NegativePromptSchemaProps
{
    setRatio: (ratio: string) => void
    setFormat: (format: string) => void
    setStylePreset: (stylePreset: string) => void
}

interface SliderSchemaProps {
    id: string
    title: string
    data: number
    max: number
    step: number
    sliderChange: (value: number[]) => void
    description: string
}

// 3D VIDEO
interface Stable3DVideoProps extends EngineProps{
    active: boolean
    setActive: (active: boolean) => void
    handleDrop: (e: React.DragEvent<HTMLLabelElement>) => void
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    preview: string
    setPreview: (preview: string) => void
    setTextureResolution: (resolution: string) => void
    foregroundRatio: number
    setForegroundRatio: (foregroundRatio: number) => void
    cfgScale: number
    setCfgScale: (cfgScale: number) => void
    motionBucket: number
    setMotionBucket: (motionBucket: number) => void
}