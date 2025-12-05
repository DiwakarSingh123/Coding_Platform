import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'
import { ClerkProvider } from '@clerk/clerk-react'
import { Provider } from 'react-redux'
import store from './store/store.js'
//  const clerkPubKey = "pk_test_d2VsY29tZS1veC0xMi5jbGVyay5hY2NvdW50cy5kZXYk";


createRoot(document.getElementById('root')).render(
      
      <Provider store={store}>
      <BrowserRouter>
      <App />
      </BrowserRouter>
      </Provider>
      
    //    <ClerkProvider publishableKey={clerkPubKey}>
    // </ClerkProvider>
   
)
