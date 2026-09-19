import type { Action } from 'svelte/action'

export interface RevealOptions {
  /** Stagger delay in ms (e.g. index * 90 for card grids). */
  delay?: number
  /** Rise distance in px (PRD §7.3: 16px). */
  y?: number
  /** Duration in ms (PRD §7.3: 150–400ms band). */
  duration?: number
}

/**
 * Scroll-storytelling reveal (PRD §7.3): fade + rise 16px with the house easing
 * `cubic-bezier(0.22, 1, 0.36, 1)`, triggered once via IntersectionObserver.
 * Under `prefers-reduced-motion` or without IO support, content shows immediately
 * in its final state (never hidden).
 */
export const reveal: Action<HTMLElement, RevealOptions | undefined> = (el, options) => {
  const { delay = 0, y = 16, duration = 380 } = options ?? {}
  el.classList.add('reveal')
  el.style.setProperty('--reveal-y', `${y}px`)
  el.style.transitionDuration = `${duration}ms`

  // Stagger is applied through a custom property so the CSS stays declarative.
  if (delay > 0) el.style.setProperty('--reveal-delay', `${delay}ms`)

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || typeof IntersectionObserver === 'undefined') {
    el.classList.add('revealed')
    return
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
          io.disconnect()
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  )
  io.observe(el)

  return {
    destroy() {
      io.disconnect()
    }
  }
}
