import { AudioOutlined, LoadingOutlined } from '@ant-design/icons'
import { Badge, Button, Row } from 'antd'
import { useEffect } from 'react'

interface props {
  isConnected: boolean
  isRecording: boolean
  stopRecord: () => void
  startRecord: () => void
  disconnect: () => void
  text: string
  // eslint-disable-next-line no-unused-vars
  connectToSocket: (shouldStart: boolean, oldText?: string | undefined) => void
}

export default function Component({ ...props }: props) {
  useEffect(() => {
    props.connectToSocket(false)

    return () => {
      props.disconnect()
    }
  }, [])

  return (
    <Row>
      <Badge
        styles={{
          indicator: {
            top: '15%',
            right: '20%',
          },
        }}
        dot
        color={!props.isConnected ? 'red' : 'green'}
      >
        <Button
          type="text"
          disabled={!props.isConnected}
          size="large"
          icon={
            props.isRecording ? (
              <LoadingOutlined style={{ color: 'red' }} spin />
            ) : (
              <AudioOutlined />
            )
          }
          onClick={() =>
            props.isRecording ? props.stopRecord() : props.startRecord()
          }
        />
      </Badge>
    </Row>
  )
}
