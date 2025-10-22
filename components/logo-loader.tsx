'use client'

import { AnimatedLogo } from './animated-logo'
import { motion } from 'framer-motion'

interface LogoLoaderProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LogoLoader({ text = "Cargando...", size = 'md' }: LogoLoaderProps) {
  const sizes = {
    sm: { width: 100, height: 28 },
    md: { width: 180, height: 50 },
    lg: { width: 240, height: 66 }
  }

  const logoSize = sizes[size]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-6"
    >
      <AnimatedLogo width={logoSize.width} height={logoSize.height} />
      
      {text && (
        <p className="text-base text-muted-foreground">
          {text}
        </p>
      )}

      {/* Loading Dots */}
      <div className="flex gap-2">
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
      </div>
    </motion.div>
  )
}
