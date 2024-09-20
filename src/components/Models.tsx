import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel
} from '@/components/ui/select'

interface ModelsProps {
    engine: string
    setEngine: (engine: string) => void
    credit: number
}

const Models: React.FC<ModelsProps> = ({ engine, setEngine, credit }) => {
    return (
        <div className='flex flex-col space-y-2'>
            <Label className='flex justify-between'>
                모델
                { engine.includes('sd') && <span>credits : { credit }</span> }
            </Label>
            <Select
                defaultValue={ engine }
                onValueChange={ (model: any) => setEngine(model) }
            >
                <SelectTrigger className='w-full'>
                    <SelectValue placeholder={ engine } />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>OPEN AI</SelectLabel>
                        <SelectItem value='dall-e-3'>Dall-e-3</SelectItem>
                        <SelectItem value='dall-e-2'>Dall-e-2</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                        <SelectLabel>Stability AI</SelectLabel>
                        <SelectItem value='sd-core'>SD Image Core (3 credits)</SelectItem>
                        <SelectItem value='sd3-medium'>SD3 Medium (3.5 credits)</SelectItem>
                        <SelectItem value='sd3-large'>SD3 Large (6.5 credits)</SelectItem>
                        <SelectItem value='sd3-large-turbo'>SD3 Large Turbo (4 credits)</SelectItem>
                        <SelectItem value='sd-3d'>Stable Fast 3D (2 credits)</SelectItem>
                        <SelectItem value='sd-video'>Stable Video Diffusion (20 credits)</SelectItem>
                    </SelectGroup>
                    </SelectContent>
            </Select>
        </div>
    )
}

export default Models