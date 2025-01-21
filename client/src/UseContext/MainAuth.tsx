//create a context for the auth

import * as React from 'react';
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext<{
  versions: any[] | null;
  setVersions: React.Dispatch<React.SetStateAction<any[] | null>>;
  opendialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  chosenproduct: any;
  setChosenProduct: React.Dispatch<React.SetStateAction<any>>;
  productsandmodules: any;
  setProductsAndModules: React.Dispatch<React.SetStateAction<any>>;
}>({
  versions: null,
  setVersions: () => null,
  opendialog: false,
  setOpenDialog: () => null,
  chosenproduct: null,
  setChosenProduct: () => null,
  productsandmodules: null,
  setProductsAndModules: () => null



});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [versions, setVersions] = useState<any[] | null>(null);
  const [opendialog, setOpenDialog] = useState<boolean>(false);
  const [productsandmodules, setProductsAndModules] = useState<any>(null);
  const [chosenproduct, setChosenProduct] = useState<any>(null);

  return <AuthContext.Provider value={{ 
    versions, 
    setVersions, 
    opendialog, 
    setOpenDialog,
  
    productsandmodules,
    setProductsAndModules,
    chosenproduct,
    setChosenProduct,


  }}>{children}</AuthContext.Provider>;
};


