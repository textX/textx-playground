import Header from "./components/header/Header";
import Playground from "./pages/Playground";
import { EditorsProvider } from "./context/editorContext";
import { TextxWorkerProvider } from "./context/textxWorkerContext";

function App() {

  return (
    <div className="flex flex-col h-full text-[#262626] dark:text-[#ebebeb] bg-white dark:bg-gray-900">
      <EditorsProvider>
        <TextxWorkerProvider>
          <Header />
          <Playground />
        </TextxWorkerProvider>
      </EditorsProvider>
    </div>
  )
}

export default App;