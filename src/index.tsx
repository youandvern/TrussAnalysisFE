import React from "react";
import * as ReactDOMClient from "react-dom/client";
import "./index.css?v=1";
import App from "./App";
import HomeBar from "./components/HomeBar";
import reportWebVitals from "./reportWebVitals";

const headerRootContainer = document.getElementById("headerPanel");
if (!headerRootContainer) throw new Error("Failed to find header root element");
const headerRoot = ReactDOMClient.createRoot(headerRootContainer);
headerRoot.render(
  <React.StrictMode>
    <HomeBar />
  </React.StrictMode>
);

const mainRootContainer = document.getElementById("root");
if (!mainRootContainer) throw new Error("Failed to find root element");
const mainRoot = ReactDOMClient.createRoot(mainRootContainer);
mainRoot.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
