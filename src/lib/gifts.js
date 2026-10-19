export const GIFT_CATALOG = [
  { id: 'coracao', label: 'Coracao', emoji: '<3', color: '#CE007E' },
  { id: 'estrela', label: 'Estrela', emoji: '*', color: '#E6B800' },
  { id: 'cafe', label: 'Cafezinho', emoji: 'c', color: '#8B5A2B' },
  { id: 'flor', label: 'Flor', emoji: '@', color: '#D81D99' },
  { id: 'trofeu', label: 'Trofeu', emoji: 'T', color: '#C9A227' },
  { id: 'pizza', label: 'Pizza', emoji: 'O', color: '#E67E22' },
  { id: 'abraco', label: 'Abraco', emoji: 'A', color: '#2E7BB4' },
  { id: 'foguete', label: 'Foguete', emoji: '^', color: '#5C9ECF' },
]

export function giftMeta(id) {
  return GIFT_CATALOG.find((g) => g.id === id) || { id, label: id, emoji: '*', color: '#6F92BB' }
}
