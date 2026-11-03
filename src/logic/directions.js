// A robot négy iránya. A "Fel" mindig a képernyő teteje felé visz (y csökken).
export const DIRECTIONS = {
  up: { label: 'Fel', icon: 'up', arrow: '↑', dx: 0, dy: -1 },
  right: { label: 'Jobbra', icon: 'arrow', arrow: '→', dx: 1, dy: 0 },
  down: { label: 'Le', icon: 'down', arrow: '↓', dx: 0, dy: 1 },
  left: { label: 'Balra', icon: 'left', arrow: '←', dx: -1, dy: 0 }
}
