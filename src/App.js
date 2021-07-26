import "./App.css"
import React from "react"
import ProductData from "./api/products"
import Timeline from "./pages/Timeline"

function App() {
  return <Timeline data={ProductData}></Timeline>
}

export default App
