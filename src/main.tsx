import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applySkin, getSavedSkin } from "./lib/skins";

applySkin(getSavedSkin());

createRoot(document.getElementById("root")!).render(<App />);
