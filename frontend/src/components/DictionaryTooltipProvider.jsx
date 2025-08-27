import { useEffect, useState } from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "../index.css";

export default function DictionaryTooltipProvider({ children }) {
  const [meaning, setMeaning] = useState("");
  const [coords, setCoords] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleDblClick = async (e) => {
      const selected = window.getSelection().toString().trim();
      if (!selected) return;

      setCoords({ x: e.clientX, y: e.clientY });
      setVisible(true);
      setMeaning("Loading...");

      try {
        const res = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${selected}`
        );
        const data = await res.json();
        const def =
          data[0]?.meanings[0]?.definitions[0]?.definition || "No meaning found";
        setMeaning(def);
      } catch {
        setMeaning("Error fetching meaning.");
      }
    };

    document.addEventListener("dblclick", handleDblClick);
    return () => document.removeEventListener("dblclick", handleDblClick);
  }, []);

  return (
    <>
      {children}
      {coords && (
        <Tippy
          content={
            <div className="dictionary-tooltip">
              <h4 className="tooltip-title">Meaning</h4>
              <p className="tooltip-text">{meaning}</p>
            </div>
          }
          visible={visible}
          getReferenceClientRect={() => ({
            width: 0,
            height: 0,
            top: coords.y,
            bottom: coords.y,
            left: coords.x,
            right: coords.x,
          })}
          onClickOutside={() => setVisible(false)}
          theme="light-dictionary"
        >
          <span />
        </Tippy>
      )}
    </>
  );
}
