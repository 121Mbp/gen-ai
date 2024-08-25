import { 
    PromptSchema,
    NegativePromptSchema,
    RatioAspectSchema,
    RadioSchema
} from '@/components/Schema'

const StableImage:React.FC<StableImageDTO> = ({
    engine, setPrompt, setNegative, setRatio, setFormat, setStylePreset
}) => {
    const styleData = [
        'NONE',
        '3d-model', 
        'analog-film', 
        'anime', 
        'cinematic', 
        'comic-book', 
        'digital-art', 
        'enhance', 
        'fantasy-art', 
        'isometric',
        'line-art',
        'low-poly',
        'modeling-compound',
        'neon-punk',
        'origami',
        'photographic',
        'pixel-art',
        'tile-texture'
    ]
    const formatData = engine.includes('core') ? [ 'png', 'jpeg', 'webp' ] : [ 'png', 'jpeg' ]
    const ratioAspectData = [ '1:1', '16:9', '4:5', '5:4', '9:16' ]
    return (
        <>
        <PromptSchema setPrompt={setPrompt} engine={engine} />
        <NegativePromptSchema setNegative={setNegative} />
        <RatioAspectSchema title='비율' setData={setRatio} data={ratioAspectData} />
        {
            engine.includes('core') ? (
                <>
                <RadioSchema title='스타일' setData={setStylePreset} data={styleData} description={''} />
                <RadioSchema title='포맷' setData={setFormat} data={formatData} description={''} />
                </>
                
            ) : (
                <RadioSchema title='포맷' setData={setFormat} data={formatData} description={''} />
            )
        }
        </>
    )
}

export default StableImage