import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './Router/AppRouter.jsx'
import { Provider } from 'react-redux'
import { store } from './Api/Redux/store.jsx'
import GlobalModal from './Component/GlobalModal.jsx'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './Component/theme.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
        <GlobalModal />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
