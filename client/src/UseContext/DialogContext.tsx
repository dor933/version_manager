import * as React from 'react';
import { createContext, useState } from 'react';

const DialogContext = createContext<{
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  dialogOpen: false,
  setDialogOpen: () => null,
});

export const DialogProvider = ({ children }: { children: React.ReactNode }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    return (
        <DialogContext.Provider value={{ dialogOpen, setDialogOpen }}>
            {children}
        </DialogContext.Provider>
    );
};