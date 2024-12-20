import * as React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { RecoilRoot } from 'recoil';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RecoilRoot>
    <BrowserRouter>
    <ChakraProvider>
    <App />
    </ChakraProvider>
    </BrowserRouter>
    </RecoilRoot>
  </StrictMode>,
)
