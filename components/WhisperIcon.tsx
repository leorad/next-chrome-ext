import type { SVGProps } from 'react'

export default function IconParkVoiceInput(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 48 48"
      {...props}
    >
      <g
        fill="none"
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
      >
        <path d="M4 30C4 36.6274 9.37258 42 16 42C22.6274 42 26 38 27 35L28.5385 30L35 9L44 42"></path>
        <path d="M40.7274 30H28.5386"></path>
        <path
          fill="#006eff"
          // eslint-disable-next-line max-len
          d="M22 15C22 11.6863 19.3137 9 16 9C12.6863 9 10 11.6863 10 15V30C10 33.3137 12.6863 36 16 36C19.3137 36 22 33.3137 22 30V15Z"
        ></path>
      </g>
    </svg>
  )
}
