import { Editor } from '@tinymce/tinymce-react'
import { MutableRefObject, createRef, useEffect, useRef, useState } from 'react'
import { Editor as TinyMCEEditor } from 'tinymce'
import RivaRecorder from '@/components/RivaRecorder'
import WhisperRecorder from '@/components/Recorder'
import Assistant from '@/components/Assistant'
import useAzure from '@/hooks/Azure'
import useWhisper from '@/hooks/Whisper'
import useAssistant from '@/hooks/Assistant'
import { t } from 'i18next'
import '@/styles/editor.css'
import { StatusMessages } from '@/@types/StatusMessages'
// import { useAutotext } from '@/hooks/useAutotext'
// import { useUpdateEditorTinyMCE } from '../../hooks/useUpdateEditorTinyMCE'

type EditorProps = {
    initialValue?: string
    id?: string
}
// eslint-disable-next-line react-refresh/only-export-components
export const editorTinyMCERef =
    createRef<TinyMCEEditor | null>() as MutableRefObject<TinyMCEEditor>

export const EditorTinyMCE = ({ initialValue }: EditorProps) => {
    const refEditAssistant = useRef(null)
    const refAssistant = useRef(null)
    const refRetry = useRef(null)
    // eslint-disable-next-line no-unused-vars
    const [_assistantInput, setAssistantInput] = useState('')
    //   const { phrases } = useAutotext()
    const phrases: any = []
    //   const { handleUpdateEditorTinyMCE } = useUpdateEditorTinyMCE()
    const {
        connectToSocket,
        disconnect,
        isConnected,
        isRecording: isRecordingRiva,
        startRecord: startRecordRiva,
        stopRecord: stopRecordRiva,
        text,
    } = useAzure(editorTinyMCERef)

    const recorderPropsRiva = {
        isConnected,
        isRecording: isRecordingRiva,
        stopRecord: stopRecordRiva,
        startRecord: () => {
            if (status !== 'recording') {
                startRecordRiva()
            }
        },
        disconnect,
        text,
        connectToSocket,
    }

    const {
        completion,
        isLoading,
        isError,
        previewAudioStream,
        startRecording,
        stopRecording,
        recordingTime,
        clearBlobUrl,
        pauseRecording,
        resumeRecording,
        setStatus,
        status,
        mediaBlobUrl,
        retry,
    } = useWhisper()

    const recorderPropsWhisper = {
        previewAudioStream,
        pauseRecording,
        startRecording,
        recordingTime: recordingTime.toString(),
        status: status as StatusMessages,
        clearBlobUrl: () => clearBlobUrl,
        stopRecording,
        resumeRecording,
        isError,
        isLoading,
        mediaBlobUrl,
        setStatus,
        // eslint-disable-next-line
        setRecordingTime: () => { },
        retry,
    }

    const {
        directTrigger,
        setFile: setFileAssitant,
        completion: completionAssitant,
        isLoading: isLoadingAssitant,
        isError: isErrorAssitant,
        previewAudioStream: previewAudioStreamAssitant,
        startRecording: startRecordingAssitant,
        stopRecording: stopRecordingAssitant,
        recordingTime: recordingTimeAssitant,
        clearBlobUrl: clearBlobUrlAssitant,
        pauseRecording: pauseRecordingAssitant,
        resumeRecording: resumeRecordingAssitant,
        setStatus: setStatusAssitant,
        status: statusAssitant,
        mediaBlobUrl: mediaBlobUrlAssitant,
        retry: retryAssitant,
        setEditAssist,
        setEditorContent,
    } = useAssistant()

    const assitantProps = {
        directTrigger,
        assistantReference: refAssistant,
        editAssistantExternalReference: refEditAssistant,
        handleAssistantInput: setAssistantInput,
        setFile: setFileAssitant,
        previewAudioStream: previewAudioStreamAssitant,
        pauseRecording: pauseRecordingAssitant,
        startRecording: startRecordingAssitant,
        recordingTime: recordingTimeAssitant.toString(),
        status: statusAssitant as StatusMessages,
        clearBlobUrl: () => clearBlobUrlAssitant,
        stopRecording: stopRecordingAssitant,
        resumeRecording: resumeRecordingAssitant,
        isError: isErrorAssitant,
        isLoading: isLoadingAssitant,
        mediaBlobUrl: mediaBlobUrlAssitant,
        setStatus: setStatusAssitant,
        // eslint-disable-next-line
        setRecordingTime: () => { },
        retry: retryAssitant,
        setEditAssist,
        setEditorContentAssist: setEditorContent,
    }

    // const [coords, setCoords] = useState({ x: 0, y: 0 })

    useEffect(() => {
        if (isLoadingAssitant) {
            editorTinyMCERef.current.setContent('')
        }
        if (isRecordingRiva || isLoading || isLoadingAssitant) {
            editorTinyMCERef.current?.focus()
            // eslint-disable-next-line
            editorTinyMCERef.current?.insertContent('<mark style="background-color:#add8e66b" id="speech-target" class="speech-target">&nbsp</mark>')
        } else {
            editorTinyMCERef.current?.focus()
            if (editorTinyMCERef.current) {
                const targets = editorTinyMCERef.current.dom.select('mark')
                targets.forEach((target) => {
                    const childNodes = Array.from(target.childNodes)
                    try {
                        target.replaceWith(...childNodes)

                        editorTinyMCERef.current!.selection.setCursorLocation(
                            childNodes[childNodes.length - 1],
                            childNodes[childNodes.length - 1].textContent?.length || 0,
                        )
                    } catch { }
                })
            }
        }


    }, [isRecordingRiva, isLoading, isLoadingAssitant])

    useEffect(() => {
        if (editorTinyMCERef.current) {
            const texts = text.split('\n')

            const targets = editorTinyMCERef.current.dom.select('mark')
            if (texts.length > targets.length) {
                editorTinyMCERef.current?.execCommand('mceInsertNewLine')
                const targetsToRemove = targets.length - texts.length

                // Remove os targets extras
                for (let i = 0; i < targetsToRemove; i++) {
                    targets[targets.length - 1].remove()
                }
            }
            targets.forEach((target, index) => {
                target.innerHTML = texts[index]
            })
            try {
                editorTinyMCERef.current!.selection.setCursorLocation(
                    targets[targets.length - 1].parentNode!,
                    1,
                )
            } catch { }
        }
    }, [text])

    useEffect(() => {
        if (!isError && completion) {
            const text = completion.replace(`""`, "\n")
            const texts = text.split('\n')
            const targets = editorTinyMCERef.current.dom.select('mark')

            if (texts.length > targets.length) {
                editorTinyMCERef.current?.execCommand('mceInsertNewLine')
            }

            while (texts.length < targets.length) {
                // Remove excess targets
                targets[targets.length - 1].remove()
                targets.pop()
            }

            targets.forEach((target, index) => {
                target.textContent = texts[index]
            })

            try {
                editorTinyMCERef.current!.selection.setCursorLocation(
                    targets[targets.length - 1].parentNode!,
                    1,
                )
            } catch { }
        }
    }, [completion])

    useEffect(() => {
        if (editorTinyMCERef.current && !isError && completionAssitant) {
            const text = completionAssitant

            const texts = text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .split('\n')

            const targets = editorTinyMCERef.current.dom.select('mark')
            if (texts.length > targets.length) {
                editorTinyMCERef.current?.execCommand('mceInsertNewLine')
            }

            while (texts.length < targets.length) {
                // Remove excess targets
                targets[targets.length - 1].remove()
                targets.pop()
            }

            targets.forEach((target, index) => {
                target.innerHTML = texts[index]
            })

            try {
                editorTinyMCERef.current!.selection.setCursorLocation(
                    targets[targets.length - 1].parentNode!,
                    1,
                )
            } catch { }
        }
    }, [completionAssitant])

    return (
        <div style={{ position: 'relative',height:"100%" }} >
            <span
                className="the problem"
                style={{
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'flex-end',
                    zIndex: 3,
                    top: '0.75%',
                    columnGap: 4,
                    paddingRight: 4,
                    paddingLeft: 4,
                    marginBottom: 8,
                }}
            >
                <RivaRecorder {...recorderPropsRiva} />

                <WhisperRecorder {...recorderPropsWhisper} />

                <Assistant
                    retryRef={refRetry}
                    editor={editorTinyMCERef}
                    {...assitantProps}
                />
            </span>

            <Editor

                key={initialValue}
                licenseKey="gpl"
                tinymceScriptSrc={'/tinymce/js/tinymce/tinymce.min.js'}
                initialValue={initialValue || undefined}
                onEditorChange={(_, editor) => {
                    const text = editor.getContent({ format: 'text' })
                    setEditorContent(text)
                }}
                onInit={(_, editor) => {
                    editorTinyMCERef.current = editor
                    editor.ui.registry.addAutocompleter('autotexts', {
                        trigger: '@',
                        minChars: 0,
                        columns: 1,
                        fetch: (pattern) => {
                            return new Promise((resolve) => {
                                const results = phrases
                                    .filter((pair:any) => {
                                        return (
                                            pair.target.includes(pattern) ||
                                            pair.target.toUpperCase().includes(pattern)
                                        )
                                    })
                                    .map((pair:any) => {
                                        return {
                                            type: 'autotexts',
                                            value: pair.uuid,
                                            text: pair.target,
                                            items: [],
                                        }
                                    })
                                resolve(results as any)
                            })
                        },
                        onAction(autocompleterApi, rng, value, meta) {
                            editor.selection.setRng(rng)
                            console.log(value, meta)
                            //   handleUpdateEditorTinyMCE({ isBranch: false, element: { metadata: { uuid: value } } } as any)
                            autocompleterApi.hide()
                        },

                    })
                }}
                init={{
                    min_height: 300,
                    height: '100%',
                    language_url:
                        location.origin +
                        `/public/tinymce/js/tinymce/langs/${t('layout.tiny')}.js`,
                    menubar: false,
                    statusbar: false,
                    browser_spellcheck: false,
                    auto_focus: true,
                    plugins: [
                        'advlist',
                        'autolink',
                        'lists',
                        'link',
                        'image',
                        'charmap',
                        'preview',
                        'anchor',
                        'searchreplace',
                        'visualblocks',
                        'code',
                        'fullscreen',
                        'insertdatetime',
                        'media',
                        'table',
                    ],
                    branding: false,
                    toolbar1: 'speech | speech-help ',
                    toolbar2: `copyToClipboard customCut undo redo
                      bold italic forecolor alignleft aligncenter
                      alignright alignjustify bullist numlist
                      outdent indent | clear`,
                    content_style:
                        'body { font-family:Helvetica,Arial,sans-serif font-size:14px }',

                    setup(editor) {
                        editor.on('PostProcess', function () {
                            try {
                                const toolbar = editor
                                    .getContainer()
                                    .getElementsByClassName('tox-toolbar')[1] as HTMLElement
                                toolbar.classList.add('custom-justify-between')
                                const targets = editorTinyMCERef.current
                                    .getContainer()
                                    .getElementsByClassName('tox-tbtn tox-tbtn--select')
                                // const x = editorTinyMCERef.current
                                //   .getContainer()
                                //   .getBoundingClientRect().left
                                // const y = editorTinyMCERef.current
                                //   .getContainer()
                                //   .getBoundingClientRect().top
                                // setCoords({ x, y })

                                const copyButton = toolbar.firstChild?.firstChild as HTMLElement

                                copyButton!.style.backgroundColor = 'green'
                                copyButton!.style.marginRight = '0.25rem'
                                copyButton.addEventListener('mouseenter', () => {
                                    copyButton.style.backgroundColor = 'darkgreen'
                                })

                                // Define o estilo de saída do hover
                                copyButton.addEventListener('mouseleave', () => {
                                    copyButton.style.backgroundColor = 'green'
                                })

                                const dummyNode = document.createElement('div')
                                dummyNode.style.marginRight = '17.5rem'
                                targets[0].replaceWith(dummyNode)
                                targets[0].replaceWith(dummyNode)
                            } catch { }
                            editorTinyMCERef.current = editor
                        })

                        editor.ui.registry.addIcon(
                            'CustomCopy',
                            `<svg viewBox="0 0 24 24" style="fill: #008000 !important;" height="1em" width="1em">
                <path 
      d="M19 21H8V7h11m0-2H8a2 2 0 00-2 2v14a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2m-3-4H4a2 2 0 00-2 2v14h2V3h12V1z"
                fill="white" />
                </svg>`,
                        )

                        editor.ui.registry.addButton('customCut', {
                            tooltip: t('layout.cortar'),
                            icon: 'cut',
                            onAction() {
                                editorTinyMCERef.current?.execCommand('SelectAll')
                                editorTinyMCERef.current?.execCommand('Copy')
                                editorTinyMCERef.current?.execCommand('Cut')
                            },
                        })

                        editor.ui.registry.addButton('clear', {
                            type: 'button',
                            tooltip: 'Limpa o editor',
                            icon: 'remove',
                            onAction() {
                                editor.setContent('')
                            },
                        })
                        editor.ui.registry.addButton('brightness', {
                            type: 'button',
                            tooltip:
                                'Seleciona frase ou diga auto texto para localizar sua frase',
                            icon: 'brightness',
                            onAction() {
                                // self.isDark = !self.isDark
                                // self.$mount()
                                // self.$nuxt.$options.store.dispatch('phrases/setDrawer', true)
                            },
                        })
                        editor.addCommand('uppercase', function (e) {
                            console.log(e)
                        })

                        editor.ui.registry.addToggleButton('speech', {
                            onAction: () => {
                                console.log('speech')
                            },
                        })

                        editor.ui.registry.addButton('copyToClipboard', {
                            icon: 'CustomCopy',
                            tooltip: t('layout.copiar'),
                            onAction: () => {
                                const html = new Blob([editor.getContent({ format: 'html' }).replace("<p>&nbsp;</p>", "")], {
                                    type: 'text/html',
                                })
                                const text = new Blob([editor.getContent({ format: 'text' }).replace("<p>&nbsp;</p>", "")], {
                                    type: 'text/plain',
                                })
                                const data = new ClipboardItem({
                                    'text/html': html,
                                    'text/plain': text,
                                })
                                navigator.clipboard.write([data])
                            },
                        })

                        editor.ui.registry.addToggleButton('speech-help', {
                            onAction: () => {
                                console.log('help')
                            },
                        })
                    },
                }}
            />
        </div>
    )
}
