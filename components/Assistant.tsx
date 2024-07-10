import React, {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useRef,
} from 'react'
import { StatusMessages } from '@/@types/StatusMessages'
import { Button, Card, Col, Input, Popover, Row, Space } from 'antd'
import {
  CaretRightOutlined,
  DeleteTwoTone,
  PauseOutlined,
  SyncOutlined,
  LoadingOutlined,
  EditOutlined,
  SendOutlined,
} from '@ant-design/icons'
import TweenOne from 'rc-tween-one'
import WaveForm from '../components/WaveForm'
import { Editor as TinyMCEEditor } from 'tinymce'
import { LiaRobotSolid } from 'react-icons/lia'
import { TextAreaRef } from 'antd/es/input/TextArea'
import SpeechRecorder from "./RivaRecorder"
import useSpeech from "../hooks/InputAzure"

interface Props {
  // eslint-disable-next-line no-unused-vars
  directTrigger: (text: string) => void
  assistantReference: React.MutableRefObject<null>
  editAssistantExternalReference: React.MutableRefObject<null>
  // eslint-disable-next-line no-unused-vars
  setEditAssist: (input: string) => void
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
  retryRef: any
}

export default function Component({ ...props }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [isPopoverVisible, setIsPopoverVisible] = useState(false)
  const [localText, setLocalText] = useState('')
  const editAssistantRef = useRef<TextAreaRef>(null)
  const [cursorPositionEdit, setCursorPositionEdit] = useState(0)
  const beforeText = useRef('')
  const afterText = useRef('')
  useEffect(() => {
    if (props.status === 'recording') {
      setExpanded(true)
    }
    if (props.status === 'stopped') {
      setExpanded(false)
    }
  }, [props.status])

  useEffect(() => {
    props.setEditAssist(localText)
  }, [localText])



  const { ...azureProps } = useSpeech()

  useEffect(() => {



    setLocalText(beforeText.current + azureProps.text + afterText.current)


  }, [azureProps.text])

  return (
    <Row align="middle">
      <Col>
        <TweenOne
          animation={{
            duration: 250,
            height: expanded ? 'auto' : 'initial',
            onComplete: () => {
              // Nenhuma ação necessária aqui
            },
            onStart: () => {
              // Nenhuma ação necessária aqui
            },
          }}
        >
          <Card
            bodyStyle={{ padding: 0 }}
            style={{
              borderWidth: expanded ? 1 : 0,
            }}
          >
            <Row align="middle">
              <Col span={7}>
                <Button.Group>
                  <Popover
                    open={isPopoverVisible}
                    placement="bottomRight"
                    title={'O que você precisa?'}
                    content={
                      <Space style={{ minWidth: '35vw' }} direction="vertical">
                        <Row gutter={8}>
                          <Col style={{ display: "flex", alignItems: "center" }}>
                            <Button onClick={() => {
                              if (!azureProps.isRecording) {
                                beforeText.current = localText.slice(0, cursorPositionEdit)
                                afterText.current = localText.slice(cursorPositionEdit)
                              }
                            }} type='link' icon={<SpeechRecorder {...azureProps} />}></Button>
                          </Col>
                          <Col flex={1} >
                            <Input.TextArea
                              allowClear
                              value={localText}
                              onChange={(e) => {

                                setLocalText(e.target.value)
                                setCursorPositionEdit(e.target.selectionStart)
                              }}
                              onClick={() => {

                                setCursorPositionEdit(editAssistantRef.current?.resizableTextArea?.textArea.selectionStart!)
                              }}
                              ref={editAssistantRef}
                              autoFocus={true}
                              autoSize
                            />
                          </Col>

                        </Row>
                        <Row justify={'end'}>
                          <Button
                            onClick={() => {
                              props.directTrigger(localText)
                              setIsPopoverVisible(false)
                            }}
                            icon={<SendOutlined />}
                          >
                            Enviar
                          </Button>
                        </Row>
                      </Space>
                    }
                    trigger="click"
                  >
                    <span ref={props.editAssistantExternalReference}>
                      <Button
                        style={{
                          borderEndStartRadius: 0,
                          borderBottom: '1px solid transparent',
                        }}
                        onClick={() => {
                          if (isPopoverVisible) {
                            setIsPopoverVisible(false)
                          } else {
                            setIsPopoverVisible(true)
                          }
                          editAssistantRef.current?.focus()
                        }}
                        icon={<EditOutlined />}
                        size="large"
                      />
                    </span>
                  </Popover>
                  <span ref={props.assistantReference}>
                    <Button
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: '1px solid transparent',
                        borderEndEndRadius: 0,
                      }}
                      size={'large'}
                      type={expanded ? 'text' : 'default'}
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
                            <LoadingOutlined
                              style={{ color: '#5099ff' }}
                              spin
                            />
                          ) : (
                            <span style={{ fontSize: 'large' }}>
                              <LiaRobotSolid />
                            </span>
                          )
                        ) : (
                          <SendOutlined
                            style={{ fontSize: 'large', color: 'green' }}
                          />
                        )
                      }
                    >
                      {expanded ? '' : 'AI Assistant'}
                    </Button>
                  </span>
                </Button.Group>
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
                    span={2}
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginRight: '0.25rem',
                    }}
                  >
                    {props.recordingTime}
                  </Col>
                  <Col
                    style={{
                      display: 'inline-flex',
                      justifyContent: 'center',
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
      {props.editor?.current && props.status === 'idle' && (
        <Col>
          <span ref={props.retryRef}>
            <Button
              type="text"
              size="small"
              icon={<SyncOutlined />}
              onClick={() => {
                props.editor!.current?.undoManager.undo()
                props.retry()
              }}
            />
          </span>
        </Col>
      )}
    </Row>
  )
}
