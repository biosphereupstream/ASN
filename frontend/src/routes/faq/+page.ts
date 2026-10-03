import type { PageLoad } from './$types'
import { CATEGORY_LABELS, DEFAULT_FAQS, type FaqItem } from '$lib/data/faqs'

export const load: PageLoad = async ({ fetch }) => {
  let customFaqs: { q: string; a: string; category?: string }[] = []
  try {
    const res = await fetch('/api/content/faqs')
    if (res.ok) {
      const data = await res.json()
      if (data?.data?.items && Array.isArray(data.data.items)) {
        customFaqs = data.data.items
      }
    }
  } catch {
    customFaqs = []
  }

  // Merge custom CMS FAQs if any
  const mergedFaqs: FaqItem[] = [...DEFAULT_FAQS]
  for (const c of customFaqs) {
    if (c.q && c.a && !mergedFaqs.some((f) => f.q.toLowerCase() === c.q.toLowerCase())) {
      const cat = (c.category && ['pemasangan', 'paket', 'teknis', 'cakupan'].includes(c.category)
        ? c.category
        : 'pemasangan') as 'pemasangan' | 'paket' | 'teknis' | 'cakupan'
      mergedFaqs.push({
        id: `custom-${Math.random().toString(36).substring(2, 7)}`,
        category: cat,
        categoryLabel: CATEGORY_LABELS[cat],
        q: c.q,
        a: c.a
      })
    }
  }

  return { faqs: mergedFaqs }
}
