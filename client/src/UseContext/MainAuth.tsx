//create a context for the auth

import * as React from 'react';
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext<{
  versions: any[] | null;
  setVersions: React.Dispatch<React.SetStateAction<any[] | null>>;
  opendialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;

}>({
  versions: null,
  setVersions: () => null,
  opendialog: false,
  setOpenDialog: () => null,

});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [versions, setVersions] = useState<any[] | null>(null);
  const [opendialog, setOpenDialog] = useState<boolean>(false);

  return <AuthContext.Provider value={{ 
    versions, 
    setVersions, 
    opendialog, 
    setOpenDialog,

  }}>{children}</AuthContext.Provider>;
};


