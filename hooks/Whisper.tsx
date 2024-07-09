'use client'
import { useState, useEffect } from 'react'

import { useAudioRecorder } from 'react-audio-voice-recorder'
import { StatusMessages } from '../@types/StatusMessages'

export default function useAssistant() {
  const [file, setFile] = useState<File | null>(null)
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsloading] = useState(false)
  const [status, setStatus] = useState<StatusMessages>('stopped')
  const [blobURL, setBloblURL] = useState<string | undefined>('')
  const [completion, setCompletion] = useState('')
  const {
    isPaused,
    isRecording,
    togglePauseResume,
    recordingBlob,
    mediaRecorder,
    startRecording,
    recordingTime,
    stopRecording,
  } = useAudioRecorder()

  function formatRecordingTime(time: number) {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const handleSubmit = async () => {
    const formData = new FormData()
    if (file) {
      formData.append('file', file!)
    }

    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + '/ai/speech',
      {
        method: 'POST',
        body: formData,
      },
    )

    if (response.ok) {
      const reader = response.body!.getReader()
      let result = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          setIsloading(false)

          setIsError(false)
          break
        }
        const decodedValue = new TextDecoder().decode(value)
        result += decodedValue
        setCompletion(result)
      }
    } else {
      setIsError(true)
      setIsloading(false)
      setIsError(true)
    }
  }

  const retry = async () => {
    handleSubmit()
  }

  useEffect(() => {
    if (file && file.size !== 0) {
      setIsloading(true)
      handleSubmit()
    }
  }, [file])

  useEffect(() => {
    if (recordingBlob && status === 'idle') {
      const file = new File([recordingBlob], 'user_record.m4a', {
        type: recordingBlob.type,
      })

      const newBlobUrl = URL.createObjectURL(recordingBlob)
      setBloblURL(newBlobUrl)

      setFile(file)
    }
  }, [recordingBlob])

  return {
    previewAudioStream: mediaRecorder ? mediaRecorder.stream : null,
    pauseRecording: togglePauseResume,
    resumeRecording: togglePauseResume,
    startRecording: () => {
      setStatus('idle')
      startRecording()
    },
    status: isPaused ? 'paused' : isRecording ? 'recording' : 'idle',
    clearBlobUrl: () => {
      setStatus('stopped')
      stopRecording()
    },
    stopRecording: () => {
      stopRecording()
    },
    recordingTime: formatRecordingTime(recordingTime),
    file,
    setFile,
    completion,
    isLoading,
    isError,
    recordingBlob,
    setStatus,
    mediaBlobUrl: blobURL,
    retry,
  }
}
