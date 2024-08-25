import { Spinner } from '@/components/ui/spinner'

const Loading = () => {
    return (
        <div className='fixed w-full h-screen flex items-center justify-center gap-3 bg-sky-500/[.06] z-50'>
            <Spinner size='large' />
        </div>
    )
}

export default Loading