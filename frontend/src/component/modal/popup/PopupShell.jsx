import { Activity } from "react";
import { useChat } from "../../../context/ChatContext";

const PopupShell = ({ visible, children }) => {

    const {setPopup} =  useChat()

  return (
    <Activity mode={visible ? "visible" : "hidden"}>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40"
        onClick={() => setPopup(null)}
        role="dialog"
        aria-modal="true"
        aria-hidden={!visible}
      >
        <div className="bg-white w-96 p-8 rounded-2xl shadow-xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}>
        {children}
        </div>
      </div>
    </Activity>
  );
};

export default PopupShell;
