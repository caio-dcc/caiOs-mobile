import React, { createContext, useContext } from 'react';

// Espelha as props go/openModal/assistantPrompt que o App.jsx web passa pra cada rota.
const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);
export const AppProvider = Ctx.Provider;
