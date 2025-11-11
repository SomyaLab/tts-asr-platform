/**
 * Generate unique avatar URL for a user based on their ID or email
 * Uses UI Avatars service to generate avatar with initials
 */
export function getUserAvatarUrl(user) {
  if (!user) return '/male.png' // Fallback to default
  
  // Use user ID or email to generate consistent avatar
  const identifier = user.id || user.email || 'user'
  
  // Get initials from name or email
  let initials = 'U'
  if (user.name) {
    const nameParts = user.name.trim().split(/\s+/)
    if (nameParts.length >= 2) {
      initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    } else if (nameParts[0]) {
      initials = nameParts[0][0].toUpperCase()
    }
  } else if (user.email) {
    initials = user.email[0].toUpperCase()
  }
  
  // Use UI Avatars service - generates avatar with initials
  // You can also use DiceBear: https://api.dicebear.com/7.x/initials/svg?seed=${identifier}
  const size = 40
  const backgroundColor = generateColorFromString(identifier)
  const textColor = 'ffffff'
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=${backgroundColor}&color=${textColor}&bold=true`
}

/**
 * Generate a consistent hex color from a string (user ID or email)
 */
function generateColorFromString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Generate HSL values
  const hue = Math.abs(hash) % 360
  const saturation = 60 + (Math.abs(hash) % 20) // 60-80%
  const lightness = 45 + (Math.abs(hash) % 15) // 45-60%
  
  // Convert HSL to hex
  const l = lightness / 100
  const a = saturation * Math.min(l, 1 - l) / 100
  const f = n => {
    const k = (n + hue / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `${f(0)}${f(8)}${f(4)}` // Return hex without #
}

