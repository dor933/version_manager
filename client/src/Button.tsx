import React from 'react';
import { Box, Typography } from '@mui/material';

export default function CustomButton({label, onClick, opacity=1}: {label: string, onClick: () => void, opacity?: number}) {
    return (
        <Box 
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          backgroundColor: '#509CDB',
          borderRadius: '4px',
          opacity: opacity,
          padding: '5px 10px',
          cursor: opacity==0.5 ? 'default' : 'pointer',
          '&:hover': {
            backgroundColor: '#4084C2'
          },
          minWidth: 'fit-content'
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