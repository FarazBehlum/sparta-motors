'use client'

import React, { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion'

/**
 * Motion moment #3 — fade up 30px + opacity 0→1 as the block enters the
 * viewport, once. Respects prefers-reduced-motion (renders visible immediately).
 * `delay` staggers grouped children (e.g. 60ms per card).
 */
export function FadeInSection({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = usePrefersReducedMotion()
  const [intersected, setIntersected] = useState(false)
  const visible = reduce || intersected

  useEffect(() => {
    if (reduce) return // shown immediately, no observer needed
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIntersected(true)
          io.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduce])

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLElement>}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(30px)',
        transition: `opacity 400ms cubic-bezier(0.25,0.1,0.25,1) ${delay}ms, transform 400ms cubic-bezier(0.25,0.1,0.25,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  )
}
