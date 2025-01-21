import React from 'react';
import { Box, Typography } from '@mui/material';

export default function CustomButton({label, onClick}: {label: string, onClick: () => void}) {
    return (
        <Box 
        sx={{
          display: 'flex',
          backgroundColor: '#509CDB',
          borderRadius: '4px',
          padding: '5px',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '#4084C2'
          }
        }} 
        onClick={onClick}
      >
        <Typography sx={{ 
          color: '#FFF',
          fontSize: '14px',
          fontWeight: '600',
          lineHeight: '16px',
          letterSpacing: '0.2px',
          textAlign: 'center',
          fontFamily: 'Kumbh Sans'
        }}>
          {label}
        </Typography>
        </Box>   
        
    )
}