import { MutableRefObject, ReactNode, createContext, useContext, useRef } from "react";

type TextxWorkerContextType = {
    textxWorkerRef: MutableRefObject<Worker | undefined>;
}

const TextxWorkerContext = createContext<TextxWorkerContextType>({} as TextxWorkerContextType);

const useTextxWorkerContext = () => {
    return useContext(TextxWorkerContext);
}

const TextxWorkerProvider = ({ children }: { children: ReactNode }) => {
    const textxWorkerRef = useRef<Worker>();

    return (
        <TextxWorkerContext.Provider value={{ textxWorkerRef }}>
            {children}
        </TextxWorkerContext.Provider>
    );
}

export {
    TextxWorkerProvider, useTextxWorkerContext
};
