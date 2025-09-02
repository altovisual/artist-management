'use client'

import type React from 'react';
import { useEffect, useRef, HTMLAttributes } from 'react'

interface AnimatedTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  text: string | undefined;
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

export function AnimatedTitle({ text, level = 1, className, ...props }: AnimatedTitleProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  useEffect(() => {
    const anime = (window as any).anime;
    if (titleRef.current && anime && text) {
      // Wrap every letter in a span
      titleRef.current.innerHTML = titleRef.current.textContent!.replace(/\S/g, "<span class='letter'>$&</span>");

      anime.timeline({ loop: false })
        .add({
          targets: titleRef.current.querySelectorAll('.letter'),
          scale: [4, 1],
          opacity: [0, 1],
          translateZ: 0,
          easing: "easeOutExpo",
          duration: 950,
          delay: (el: HTMLElement, i: number) => 70 * i
        });
    }
  }, [text])

  return (
    <HeadingTag ref={titleRef} className={className} {...props}>
      {text}
    </HeadingTag>
  )
}