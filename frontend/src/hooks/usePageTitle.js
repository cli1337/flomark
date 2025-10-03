import { useEffect } from 'react'

export const usePageTitle = (title) => {
  useEffect(() => {
    const baseTitle = 'Flomark'
    const fullTitle = title ? `${baseTitle} | ${title}` : baseTitle
    
    document.title = fullTitle
    
    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = baseTitle
    }
  }, [title])
}

export default usePageTitle
