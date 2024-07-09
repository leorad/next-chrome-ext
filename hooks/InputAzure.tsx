'use client'
import { useState, useRef, useEffect } from 'react'
import { Socket, io } from 'socket.io-client'

import { useAutotext } from './useAutotext'

export default function useSpeech() {
  const [text, setText] = useState('')
  const textRef = useRef('')
  const socketRef = useRef<Socket | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const contextRef = useRef<AudioContext | null>(null) // Ref para o contexto de áudio
  const [isRecording, setIsRecording] = useState(false)
  const isRecordingRef = useRef(false)
  const [isConnected, setIsConnected] = useState(false)
  const { processedText, replaceText } = useAutotext()

  useEffect(() => {
    if (processedText) {
      setText(processedText)
    }
  }, [processedText])

  const connectToSocket = async () => {
    const newSocket = io(`${process.env.AZURE_URI}`, {
      transports: ['websocket'],
    })
    setIsConnected(true)
    newSocket.on('connect', () => {
      console.log('Socket connection established.')

      socketRef.current = newSocket
    })

    newSocket.on('disconnect', () => {
      console.log('Socket connection closed.')
      socketRef.current = null
    })

    newSocket.on('text', (data: any) => {
      let result: string = data
      textRef.current = result
      replaceText(result)

    })

    newSocket.on('error', (error: any) => {
      console.error('Socket connection error:', error)
      // Lógica para lidar com erros de conexão
    })
  }

  const disconnect = () => {
    socketRef?.current?.close()
    socketRef.current = null
    setIsConnected(false)
  }

  const startRecord = async () => {
    if (!isRecording) {
      setText('')
      setIsRecording(true)

      isRecordingRef.current = true
      if (!socketRef.current) {
        connectToSocket()
        await new Promise((resolve) => {
          const interval = setInterval(() => {
            if (socketRef.current) {
              clearInterval(interval)
              resolve(null)
            }
          }, 100)
        })
      }
      socketRef.current?.emit('start')

      navigator.mediaDevices
        .getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } })
        .then((stream) => {
          streamRef.current = stream
          const AudioContext = window.AudioContext
          const context = new AudioContext({
            sampleRate: 16000,
          })

          contextRef.current = context // Atualize o ref do contexto

          const processor = context.createScriptProcessor(16384, 1, 1)

          processor.onaudioprocess = (event) => {
            if (isRecordingRef.current) {
              const inputData = event.inputBuffer.getChannelData(0)
              // Converter os dados PCM em bytes inteiros de 16 bits
              const buffer = new ArrayBuffer(inputData.length * 2)
              const view = new DataView(buffer)
              for (let i = 0; i < inputData.length; i++) {
                // Normalizar o valor para o intervalo de -1 a 1
                const s = Math.max(-1, Math.min(1, inputData[i]))
                // Converter para um valor entre -32768 e 32767 e armazenar como int16
                view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true)
              }

              socketRef.current?.emit('stream', buffer)
            }
          }

          processor.connect(context.destination)
          context.resume()
          context.createMediaStreamSource(stream).connect(processor)
        })
    }
  }

  const stopRecord = () => {
    socketRef.current?.emit('stop')
    setIsRecording(false)
    isRecordingRef.current = false

    streamRef.current?.getTracks()[0].stop()

    // streamRef.current = null

    contextRef.current?.close().then(() => {
      contextRef.current = null // Defina o contexto como nulo após fechar
    })
    disconnect()
    connectToSocket()
  }

  return {
    text,
    startRecord,
    stopRecord,
    isRecording,
    disconnect,
    isConnected,
    connectToSocket,
  }
}
