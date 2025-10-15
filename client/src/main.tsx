import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Simple test to check if React is working
console.log("React main.tsx loaded successfully");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found!");
} else {
  console.log("Root element found, rendering App");
  createRoot(rootElement).render(<App />);
}
