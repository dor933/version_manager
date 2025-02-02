import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, Grid, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from "./UseContext/MainAuth";

interface PhotosCompProps {
  photos: string[];
  isphotosopen: boolean;
  setIsPhotosOpen: (open: boolean) => void;
}

export const PhotosComp = ({ photos, isphotosopen, setIsPhotosOpen }: PhotosCompProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleClose = () => {
    setIsPhotosOpen(false);
    setSelectedPhoto(null);
  };

  const handlePhotoClick = (photo: string) => {
    setSelectedPhoto(photo);
  };

  return (
    <>
      {/* Grid view of photos */}
      <Dialog 
        open={isphotosopen} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500',
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {photos.map((photo, index) => (
              <Grid item xs={12} sm={6} md={4} key={index} style={{borderRight:'1px solid #E0E0E0',paddingLeft:'10px',paddingRight:'10px'}}>
                <img
                  src={'http://192.168.27.42:3001'+photo}
                  alt={`Issue photo ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                 

                  }}
                  onClick={() => handlePhotoClick(photo)}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Full-size photo view */}
      <Dialog 
        open={!!selectedPhoto} 
        onClose={() => setSelectedPhoto(null)}
        maxWidth="xl"
      >
        <IconButton
          onClick={() => setSelectedPhoto(null)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: 0 }}>
          {selectedPhoto && (
            <img
              src={'http://192.168.27.42:3001'+selectedPhoto}
              alt="Full size"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

