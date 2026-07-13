import type { StyleOverrides } from './chartStyles'

export interface JournalPreset {
  id: string
  name: string
  singleWidth: number   // px at 96 dpi  (mm / 25.4 × 96)
  doubleWidth: number
  mmSingle: string
  mmDouble: string
  fontFamily: string    // matches a value in chartStyles.fontOptions
  labelSize: number     // axis title px
  tickSize: number      // tick label px
  dpi: string
  panelLabels?: string  // e.g. 'lowercase' | 'UPPERCASE'
}

export const JOURNAL_PRESETS: JournalPreset[] = [
  {
    id: 'nature',
    name: 'Nature',
    singleWidth: 340,
    doubleWidth: 680,
    mmSingle: '90 mm',
    mmDouble: '180 mm',
    fontFamily: 'Arial, Helvetica, sans-serif',
    labelSize: 8,
    tickSize: 7,
    dpi: '300 DPI',
    panelLabels: 'lowercase',
  },
  {
    id: 'science',
    name: 'Science',
    singleWidth: 216,
    doubleWidth: 432,
    mmSingle: '57 mm',
    mmDouble: '114 mm',
    fontFamily: 'Times New Roman, Times, serif',
    labelSize: 9,
    tickSize: 8,
    dpi: '300 DPI',
  },
  {
    id: 'cell',
    name: 'Cell',
    singleWidth: 321,
    doubleWidth: 642,
    mmSingle: '85 mm',
    mmDouble: '170 mm',
    fontFamily: 'Arial, Helvetica, sans-serif',
    labelSize: 8,
    tickSize: 7,
    dpi: '1000 DPI (line art)',
    panelLabels: 'UPPERCASE',
  },
  {
    id: 'pnas',
    name: 'PNAS',
    singleWidth: 329,
    doubleWidth: 672,
    mmSingle: '87 mm',
    mmDouble: '178 mm',
    fontFamily: 'Arial, Helvetica, sans-serif',
    labelSize: 9,
    tickSize: 8,
    dpi: '300–600 DPI',
  },
  {
    id: 'jacs',
    name: 'JACS',
    singleWidth: 311,
    doubleWidth: 653,
    mmSingle: '82.5 mm',
    mmDouble: '173 mm',
    fontFamily: 'Arial, Helvetica, sans-serif',
    labelSize: 8,
    tickSize: 7,
    dpi: '1200 DPI (line art)',
  },
  {
    id: 'acsnano',
    name: 'ACS Nano',
    singleWidth: 311,
    doubleWidth: 653,
    mmSingle: '82.5 mm',
    mmDouble: '173 mm',
    fontFamily: 'Arial, Helvetica, sans-serif',
    labelSize: 8,
    tickSize: 7,
    dpi: '1200 DPI (line art)',
  },
]

export type JournalOverrideKeys =
  'figureWidth' | 'fontFamily' | 'xTitleSize' | 'yTitleSize' | 'xTickSize' | 'yTickSize'

export function getJournalOverrides(
  preset: JournalPreset,
  column: 'single' | 'double',
): Pick<StyleOverrides, JournalOverrideKeys> {
  return {
    figureWidth:  column === 'single' ? preset.singleWidth : preset.doubleWidth,
    fontFamily:   preset.fontFamily,
    xTitleSize:   preset.labelSize,
    yTitleSize:   preset.labelSize,
    xTickSize:    preset.tickSize,
    yTickSize:    preset.tickSize,
  }
}
