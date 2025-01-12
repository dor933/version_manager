import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface NotificationProps {
  open: boolean;
  onClose: () => void;
  versions_near_eosl: any[];
}

const Notification: React.FC<NotificationProps> = ({ open, onClose, versions_near_eosl }) => {
  if (!open) return null;

  return (
    <Paper
      sx={{
        position: 'absolute',
        left: '35px',
        top: '30px',
        width: '300px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      }}
    >
      <Box sx={{ p: 2}}>
        <Grid container sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <Typography variant="h6" sx={{  fontFamily: 'Kumbh Sans', fontSize: '14px' }}>
          Notifications
        </Typography>
        <CheckCircleIcon sx={{color:'#152259', cursor:'pointer', fontSize:'20px'}} onClick={onClose}/>
        </Grid>
        <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
          {versions_near_eosl.map((version) => (
            <Box 
              key={`${version.ProductName}-${version.VersionName}`} 
              sx={{ p: 1, borderBottom: '1px solid #eee' }}
            >
              <Typography sx={{ fontSize: '12px', color: '#424242', fontFamily: 'Kumbh Sans' }}>
                {version.ProductName} {version.VersionName} is nearing end of support life
              </Typography>
              <Typography sx={{ fontSize: '10px', color: '#666', mt: 0.5, fontFamily: 'Kumbh Sans' }}>
                End of support life: {new Date(version.EndOfSupportDate).toLocaleString('he-IL').split(',')[0]}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default Notification; 