import * as React from 'react';

import { createContext, useState } from 'react';

const PopUpContext = createContext<{
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

export const PopUpProvider = ({ children }: { children: React.ReactNode }) => {
    const [ispopupopen, setIsPopupOpen] = useState(false);
    const [issucceeded, setIssucceeded] = useState(false);
    const [message, setMessage] = useState('');
    const [title, setTitle] = useState('');
    const [mainMessage, setMainMessage] = useState('');
    const [subMessage, setSubMessage] = useState('');
    const [buttonText, setButtonText] = useState('');   

    return (
        <PopUpContext.Provider value={{ ispopupopen, setIsPopupOpen, issucceeded, setIssucceeded, message, setMessage, title, setTitle, mainMessage, setMainMessage, subMessage, setSubMessage, buttonText, setButtonText }}>
            {children}
        </PopUpContext.Provider>
    );
};  

