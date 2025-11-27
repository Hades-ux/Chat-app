import SideBar from "../component/sideBar.jsx";
import ConnectionList from "../component/ConnectionList.jsx";
import MessagePanel from "../component/MessagePanel.jsx";

const Home = () => {
  return (
    <div className="h-screen bg-orange-50 flex font-serif overflow-hidden">
      {/* sidebar panel */}

      <SideBar />

      <ConnectionList />

      <MessagePanel />
    </div>
  );
};

export default Home;
