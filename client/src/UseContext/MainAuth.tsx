//create a context for the auth

import * as React from 'react';
import { createContext, useContext, useState } from 'react';
import { VersionData } from '../types';

const AuthContext = createContext<{
  versions: VersionData[] | null;
  setVersions: React.Dispatch<React.SetStateAction<VersionData[] | null>>;
  opendialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  chosenproduct: any;
  setChosenProduct: React.Dispatch<React.SetStateAction<any>>;
  productsandmodules: any;
  setProductsAndModules: React.Dispatch<React.SetStateAction<any>>;
  ispopupopen: boolean;
  setIsPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  issucceeded: boolean;
  setIssucceeded: React.Dispatch<React.SetStateAction<boolean>>;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  mainMessage: string;
  setMainMessage: React.Dispatch<React.SetStateAction<string>>;
  subMessage: string;
  setSubMessage: React.Dispatch<React.SetStateAction<string>>;
  buttonText: string;
  setButtonText: React.Dispatch<React.SetStateAction<string>>;


   }>({
  versions: null,
  setVersions: () => null,
  opendialog: false,
  setOpenDialog: () => null,
  chosenproduct: null,
  setChosenProduct: () => null,
  productsandmodules: null,
  setProductsAndModules: () => null,
  ispopupopen: false,
  setIsPopupOpen: () => null,
  issucceeded: false,
  setIssucceeded: () => null,
  message: '',
  setMessage: () => null,
  title: '',
  setTitle: () => null,
  mainMessage: '',
  setMainMessage: () => null,
  subMessage: '',
  setSubMessage: () => null,
  buttonText: '',
  setButtonText: () => null,




});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [versions, setVersions] = useState<VersionData[] | null>(null);
  const [opendialog, setOpenDialog] = useState<boolean>(false);
  const [productsandmodules, setProductsAndModules] = useState<any>(null);
  const [chosenproduct, setChosenProduct] = useState<any>(null);
  const [ispopupopen, setIsPopupOpen] = useState<boolean>(false);
  const [issucceeded, setIssucceeded] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [mainMessage, setMainMessage] = useState<string>('');
  const [subMessage, setSubMessage] = useState<string>('');
  const [buttonText, setButtonText] = useState<string>('');

  return <AuthContext.Provider value={{ 
    versions, 
    setVersions, 
    opendialog, 
    setOpenDialog,
  
    productsandmodules,
    setProductsAndModules,
    chosenproduct,
    setChosenProduct,
    ispopupopen,
    setIsPopupOpen,
    issucceeded,
    setIssucceeded,
    message,
    setMessage,
    title,
    setTitle,
    mainMessage,
    setMainMessage,
    subMessage,
    setSubMessage,
    buttonText,
    setButtonText,





  }}>{children}</AuthContext.Provider>;
};


