import { ArrowUp } from 'lucide-react'

const ScrollTop = () => {
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  
    return (
      <button onClick={scrollToTop} className='fixed bottom-4 right-4 p-2 bg-white border bg-muted rounded-md'>
        <ArrowUp />
      </button>
    )
}

export default ScrollTop