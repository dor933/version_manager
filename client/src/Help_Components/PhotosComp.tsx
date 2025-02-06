import React, {  useState } from "react";
import { Dialog, DialogContent, Grid, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { apiService } from "../API/apiService";


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
          <Grid container item xs={10} sx={{display:'flex',justifyContent:'center',flexDirection:'row',alignItems:'center',margin:'0 auto'}}>
            {photos.map((photo, index) => (
              <Grid item xs={12} sm={6} md={4} key={index} style={{borderRight: index !== photos.length - 1 ? '1px solid #E0E0E0' : 'none',paddingLeft:'10px',paddingRight:'10px',marginBottom:'10px',alignItems:'center',justifyContent:'center'}}>
                <img
                  src={apiService.photoUrl(photo)}
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
              src={apiService.photoUrl(selectedPhoto)}
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

