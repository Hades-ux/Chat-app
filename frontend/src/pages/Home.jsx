import SideBar from "../component/SideBar.jsx";
import ConnectionList from "../component/ConnectionList.jsx";
import MessagePanel from "../component/MessagePanel.jsx";
import PanelShell from "../component/modal/panels/PanelShell.jsx";
import { useChat } from "../context/ChatContext.jsx";
import { PANELS } from "../context/UIState.js";
import Profile from "../component/Profile.jsx";
import Setting from "../component/Setting.jsx";

const Home = () => {
  const { activePanel } = useChat();

  return (
    <div className="h-screen bg-orange-50 flex font-serif overflow-hidden">
      {/* left panel */}
      <SideBar />

      {/* Middle panel */}
      <PanelShell visible={PANELS.CONNECTION_LIST === activePanel}>
        <ConnectionList />
      </PanelShell>

      <PanelShell visible={PANELS.USER_PROFILE === activePanel}>
        <Profile />
      </PanelShell>

      <PanelShell visible={PANELS.SETTINGS === activePanel}>
        <Setting />
      </PanelShell>

      {/* Right panel */}
      <MessagePanel />
    </div>
  );
};

export default Home;
