import { useEffect} from "react";
import { useChat } from "../context/ChatContext";
import { PANELS } from "../context/UIState.js";
import { POPUPS } from "../context/UIState.js";
import PopupShell from "./modal/popup/PopupShell";
import AddConection from "./AddConection";

const SideBar = () => {
  const { setActivePanel, popup, setPopup  } = useChat();

 

  // Close modal on Escape key
  useEffect(() => {
    if (!popup) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") setPopup(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      {/* SIDEBAR */}
      <nav className="w-20 h-screen border-r border-gray-200 flex flex-col items-center justify-between py-6 bg-gray-50 shadow-sm">
        <div className="flex flex-col items-center gap-6 w-full">
          <button
            aria-label="Add Connection"
            className="material-symbols-outlined cursor-pointer text-gray-700 hover:text-gray-900 transition text-3xl"
            onClick={()=> setPopup(POPUPS.ADD_CONNECTION)}
          >
            person_add
          </button>

          <button
            aria-label="Message"
             className="material-symbols-outlined cursor-pointer text-gray-700 hover:text-gray-900 transition text-3xl"
            onClick={() => setActivePanel(PANELS.CONNECTION_LIST)}
          >
            chat
          </button>
        </div>
        <div className="flex flex-col items-center gap-6 border-t pt-6 w-full">
          {/* setteing */}
          <button
            aria-label="Settings"
            className="material-symbols-outlined cursor-pointer text-gray-700 hover:text-gray-900 text-3xl"
            onClick={() => setActivePanel(PANELS.SETTINGS)}
          >
            settings
          </button>

          {/* Profile */}
          <button
            aria-label="Account"
            className="material-symbols-outlined cursor-pointer text-gray-700 hover:text-gray-900 text-3xl"
            onClick={() => setActivePanel(PANELS.OWNER_PROFILE)}
          >
            account_circle
          </button>
        </div>
      </nav>

      <PopupShell visible={POPUPS.ADD_CONNECTION === popup} >
          <AddConection/>
      </PopupShell>

    </>
  );
};

export default SideBar;
