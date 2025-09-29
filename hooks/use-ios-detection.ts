'use client'

import { useEffect, useState } from 'react'

export function useIOSDetection() {
  const [isIOS, setIsIOS] = useState(false)
  const [isSafari, setIsSafari] = useState(false)

  useEffect(() => {
    const userAgent = navigator.userAgent
    
    // Detect iOS devices
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream
    
    // Detect Safari browser
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(userAgent)
    
    setIsIOS(isIOSDevice)
    setIsSafari(isSafariBrowser)
    
    // Add CSS class to body for iOS Safari specific styling
    if (isIOSDevice && isSafariBrowser) {
      document.body.classList.add('ios-safari')
    } else {
      document.body.classList.remove('ios-safari')
    }
  }, [])

  return { isIOS, isSafari, isIOSSafari: isIOS && isSafari }
}
