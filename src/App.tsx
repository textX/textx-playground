import Header from "./components/Header";
import Playground from "./pages/Playground";
import { EditorsProvider } from "./utils/editorContext";

function App() {

  return (
    <div className="flex flex-col h-full text-[#262626] dark:text-[#ebebeb] bg-white dark:bg-gray-900">
      <EditorsProvider>
        <Header />
        <Playground />
      </EditorsProvider>
    </div>
  )
}

export default App;