export function getLevel(stats) {
  const scraps = stats.scraps || 0
  const friends = stats.friends || 0
  const communities = stats.communities || 0
  const posts = stats.posts || 0
  const stars = stats.stars || 0
  const score = scraps + friends * 2 + communities * 3 + posts * 2 + Math.min(stars, 40)
  if (score >= 80) {
    return { name: 'Lenda do Orkut', color: '#D81D99', score }
  }
  if (score >= 30) {
    return { name: 'Veterano', color: '#2E7BB4', score }
  }
  return { name: 'Novato', color: '#6F92BB', score }
}

export function getDevBadges(profile) {
  const badges = []
  if (!profile) return badges
  if ((profile.totalStars || 0) >= 50) {
    badges.push({ id: 'top', label: 'Top Contributor', hint: '50+ estrelas no GitHub' })
  }
  if ((profile.totalRepos || 0) >= 10) {
    badges.push({ id: 'oss', label: 'Open Source Hero', hint: '10+ repositórios públicos' })
  }
  if ((profile.totalStars || 0) >= 10) {
    badges.push({ id: 'star', label: 'Estrela da Comunidade', hint: '10+ estrelas' })
  }
  return badges
}
