import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter, Route } from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import App from "./App";
import { initializeMathJax } from "./components/CalculationReport/mathjaxSetup";
import HomeBar from "./components/HomeBar/HomeBar";
import "./index.css?v=1";
import reportWebVitals from "./reportWebVitals";

// TODO:
// - Add member group summary section to calc report (by load case) - max compression, max tension, longest compression
// - Replace analysis call with design call
// - Add design results and report for each member group
// - Add load cases and analyze truss for each load case
// - Remove metric unit option
// - Update home page, copy, etc.
// - Break into multi-part form with breadcrumb navi: geometry, loading, section/design inputs, design acceptance, report
// - migrate from query params to persisted and global state
// - Better design calcs for group with both tension and compression

initializeMathJax();

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
    <BrowserRouter>
      <QueryParamProvider ReactRouterRoute={Route}>
        <App />
      </QueryParamProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
