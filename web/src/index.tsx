import React from "react";
// import { createRoot } from 'react-dom/client';
import ReactDOM from "react-dom/client";
import App from "./App";
import "./assets/styles/App.css";
import { BrowserRouter as Router } from "react-router-dom";
import "mapbox-gl/dist/mapbox-gl.css";

// If you are using AWS Amplify, uncomment the following lines after running `amplify init`
// import Amplify from 'aws-amplify';
// import config from './aws-exports';
// Amplify.configure(config);

// const root = document.getElementById('root');
// const rootRender = root.createRoot ? root.createRoot() : createRoot(root);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Router>
    <App />
  </Router>
);
