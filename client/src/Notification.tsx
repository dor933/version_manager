import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
//import close icon
import CancelIcon from '@mui/icons-material/Cancel';
import { z } from 'zod';
import axios from 'axios';
import { response } from 'express';


interface NotificationProps {
  open: boolean;
  onClose: () => void;
  versions_near_eosl: any[];
  type: string;
  distinctVendors?: string[];
}

const emailSchema = z.string().email();

const Notification: React.FC<NotificationProps> = ({ open, onClose, versions_near_eosl,type, distinctVendors }) => {


    const [chosenVendor, setChosenVendor] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

    const handleSubscribe = () => {
        if(chosenVendor === '') {
            alert('Please select a vendor');
            return;
        }
        
        const emailValidation = emailSchema.safeParse(email);
        if (!emailValidation.success) {
            alert('Please enter a valid email address');
            return;
        }

        axios.post('http://localhost:3001/api/subscribe', {
            vendor: chosenVendor,
            email: email
        })
        .then((response) => {
            console.log('response', response);
            return response.data;
        })
        .then(data => {
            console.log(data);
            if(data.subscribe==='Already Subscribed'){
                alert('You are already subscribed to notifications');
            }
            else if(data.subscribe){
                alert('You are now subscribed to notifications');
            }
            else{
                alert('Error subscribing');
            }
        })
        .catch(error => console.error('Error subscribing:', error));
        
        console.log(chosenVendor, email);
    }

  if (!open) return null;

  return (
    <>
      {type === 'notifications' ? (
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
            <CancelIcon sx={{color:'#152259', cursor:'pointer', fontSize:'20px'}} onClick={onClose}/>
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
      ) : (
        <Paper
          sx={{
            position: 'absolute',
            right: '45px',
            top: '75px',
            width: '300px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
          }}
        >

<Box sx={{ p: 2}}>
            <Grid container sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                
            <Typography variant="h6" sx={{  fontFamily: 'Kumbh Sans', fontSize: '14px', }}>
              Subscribe to Notifications
            </Typography>
            
            <CancelIcon sx={{color:'#152259', cursor:'pointer', fontSize:'20px'}} onClick={onClose}/>
            </Grid>
            <Box sx={{ p: 2 }}>
         
              
              <Box sx={{ 
                maxHeight: '300px', 
                overflowY: 'auto', 
                gap: '5px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginTop: '10px' 
              }}>
                <Grid container spacing={2} sx={{ width: '100%' }}>
                  <Grid item xs={12}>
                    <TextField 
                      label="Email" 
                      variant="outlined" 
                      fullWidth
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          width: '100%'
                        }
                      }} 
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel id="vendor-label">Vendor</InputLabel>

                <Select 
                label="Vendor"
                fullWidth
                value={chosenVendor}
                onChange={(e) => setChosenVendor(e.target.value)}
                sx={{width:'100%'}}
                >
                    <MenuItem value="All Vendors">All Vendors</MenuItem>
                 {distinctVendors?.map((vendor) => (
                  <MenuItem value={vendor}>{vendor}</MenuItem>
                 ))}
                </Select>
                </FormControl>

                  </Grid>
                  <Grid item xs={12} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row'}}>
                  <Box sx={{display:'flex', backgroundColor:'#509CDB', borderRadius:'4px', paddingLeft:'13px', paddingRight:'13px', paddingTop:'14px', paddingBottom:'14px', cursor:'pointer'}} onClick={()=>{handleSubscribe(); }}>
                <Typography  sx={{ color: '#FFF', fontSize:'14px', fontWeight:'600', lineHeight:'16px', letterSpacing:'0.2px', textAlign:'center', fontFamily:'Kumbh Sans' }}>
                    Subscribe
                </Typography>
             </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>
            
        </Paper>
      )}
    </>
  );
};

export default Notification; 