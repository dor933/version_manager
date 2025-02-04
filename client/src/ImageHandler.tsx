import React from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';  
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckIcon from '@mui/icons-material/Check';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function ImageHandler({setImages, handleAddPhotos}: {setImages: (images: File[]) => void, handleAddPhotos?: () => void}) {
  const [isUploaded, setIsUploaded] = React.useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(files);
    setIsUploaded(true);
  };

  return (
    <Grid container spacing={1} alignItems="center" sx={{ justifyContent: 'flex-start' }}>
      <Grid item xs={isUploaded ? 'auto' : 'auto'}>
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          sx={{
            minWidth: 'fit-content',
            fontFamily: 'Kumbh Sans',
            fontWeight: '500',
            fontSize: '14px'
          }}
        >
          Upload
          <VisuallyHiddenInput type="file" multiple onChange={handleFileSelect} accept="image/*"/>
        </Button>
      </Grid>
      
      {isUploaded && (
        <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1, cursor:'pointer' }} onClick={handleAddPhotos}> 
          <Typography 
            variant="body2" 
            sx={{
              fontFamily: 'Kumbh Sans',
              fontWeight: '500',
              fontSize: '14px',
              color: '#45a049',
              whiteSpace: 'nowrap'
            }}
          >
            Click Here
          </Typography>
          <CheckIcon 
            fontSize="small"
            sx={{
              color: '#45a049',
              animation: 'blink 1s infinite',
              '@keyframes blink': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0 },
                '100%': { opacity: 1 },
              },
            }}
          />
        </Grid>
      )}
    </Grid>
  );
}
