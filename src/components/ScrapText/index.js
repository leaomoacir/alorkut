import React from 'react'
import { applySmilies, SMILIES } from '../../lib/smilies'

export function SmileyBar({ onPick }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
      {SMILIES.map((s) => (
        <button key={s.code} type="button" onClick={() => onPick(s.code)} style={{ background: '#f4f4f4', color: '#333', border: 0, borderRadius: 8, padding: '4px 8px' }} title={s.label}>
          {s.code}
        </button>
      ))}
    </div>
  )
}

export default function ScrapText({ text }) {
  return <p dangerouslySetInnerHTML={{ __html: applySmilies(text) }} />
}
