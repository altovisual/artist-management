'use client'

import { useEffect } from 'react'

export function IOSDetectionProvider() {
  useEffect(() => {
    const userAgent = navigator.userAgent
    
    // Detect iOS devices
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream
    
    // Detect Safari browser (more comprehensive detection)
    const isSafariBrowser = /^((?!chrome|android|crios|fxios).)*safari/i.test(userAgent) || 
                           /iPhone|iPad|iPod/.test(userAgent)
    
    console.log('iOS Detection:', { isIOSDevice, isSafariBrowser, userAgent })
    
    // Add CSS class to html and body for iOS Safari specific styling
    if (isIOSDevice || isSafariBrowser) {
      document.documentElement.classList.add('ios-safari')
      document.body.classList.add('ios-safari')
      console.log('Added ios-safari class')
    } else {
      document.documentElement.classList.remove('ios-safari')
      document.body.classList.remove('ios-safari')
    }
    
    // Also add general iOS class
    if (isIOSDevice) {
      document.documentElement.classList.add('ios-device')
      document.body.classList.add('ios-device')
    } else {
      document.documentElement.classList.remove('ios-device')
      document.body.classList.remove('ios-device')
    }

    // Force a style recalculation
    document.body.style.display = 'none'
    document.body.offsetHeight // Trigger reflow
    document.body.style.display = ''
  }, [])

  return null
}
