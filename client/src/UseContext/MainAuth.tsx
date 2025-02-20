//create a context for the auth

import * as React from 'react';
import { createContext, useContext, useState } from 'react';
import { VersionData } from '../Types/MainDataTypes';

const AuthContext = createContext<{
  versions: VersionData[] | null;
  setVersions: React.Dispatch<React.SetStateAction<VersionData[] | null>>;
  opendialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  productsandmodules: any;
  setProductsAndModules: React.Dispatch<React.SetStateAction<any>>;
  isphotosopen: boolean;
  setIsPhotosOpen: React.Dispatch<React.SetStateAction<boolean>>;



   }>({
  versions: null,
  setVersions: () => null,
  opendialog: false,
  setOpenDialog: () => null,
  productsandmodules: null,
  setProductsAndModules: () => null,
  isphotosopen: false,
  setIsPhotosOpen: () => null,





});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [versions, setVersions] = useState<VersionData[] | null>(null);
  const [opendialog, setOpenDialog] = useState<boolean>(false);
  const [productsandmodules, setProductsAndModules] = useState<any>(null);
  const [isphotosopen, setIsPhotosOpen] = useState<boolean>(false);

  return <AuthContext.Provider value={{ 
    versions, 
    setVersions, 
    opendialog, 
    setOpenDialog,
    productsandmodules,
    setProductsAndModules,
    isphotosopen,
    setIsPhotosOpen,




  }}>{children}</AuthContext.Provider>;
};


