export const formatCurrency = (amount, currency = 'TRY') => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency', currency,
    minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(amount || 0)
}

export const formatDate = (date) =>
  new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(date))

export const formatDateShort = (date) =>
  new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .format(new Date(date))

export const formatRelativeDate = (date) => {
  const d = new Date(date)
  const now = new Date()
  const diff = Math.floor((now - d) / 86400000)
  if (diff === 0) return 'Bugün'
  if (diff === 1) return 'Dün'
  if (diff < 7) return `${diff} gün önce`
  return formatDateShort(date)
}

export const formatMonth = (month, year) => {
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
                  'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']
  return `${months[month - 1]} ${year}`
}

export const formatCompact = (n) => {
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n/1_000).toFixed(0)}B`
  return n.toString()
}
