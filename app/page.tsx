"use client"
import {EditorTinyMCE} from '@/components/Tiny';
import { Layout } from 'antd';
import React, { useState } from 'react';

const {Content,Sider} = Layout
export default function Page() {
  return (
      <Layout style={{height:"100%"}} hasSider>
        {/* <Sider>
          <h1>Menu</h1>
        </Sider> */}
        <Content>
          <EditorTinyMCE initialValue='Teste' />
        </Content>
      </Layout>
  )
}
