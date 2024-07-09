import React, { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { StatusMessages } from '../@types/StatusMessages'
import { Button, Card, Col, Row, Space } from 'antd'
import {
  CaretRightOutlined,
  DeleteTwoTone,
  PauseOutlined,
  SyncOutlined,
  LoadingOutlined,
  SendOutlined,
} from '@ant-design/icons'
import TweenOne from 'rc-tween-one'
import WaveForm from '../components/WaveForm'
import { Editor as TinyMCEEditor } from 'tinymce'
import WhisperIcon from '../components/WhisperIcon'

interface Props {
  editor?: React.MutableRefObject<TinyMCEEditor | null>
  previewAudioStream: MediaStream | null
  pauseRecording: () => void
  startRecording: () => void
  recordingTime: string
  setRecordingTime: React.Dispatch<React.SetStateAction<number>>
  status: StatusMessages
  setStatus: Dispatch<SetStateAction<StatusMessages>> | null
  clearBlobUrl: () => void
  stopRecording: () => void
  resumeRecording: () => void
  retry: () => void
  isError: boolean
  isLoading: boolean
}

export default function Component({ ...props }: Props) {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (props.status === 'recording') {
      setExpanded(true)
    }
    if (props.status === 'stopped') {
      setExpanded(false)
    }
  }, [props.status])

  return (
    <Row align="middle">
      <Col>
        <TweenOne
          animation={{
            duration: 250,
            height: expanded ? 'auto' : 'initial',
            onComplete: () => {
              // No action needed here
            },
            onStart: () => {
              // No action needed here
            },
          }}
        >
          <Card
            bodyStyle={{ padding: 0 }}
            style={{
              borderRadius: '8px',

              borderWidth: expanded ? 1 : 0,
              overflow: 'hidden', // Hide content when collapsed
            }}
          >
            <Row gutter={8} align="middle">
              <Col span={3}>
                <Space>
                  <Button
                    id="whisp"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'x-large',
                    }}
                    size={'large'}
                    type={'text'}
                    onClick={() => {
                      setExpanded(!expanded)
                      if (
                        props.status === 'idle' ||
                        props.status === 'stopped'
                      ) {
                        props.startRecording()
                      } else {
                        props.stopRecording()
                        props.setRecordingTime(0)
                      }
                    }}
                    icon={
                      !expanded ? (
                        props.isLoading ? (
                          <LoadingOutlined style={{ color: '#5099ff' }} spin />
                        ) : (
                          <WhisperIcon />
                        )
                      ) : (
                        <SendOutlined
                          style={{ color: 'green', fontSize: '1.25rem' }}
                        />
                      )
                    }
                  />
                </Space>
              </Col>
              {expanded && (
                <>
                  <Col span={3}>
                    <Button
                      icon={
                        props.status === 'paused' ? (
                          <CaretRightOutlined />
                        ) : (
                          <PauseOutlined />
                        )
                      }
                      type="text"
                      size="middle"
                      style={{ color: '#5099ff' }}
                      onClick={() =>
                        props.status !== 'paused'
                          ? props.pauseRecording()
                          : props.resumeRecording()
                      }
                    />
                  </Col>
                  <Col
                    span={4}
                    style={{ display: 'flex', justifyContent: 'center' }}
                  >
                    {props.recordingTime}
                  </Col>
                  <Col
                    span={5}
                    style={{
                      display: 'inline-flex',
                      justifyContent: 'center',
                      maxWidth: 'fit-content',
                    }}
                  >
                    <WaveForm audioStream={props.previewAudioStream!} />
                  </Col>
                  <Col span={1}>
                    <Button
                      onClick={() => {
                        setExpanded(!expanded)
                        props.setRecordingTime(0)
                        props.clearBlobUrl()
                        if (props.setStatus) {
                          props.setStatus('stopped')
                          props.stopRecording()
                        }
                      }}
                      type="text"
                      icon={<DeleteTwoTone twoToneColor="red" />}
                    />
                  </Col>
                </>
              )}
            </Row>
          </Card>
        </TweenOne>
      </Col>
      {props.editor && props.status !== 'idle' && (
        <Col>
          <Button
            type="text"
            size="small"
            icon={<SyncOutlined />}
            onClick={() => {
              props.editor!.current?.undoManager.undo()
              props.retry()
            }}
          >
            {props.status}
          </Button>
        </Col>
      )}
    </Row>
  )
}
