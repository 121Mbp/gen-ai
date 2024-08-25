/* eslint-disable @next/next/no-img-element */
import Image from 'next/image'
import { Trash } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { 
    RadioSchema,
    SliderSchema,
} from '@/components/Schema'

const Stable3DVideo: React.FC<Stable3DVideoProps> = ({ 
    engine,
    active, 
    setActive, 
    handleDrop, 
    handleFileChange, 
    preview, 
    setPreview,
    setTextureResolution, 
    foregroundRatio, 
    setForegroundRatio,
    cfgScale,
    setCfgScale,
    motionBucket,
    setMotionBucket
}) => {
    const handleDragStart = () => setActive(true)
    const handleDragEnd = () => setActive(false)
    const textureResolutionData = [ '1024', '2048', '512' ]

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
    }

    const handleSliderChange = (value: number[]) => {
        setForegroundRatio(value[0])
    }

    const handleSliderCfgChange = (value: number[]) => {
        setCfgScale(value[0])
    }

    const handleSliderMotionChange = (value: number[]) => {
        setMotionBucket(value[0])
    }

    const handlePreviewDelete = () => {
        setPreview('')
    }

    return (
        <>
        <div className='relative'>
            {
                preview && (
                    <Button className='absolute top-1 right-1 p-2 h-auto ml-1 z-[10]' onClick={ () => handlePreviewDelete() }>
                        <Trash className='w-4 h-4' />
                    </Button>
                )
            }
            <label 
                className={`${active ? 'border-zinc-950' : ''} relative flex flex-col h-[200px] w-full items-center justify-center rounded-md border border-dashed cursor-pointer`}
                onDragEnter={ handleDragStart }
                onDragLeave={ handleDragEnd }
                onDragOver={ handleDragOver }
                onDrop={ handleDrop }
            >
                <input type='file' className='file hidden' onChange={ handleFileChange } />
                {
                    preview ? (
                        <Image src={preview} alt='Preview' className='w-auto h-[80%]' width={100} height={100}/>
                    ) : (
                        <span className='p-2 my-2 text-ms text-center text-muted-foreground'>
                            {
                                engine.includes('3d') ? <span>파일 확장자는 [ jpeg, png, webp ]만 가능합니다.</span> : (
                                    <span>
                                        파일 업로드 시 지원하는 확장자[ jpeg, png ]와 <br />
                                        사이즈[ 1024x576, 576x1024, 768x768 ]에 <br />
                                        맞게 변환 및 리사이즈가 이루어 지고 있으므로,<br />
                                        이미지의 상하좌우 일부가 크롭될 수 있습니다.
                                    </span>
                                )
                            }
                        </span>        
                    )
                }
            </label>
        </div>
        {
            engine.includes('3d') ? (
                <>
                <RadioSchema
                    title='텍스처 해상도'
                    setData={setTextureResolution}
                    data={textureResolutionData}
                    description='텍스처의 해상도를 결정합니다. 해상도는 픽셀 단위로 지정되며, 값이 높을수록 텍스처의 세부 수준이 높아져 표면을 더 복잡하고 정확하게 렌더링할 수 있습니다. 그러나 해상도를 높이면 자산 크기도 커져 로딩 시간과 성능에 영향을 미칠 수 있습니다. 1024는 좋은 기본값이며 거의 변경할 필요가 없습니다.'
                />
                <SliderSchema
                    key='foregroundRatio'
                    id='foregroundRatio'
                    title='포그라운드 비율 (기본값 0.85)'
                    data={foregroundRatio}
                    max={1}
                    step={0.01}
                    sliderChange={handleSliderChange}
                    description='프레임 내에서 처리할 객체 주변의 패딩 양을 제어합니다. 이 비율은 전체 프레임 크기에 비해 객체의 상대적 크기를 결정합니다. 비율이 높을수록 패딩이 적고 객체가 커지는 반면 비율이 낮을수록 패딩이 늘어나 프레임 내에서 객체의 크기가 효과적으로 줄어듭니다. 이는 차나 버스와 같이 길고 좁은 객체를 정면(좁은 쪽)에서 볼 때 유용할 수 있습니다. 이 경우 전경 비율을 낮추면 생성된 3D 자산이 뭉개지거나 왜곡되어 보이는 것을 방지하는 데 도움이 될 수 있습니다. 기본값인 0.85는 대부분 객체에 적합합니다.'
                />
                </>
            ) : (
                <>
                <SliderSchema
                    key='cfgScale'
                    id='cfgScale'
                    title='원본 강도 (기본값 1.8)'
                    data={cfgScale}
                    max={10}
                    step={0.1}
                    sliderChange={handleSliderCfgChange}
                    description='비디오가 원본 이미지에 얼마나 강하게 붙어 있는지. 모델이 더 자유롭게 변경할 수 있도록 하려면 낮은 값을 사용하고, 동작 왜곡을 수정하려면 높은 값을 사용합니다.'
                />
                <SliderSchema
                    key='motionBucket'
                    id='motionBucket'
                    title='모션 버킷 (기본값 127)'
                    data={motionBucket}
                    max={255}
                    step={1}
                    sliderChange={handleSliderMotionChange}
                    description='값이 낮을수록 일반적으로 출력 비디오에서 움직임이 적어지고 값이 높을수록 일반적으로 움직임이 많아집니다.'
                />
                </>
            )
        }
        </>
    )
}

export default Stable3DVideo