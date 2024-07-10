"use client"
import {EditorTinyMCE} from '@/components/Tiny';
import { Button, Layout } from 'antd';
import React, { useState } from 'react';

const {Content,Sider} = Layout
export default function Page() {
  return (
      <Layout style={{height:"550px",width:"100%"}} hasSider>
        <Content>
          {/* <EditorTinyMCE initialValue='Teste' /> */}
        <iframe allow="microfone; camera" height={"100%"} width={"100%"} src='https://app.aiframe.leorad.com.br/'/>
        </Content>
      </Layout>

  )
}
