import * as React from 'react';

import { createContext, useState } from 'react';

const PhotosContext = createContext<{
    photos: any;
    setPhotos: React.Dispatch<React.SetStateAction<any>>;
}>({
    photos: null,
    setPhotos: () => null,
});

export const PhotosProvider = ({ children }: { children: React.ReactNode }) => {
    const [photos, setPhotos] = useState(null);
    return (
        <PhotosContext.Provider value={{ photos, setPhotos }}>
            {children}
        </PhotosContext.Provider>
    );
};