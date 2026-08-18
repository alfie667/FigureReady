// Fictional dose-response data for two inhibitors against the same target.
// Compound A: IC50 ≈ 0.05 µM (high potency, Hill ≈ 1.2)
// Compound B: IC50 ≈ 1.5 µM (moderate potency, Hill ≈ 0.9)
// Values are manually crafted to sit on realistic 4PL curves + biological scatter.
// n=3 independent experiments, error = SEM.

export const DR_X_COL = 'Conc (µM)'
export const DR_Y_COLS = ['Compound A', 'Compound B']
export const DR_COLUMNS = [
  'Conc (µM)',
  'Compound A',
  'Compound A error',
  'Compound B',
  'Compound B error',
]

export const DR_SAMPLE_ROWS: Record<string, unknown>[] = [
  { 'Conc (µM)': 0.001,  'Compound A': 96.8, 'Compound A error': 1.8,  'Compound B': 94.7, 'Compound B error': 2.3 },
  { 'Conc (µM)': 0.003,  'Compound A': 93.5, 'Compound A error': 2.4,  'Compound B': 96.3, 'Compound B error': 2.1 },
  { 'Conc (µM)': 0.01,   'Compound A': 84.2, 'Compound A error': 3.1,  'Compound B': 93.8, 'Compound B error': 3.0 },
  { 'Conc (µM)': 0.03,   'Compound A': 65.7, 'Compound A error': 4.2,  'Compound B': 92.1, 'Compound B error': 2.8 },
  { 'Conc (µM)': 0.1,    'Compound A': 29.8, 'Compound A error': 3.8,  'Compound B': 87.2, 'Compound B error': 3.4 },
  { 'Conc (µM)': 0.3,    'Compound A': 11.3, 'Compound A error': 2.1,  'Compound B': 77.5, 'Compound B error': 4.1 },
  { 'Conc (µM)': 1,      'Compound A':  5.2, 'Compound A error': 0.9,  'Compound B': 59.1, 'Compound B error': 4.8 },
  { 'Conc (µM)': 3,      'Compound A':  3.4, 'Compound A error': 0.7,  'Compound B': 36.8, 'Compound B error': 3.9 },
  { 'Conc (µM)': 10,     'Compound A':  2.8, 'Compound A error': 0.5,  'Compound B': 18.2, 'Compound B error': 2.2 },
  { 'Conc (µM)': 30,     'Compound A':  2.1, 'Compound A error': 0.4,  'Compound B':  9.7, 'Compound B error': 1.4 },
]
