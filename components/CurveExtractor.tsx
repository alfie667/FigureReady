'use client'
import { useEffect, useRef, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import ImageUploader from './ImageUploader'
import {
  type RGB, type DataPoint,
  extractCurvePoints, exportPointsToExcel, detectCurveColor,
} from '@/lib/extractCurve'

export default function CurveExtractor() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null)

  const [targetColor, setTargetColor] = useState<RGB | null>(null)
  const [tolerance, setTolerance] = useState(40)
  const [extractedPoints, setExtractedPoints] = useState<DataPoint[]>([])

  const [xLabel, setXLabel] = useState('X')
  const [yLabel, setYLabel] = useState('Y')

  const dataCanvasRef = useRef<HTMLCanvasElement>(null)
  const displayCanvasRef = useRef<HTMLCanvasElement>(null)

  // Load image, draw it, and auto-detect the curve color
  useEffect(() => {
    if (!imageSrc) return
    const img = new Image()
    img.onload = () => {
      setImgEl(img)
      const dataCanvas = dataCanvasRef.current
      const displayCanvas = displayCanvasRef.current
      if (!dataCanvas || !displayCanvas) return
      dataCanvas.width = img.naturalWidth
      dataCanvas.height = img.naturalHeight
      displayCanvas.width = img.naturalWidth
      displayCanvas.height = img.naturalHeight
      const dataCtx = dataCanvas.getContext('2d')
      dataCtx?.drawImage(img, 0, 0)
      displayCanvas.getContext('2d')?.drawImage(img, 0, 0)

      if (dataCtx) {
        const imageData = dataCtx.getImageData(0, 0, dataCanvas.width, dataCanvas.height)
        setTargetColor(detectCurveColor(imageData))
      }
    }
    img.src = imageSrc
  }, [imageSrc])

  // Re-run extraction whenever the target color or tolerance changes
  useEffect(() => {
    if (!targetColor) return
    const ctx = dataCanvasRef.current?.getContext('2d')
    const canvas = dataCanvasRef.current
    if (!ctx || !canvas) return
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setExtractedPoints(extractCurvePoints(imageData, targetColor, tolerance))
  }, [targetColor, tolerance])

  // Redraw the display canvas with the image and the detected points overlaid
  useEffect(() => {
    const canvas = displayCanvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !imgEl) return
    ctx.drawImage(imgEl, 0, 0)
    ctx.fillStyle = 'rgba(255, 0, 0, 0.65)'
    extractedPoints.forEach(p => {
      const py = canvas.height - p.y
      ctx.beginPath()
      ctx.arc(p.x, py, 2, 0, 2 * Math.PI)
      ctx.fill()
    })
  }, [imgEl, extractedPoints])

  const handleImage = (dataUrl: string) => {
    setImageSrc(dataUrl)
    setTargetColor(null)
    setExtractedPoints([])
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current
    const ctx = dataCanvasRef.current?.getContext('2d')
    if (!canvas || !ctx) return
    const rect = canvas.getBoundingClientRect()
    const px = Math.round((e.clientX - rect.left) * (canvas.width / rect.width))
    const py = Math.round((e.clientY - rect.top) * (canvas.height / rect.height))
    const pixel = ctx.getImageData(px, py, 1, 1).data
    setTargetColor({ r: pixel[0], g: pixel[1], b: pixel[2] })
  }

  const reset = () => {
    setImageSrc(null)
    setImgEl(null)
    setTargetColor(null)
    setExtractedPoints([])
  }

  const handleExport = () => {
    exportPointsToExcel(extractedPoints, xLabel, yLabel)
  }

  if (!imageSrc) {
    return <ImageUploader onImage={handleImage} />
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 p-3 overflow-auto">
        <canvas ref={dataCanvasRef} className="hidden" />
        <canvas
          ref={displayCanvasRef}
          onClick={handleCanvasClick}
          className="max-w-full h-auto rounded cursor-crosshair"
        />
      </div>

      {imgEl && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400">
            Les points rouges sur l&apos;image montrent les données détectées. Si la courbe
            n&apos;est pas bien suivie, cliquez directement sur la courbe dans l&apos;image
            pour indiquer sa couleur, puis ajustez la tolérance ci-dessous.
          </p>
          {targetColor && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Couleur recherchée :</span>
              <span
                className="inline-block w-4 h-4 rounded border border-slate-300"
                style={{ backgroundColor: `rgb(${targetColor.r}, ${targetColor.g}, ${targetColor.b})` }}
              />
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-xs text-slate-500 mb-1.5">
          Tolérance de couleur ({tolerance})
        </label>
        <input
          type="range"
          min={5}
          max={120}
          value={tolerance}
          onChange={e => setTolerance(Number(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-slate-400 mt-1">
          Une tolérance basse ne garde que les pixels très proches de la couleur recherchée
          (risque de trous dans la courbe). Une tolérance élevée accepte des pixels plus
          différents (risque de capter du bruit autour de la courbe).
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs text-slate-500 mb-1.5">Nom de la colonne X</label>
          <input
            type="text"
            value={xLabel}
            onChange={e => setXLabel(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs text-slate-500 mb-1.5">Nom de la colonne Y</label>
          <input
            type="text"
            value={yLabel}
            onChange={e => setYLabel(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <p className="text-xs text-slate-400">{extractedPoints.length} points extraits</p>

      {extractedPoints.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={extractedPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="x" type="number" tick={{ fontSize: 11 }} domain={['dataMin', 'dataMax']} />
              <YAxis dataKey="y" type="number" tick={{ fontSize: 11 }} domain={['dataMin', 'dataMax']} />
              <Tooltip />
              <Line type="monotone" dataKey="y" stroke="#1F4FA8" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={extractedPoints.length === 0}
        className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Exporter en Excel
      </button>

      <button
        onClick={reset}
        className="block text-xs text-slate-400 hover:text-slate-600 transition-colors"
      >
        Recommencer avec une autre image
      </button>
    </div>
  )
}
