import "@/styles/app.css"
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, theme } from 'antd'
import { Noto_Sans_Mono } from 'next/font/google'
const font = Noto_Sans_Mono({
  subsets: ['latin'],
  weight: '400',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html style={{ height: "100vh" }} title="Laudos com IA" lang="pt-br">
      <ConfigProvider
        theme={{

          token: {
            colorPrimary: "#4566c5",
          },
          // algorithm: theme.darkAlgorithm,
        }}>
        <body style={{ height: "100%" }} className={font.className}>

          <AntdRegistry>{children}</AntdRegistry>

        </body>
      </ConfigProvider>
    </html>
  )
}
