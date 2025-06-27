export const toDate = (ts) => ts && ts.toDate ? ts.toDate() : new Date(ts);

export const relativeDate = (ts, detailed = false) => {
  if (!ts) return ''
  const date = toDate(ts)
  const now = new Date()
  const diff = Math.abs(now - date)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (detailed) {
    if (minutes < 60) return `${minutes} min fa`
    if (hours < 24) return `${hours} ore fa`
  }

  if (days === 0) return 'Oggi'
  if (days === 1) return 'Ieri'
  if (days < 7) return `${days} giorni fa`
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: detailed ? 'numeric' : undefined
  })
}
