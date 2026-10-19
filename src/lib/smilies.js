export const SMILIES = [
  { code: ':)', label: 'feliz' },
  { code: ':(', label: 'triste' },
  { code: ':D', label: 'risada' },
  { code: ':P', label: 'lingua' },
  { code: ';)', label: 'piscadela' },
  { code: '<3', label: 'coracao' },
  { code: ':O', label: 'surpreso' },
  { code: '^^', label: 'timido' },
]

export function applySmilies(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/:D/g, '<span class="smiley">:D</span>')
    .replace(/:P/g, '<span class="smiley">:P</span>')
    .replace(/:O/g, '<span class="smiley">:O</span>')
    .replace(/:\)/g, '<span class="smiley">:)</span>')
    .replace(/:\(/g, '<span class="smiley">:(</span>')
    .replace(/;\)/g, '<span class="smiley">;)</span>')
    .replace(/&lt;3/g, '<span class="smiley">&lt;3</span>')
    .replace(/\^\^/g, '<span class="smiley">^^</span>')
}
