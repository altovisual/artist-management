'use client'

import { useEffect, useState } from 'react'
import { AnimatedLogo } from './animated-logo'
import { motion } from 'framer-motion'

interface LoadingScreenProps {
  onLoadingComplete?: () => void
  duration?: number
}

export function LoadingScreen({ onLoadingComplete, duration = 2000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          if (onLoadingComplete) {
            setTimeout(onLoadingComplete, 300)
          }
          return 100
        }
        return prev + 2
      })
    }, duration / 50)

    return () => clearInterval(interval)
  }, [duration, onLoadingComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Logo Container */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-pink-600 blur-2xl opacity-30 animate-pulse" />
          <AnimatedLogo width={200} height={60} />
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <p className="text-lg font-medium text-muted-foreground">
            Cargando tu plataforma musical...
          </p>

          {/* Progress Bar */}
          <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
              className="h-full bg-gradient-to-r from-primary via-purple-600 to-pink-600"
            />
          </div>

          {/* Progress Percentage */}
          <p className="text-sm text-muted-foreground font-mono">
            {progress}%
          </p>
        </motion.div>

        {/* Loading Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 rounded-full bg-primary"
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
