import { 
    PromptSchema, 
    RatioAspectSchema,
    RadioSchema,
} from '@/components/Schema'

const Dalle:React.FC<DalleDTO> = ({ 
    setPrompt, engine, setSize, setStyle, setQuality
}) => {
    const styleData = [ 'Vivid', 'Natural' ]
    const qualityData = [ 'Standard', 'HD' ]
    const ratioSizeData = engine.includes('dall-e-3') ? [ '1024x1024', '1792x1024', '1024x1792' ] : [ '256x256', '512x512', '1024x1024' ]
    return (
        <>
        <PromptSchema setPrompt={setPrompt} engine={engine} />
        <RatioAspectSchema title='사이즈' setData={setSize} data={ratioSizeData} />
        {
            engine.includes('dall-e-3') && (
                <>
                <RadioSchema title='스타일' setData={setStyle} data={styleData} />
                <RadioSchema title='품질' setData={setQuality} data={qualityData} />
                </>
            )
        }
        </>
    )
}

export default Dalle