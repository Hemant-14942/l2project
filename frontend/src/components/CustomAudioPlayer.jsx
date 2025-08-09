import 'react-h5-audio-player/lib/styles.css';
import AudioPlayer from 'react-h5-audio-player';
import { useEffect, React } from 'react';

function CustomAudioPlayer({ src }) {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .rhap_container {
        background-color: #0f172a !important; /* Deep dark bg */
        border-radius: 1rem !important;
        padding: 0.75rem 1.25rem !important;
        box-shadow: 0 0 20px rgba(168, 85, 247, 0.1); /* Soft purple glow */
        
      }

      .rhap_main-controls-button {
        color: #a855f7 !important; /* Purple */
        font-size: 1.75rem !important;
        transition: transform 0.25s ease, box-shadow 0.25s ease;
      }

      // .rhap_main-controls-button:hover {
      //   transform: scale(1.15);
      //   box-shadow: 0 0 10px #a855f7;
      // }

      .rhap_progress-bar-show-download {
        background-color: #1e293b !important; /* Dark progress bg */
        height: 6px !important;
        border-radius: 4px;
      }

      .rhap_progress-filled {
        background-color: #a855f7 !important; /* Filled purple bar */
        border-radius: 4px;
      }

      .rhap_time {
        font-size: 0.75rem !important;
        color: #94a3b8 !important; /* Slate text */
      }

      .rhap_volume-controls {
        display: none !important;
      }

      .rhap_progress-indicator {
        background-color: #a855f7 !important;
        width: 12px !important;
        height: 12px !important;
        margin-top: -3px !important;
        box-shadow: 0 0 5px #a855f7;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto mt-6 rounded-2xl overflow-hidden">
      <AudioPlayer
        src={src}
        autoPlay={false}
        showJumpControls={false}
        customAdditionalControls={[]}
        layout="horizontal"
      />
    </div>
  );
}

export default CustomAudioPlayer;
