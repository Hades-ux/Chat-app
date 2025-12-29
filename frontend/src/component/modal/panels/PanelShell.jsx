import { Activity } from "react";

const PanelShell = ({ visible, children }) => {
  return (
    <Activity mode={visible ? "visible" : "hidden"}>
      <div 
      aria-hidden={!visible}
      className="w-4/12 border-r border-gray-200 py-5 px-5 bg-gray-50">
        
            <div>
                {children}
            </div>
        </div>
    </Activity>
  );
};

export default PanelShell;
