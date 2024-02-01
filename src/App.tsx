import Header from "./components/Header";
import Playground from "./pages/Playground";

function App() {

  return (
    <div className="flex flex-col h-full text-[#262626] dark:text-[#ebebeb] bg-white dark:bg-gray-900">
      <Header />
      <Playground />
    </div>
  )
}

export default App;