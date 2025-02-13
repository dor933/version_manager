import React, {  useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, FormControl } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { z } from 'zod';
import axios from 'axios';
import FormControlSelect from './NotificationSelect';
import { useAuth } from '../UseContext/MainAuth';
import { apiService } from '../API/apiService';
import { useReport } from '../hooks/useReport';

interface NotificationProps {
  open: boolean;
  onClose: () => void;
  versions_to_notify: any[];
  type: string;
  distinctVendors?: string[];
  versions: any[];
}

const emailSchema = z.string().email();

const customTextFieldStyle = {
  '& .MuiOutlinedInput-root': {
    height: '53.5px',
    fontFamily: 'Kumbh Sans',
    '& fieldset': {
      borderColor: '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: '#2D88D4',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2D88D4',
    }
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'Kumbh Sans',
    fontSize: '15px',
    color: '#424242',
    '&.Mui-focused': {
      color: '#2D88D4'
    },
    transform: 'translate(14px, 16px) scale(1)',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -3px) scale(0.75)',
    }
  },



  '& .MuiOutlinedInput-input': {
    padding: '14px',
    fontSize: '14px',
    color: '#424242'
  }
};

const customSelectStyle = {
  '& .MuiOutlinedInput-root': {
    height: '50px',
    fontFamily: 'Kumbh Sans',
    '& fieldset': {
      borderColor: '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: '#2D88D4',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2D88D4',
    }
  },
  '& .MuiSelect-select': {
    padding: '16px',
    fontSize: '14px',
    color: '#424242',
    fontFamily: 'Kumbh Sans'
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'Kumbh Sans',
    fontSize: '14px',
    color: '#424242',
    '&.Mui-focused': {
      color: '#2D88D4'
    },
    
 
  }
};

const Notification: React.FC<NotificationProps> = ({ open, onClose, versions_to_notify,type, distinctVendors, versions }) => {


  const [email, setEmail] = useState<string>('');
  const [vendor, setVendor] = useState('');
  const [products, setProducts] = useState([]);
  const [singleproduct, setSingleProduct] = useState('');
  const [isproductsdisabled, setIsProductsDisabled] = useState(true);
  const [Unit, setUnit] = useState('');
  const [Interval, setinterval] = useState('');
  const { showError, showSuccess } = useReport();

  useEffect(() => {



      if(vendor==='All Vendors'){
       setSingleProduct('All Products');
       setIsProductsDisabled(true);
       return;
      }
      else{
        let allProducts:any = [...new Set(versions.filter((version: any) => version.VendorName === vendor).map((version: any) => version.ProductName))];
        setProducts(allProducts);
        console.log(allProducts);
      }
     
      setIsProductsDisabled(false);
      setSingleProduct('');


  }, [vendor,versions]);

 

    const handleSubscribe = () => {
        if(vendor === '') {
           showError('Please select a vendor');
           return;
        }
        else if(singleproduct === ''){
           showError('Please select a product');
           return;
        }
      
        else if(Unit === ''){
           showError('Please select a unit');
           return;
        }
        else if(Interval === ''){
           showError('Please select an interval');
           return;
        }
   
        const emailValidation = emailSchema.safeParse(email);
        if (!emailValidation.success) {
          
           showError('Please enter a valid email address');
           return;
        }

        apiService.subscribe({
              vendor: vendor,
            email: email,
            product: singleproduct,
            Unit_of_time: Unit,
            Frequency: parseInt(Interval)
        })
        .then((response) => {
            console.log('response', response);
            return response.data;
        })
        .then(data => {
            console.log(data);
            if(data.subscribe==='Already Subscribed'){
                showError('You are already subscribed to notifications');
            }
            else if(data.subscribe){
                showSuccess('You are now subscribed to notifications');
            }
            else{
                showError('Error subscribing');
            }
        })
        .catch(error => console.error('Error subscribing:', error));
        
        console.log(vendor, email, singleproduct, Unit, Interval);
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
              {versions_to_notify.map((version) => (
                <Box 
                  key={`${version.ProductName}-${version.VersionName}`} 
                  sx={{ p: 1, borderBottom: '1px solid #eee' }}
                >
                  <Typography sx={{ fontSize: '12px', color: '#424242', fontFamily: 'Kumbh Sans' }}>
                    {version.is_new ? `New Version! ${version.ProductName.replace(/_/g, ' ')} ${version.VersionName}` : `${version.ProductName.replace(/_/g, ' ')} ${version.VersionName} is nearing end of support life`} 
                  
                  </Typography>
                  <Typography sx={{ fontSize: '10px', color: '#666', mt: 0.5, fontFamily: 'Kumbh Sans' }}>
                    { !version.is_new &&
                    `End of support life: ${new Date(version.EndOfSupportDate).toLocaleString('he-IL').split(',')[0]}`
                    } 
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
            top: '100px',
            width: '400px',
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
                maxHeight: '400px', 
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
                    <FormControl fullWidth>

                    <TextField 
                      variant="outlined" 
                      label="Email"
                      fullWidth
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      sx={customTextFieldStyle}
                    />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
              
               <FormControlSelect   
                label="Vendor"
                singleitem={vendor}
                setSingleItem={setVendor}
                items={distinctVendors? distinctVendors : []}
                customSelectStyle={customSelectStyle}
                />
                  </Grid>
                  <Grid item xs={12}>
           
                  <FormControlSelect   
                  label="Product"
                  singleitem={singleproduct}
                  setSingleItem={setSingleProduct}
                  isitemdisabled={isproductsdisabled}
                  items={products}
                  customSelectStyle={customSelectStyle}
                  />
                  </Grid>
            
                  <Grid item xs={6}>
                    <FormControlSelect   
                    label="Unit"
                    singleitem={Unit}
                    setSingleItem={setUnit}
                    items={["Hours", "Days", "Months"]}
                    customSelectStyle={customSelectStyle}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField 
                      variant="outlined" 
                      label="Interval of time"
                      fullWidth
                      value={Interval}
                      onChange={(e) => setinterval(e.target.value)}
                      sx={customTextFieldStyle}
                    />
                  </Grid>
                  <Grid item xs={12} style={{
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center'
                  }}>
                    <Box 
                      sx={{
                        display: 'flex',
                        backgroundColor: '#509CDB',
                        borderRadius: '4px',
                        padding: '13px',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#4084C2'
                        }
                      }} 
                      onClick={handleSubscribe}
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