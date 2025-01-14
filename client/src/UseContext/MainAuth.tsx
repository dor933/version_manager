//create a context for the auth

import * as React from 'react';
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext<{
  versions: any[] | null;
  setVersions: React.Dispatch<React.SetStateAction<any[] | null>>;
  opendialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  searchvalue: string;
  setSearchvalue: React.Dispatch<React.SetStateAction<string>>;
}>({
  versions: null,
  setVersions: () => null,
  opendialog: false,
  setOpenDialog: () => null,
  searchvalue: '',
  setSearchvalue: () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [versions, setVersions] = useState<any[] | null>(null);
  const [opendialog, setOpenDialog] = useState<boolean>(false);
  const [searchvalue, setSearchvalue] = useState<string>('');

  return <AuthContext.Provider value={{ 
    versions, 
    setVersions, 
    opendialog, 
    setOpenDialog,
    searchvalue,
    setSearchvalue 
  }}>{children}</AuthContext.Provider>;
};


