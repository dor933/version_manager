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

export default function ImageHandler({setImages, handleAddPhotos, isreport}: {setImages: (images: File[]) => void, handleAddPhotos?: () => void, isreport?: boolean}) {
  const [isUploaded, setIsUploaded] = React.useState(false);
  const [previews, setPreviews] = React.useState<string[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(files);
    setIsUploaded(true);

    // Create previews for the uploaded images
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  // Cleanup URLs on unmount
  React.useEffect(() => {
    return () => {
      previews.forEach(URL.revokeObjectURL);
    };
  }, [previews]);

  return (
    <Grid 
      container 
      spacing={1} 
      alignItems="center" 
      sx={{ 
        justifyContent: 'flex-start',
        flexWrap: 'nowrap',  
        width: 'fit-content' 
      }}
    >
      <Grid item>
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
      
      {!isreport && isUploaded && (
        <Grid item>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            ml: 1
          }} 
          onClick={handleAddPhotos}
          > 
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
          </Box>
        </Grid>
      )}

      {isreport && isUploaded && previews.length > 0 && (
        <Grid item sx={{ display: 'flex', gap: 1, ml: 1 }}>
          {previews.map((preview, index) => (
            <Box
              key={index}
              component="img"
              src={preview}
              sx={{
                width: 40,
                height: 40,
                borderRadius: '4px',
                objectFit: 'cover'
              }}
            />
          ))}
        </Grid>
      )}
    </Grid>
  );
}
