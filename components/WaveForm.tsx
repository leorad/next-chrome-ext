'use client'
import { useState, useEffect, useRef } from 'react'

interface Props {
  audioStream: MediaStream | undefined
}

export default function Component({ audioStream }: Props) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    async function setupAudio() {
      try {
        const audioCtx = new (window.AudioContext || window.AudioContext)()
        const audioAnalyser = audioCtx.createAnalyser()
        audioAnalyser.fftSize = 256

        // Crie o gainNode e ajuste o ganho aqui
        const gainNode = audioCtx.createGain()
        gainNode.gain.value = 2 // Ajuste o valor conforme necessário para amplificar o áudio.
        if (audioStream) {
          const source = audioCtx.createMediaStreamSource(audioStream!)
          source.connect(gainNode)
        }
        gainNode.connect(audioAnalyser)

        setAudioContext(audioCtx)
        setAnalyser(audioAnalyser)
      } catch (error) {
        console.error('Erro ao configurar o áudio:', error)
      }
    }

    setupAudio()

    return () => {
      if (audioContext) {
        audioContext.close()
      }
    }
  }, [audioStream])

  useEffect(() => {
    if (!analyser || !canvasRef.current) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const drawVisualizer = () => {
      analyser.getByteFrequencyData(dataArray)

      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      const centerX = canvasWidth / 2

      ctx!.clearRect(0, 0, canvasWidth, canvasHeight)

      const barWidth = (canvasWidth / bufferLength) * 2
      let x = centerX - ((barWidth + 1) * bufferLength) / 2

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] + 1
        const barColor = '#1677ff' // Escolhe uma cor da lista

        ctx!.fillStyle = barColor // Define a cor do preenchimento

        ctx!.fillRect(x, canvasHeight / 2 - barHeight / 2, barWidth, barHeight)

        x += barWidth + 1
      }

      requestAnimationFrame(drawVisualizer)
    }

    drawVisualizer()
  }, [analyser])

  return <canvas ref={canvasRef} width={100} height={38}></canvas>
}
