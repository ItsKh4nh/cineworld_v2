import { createContext, useState } from "react";
export const PopUpContext = createContext(null);

export default function PopUpContextProvider({ children }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <PopUpContext.Provider value={{ showModal, setShowModal }}>
      {children}
    </PopUpContext.Provider>
  );
}
