import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

export const PromptSchema:React.FC<PromptSchemaProps> = ({ setPrompt, engine }) => {
    return (
        <div className='flex flex-col space-y-2'>
            <Label htmlFor='prompt'>프롬프트</Label>
            <Textarea
            id='prompt'
            onChange={ (e) => setPrompt(e.target.value) }
            placeholder={ engine.includes('dall-e-3') ? '한글 또는 영어로 작성해 주세요.' : '영어로 작성해 주세요.'}
            />
        </div>
    )
}

export const NegativePromptSchema:React.FC<NegativePromptSchemaProps> = ({ setNegative }) => {
    return (
        <div className='flex flex-col space-y-2'>
            <Label htmlFor='negative'>네거티브 프롬프트</Label>
            <Textarea
            id='negative'
            onChange={ (e) => setNegative(e.target.value) }
            placeholder='영어로 작성해 주세요.'
            />
        </div>
    )
}

export const RadioSchema:React.FC<RadioSchemaProps> = ({ title, setData, data, description }) => {
    const [selectedValue, setSelectedValue] = useState(data[0])

    useEffect(() => {
        setSelectedValue(data[0])
    }, [data])

    return (
        <div className='flex flex-col space-y-2'>
            <RadioGroup 
            defaultValue={selectedValue}
            onValueChange={ (n: any) => setData(n) }
            className=''
            >
                <div className='flex items-center justify-between'>
                    <Label className='flex items-center'>
                        {title}
                        {
                        description && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger><Info className='ml-2' /></TooltipTrigger>
                                    <TooltipContent>
                                    <p className='w-96'>{description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )
                    }
                    </Label>
                </div>
                <div className='grid grid-cols-3 gap-4 '>
                {
                    data?.map((key: any, i: number) => (
                        <>
                        <div key={i}>
                            <RadioGroupItem value={key} id={key} className='peer sr-only' />
                            <Label
                            htmlFor={key}
                            className='flex flex-col items-center justify-between rounded-md text-xs text-center border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer'
                            >{key}</Label>
                        </div>
                        </>
                    ))
                }
                </div>
            </RadioGroup>
        </div>
    )
}

export const RatioAspectSchema:React.FC<RatioAspectSchemaProps> = ({ title, setData, data }) => {
    const [selectedValue, setSelectedValue] = useState(data[0])

    useEffect(() => {
        setSelectedValue(data[0])
    }, [data])
    return (
        <div className='flex flex-col space-y-2'>
            <div className='flex items-center justify-between'>
                <Label>{title}</Label>
            </div>
            <Select
                defaultValue={selectedValue}
                onValueChange={ (aspect: any) => setData(aspect) }
            >
                <SelectTrigger className='w-full'>
                    <SelectValue placeholder='1:1' />
                </SelectTrigger>
                <SelectContent>
                    {
                        data?.map((key: any, i: number) => (
                            <>
                            <SelectItem key={i} value={key}>{key}</SelectItem>
                            </>
                        ))
                    }
                </SelectContent>
            </Select>
        </div>
    )
}

export const SliderSchema: React.FC<SliderSchemaProps> = ({ id, title, data, max, step, sliderChange, description }) => {
    return (
        <div className='grid gap-4 pt-5'>
            <div className='flex items-center justify-between'>
                <Label htmlFor={id} className='flex items-center'>
                    {title}
                    {
                        description && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger><Info className='ml-2' /></TooltipTrigger>
                                    <TooltipContent>
                                    <p className='w-96'>{description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )
                    }
                </Label>
                <span className='rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border'>
                    {data}
                </span>
            </div>
            <Slider
                id={id}
                max={max}
                defaultValue={[data]}
                step={step}
                onValueChange={sliderChange}
                className='[&_[role=slider]]:h-4 [&_[role=slider]]:w-4'
                aria-label={id}
            />
        </div>
    )
}