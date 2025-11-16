
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  // Removed Toaster to disable in-app notifications

  createRoot(document.getElementById("root")!).render(
    <>
      <App />
    </>
  );
  