import Header from "./components/Header";
import Playground from "./pages/Playground";

function App() {

  return (
    <div className="flex flex-col h-full text-[#262626]">
      <Header />
      <Playground />
    </div>
  )
}

export default App;