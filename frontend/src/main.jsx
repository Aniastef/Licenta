import * as React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { RecoilRoot } from "recoil";
import theme from "../theme.js";
import { CartProvider } from "./components/CartContext.jsx";

createRoot(document.getElementById("root")).render(
    <RecoilRoot>
      <BrowserRouter>
        <ChakraProvider theme={theme}> 
          <App />
        </ChakraProvider>
      </BrowserRouter>
    </RecoilRoot>

);
