import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
//import close icon
import CancelIcon from '@mui/icons-material/Cancel';
import { z } from 'zod';
import axios from 'axios';
import { response } from 'express';
import { versions } from 'process';


interface NotificationProps {
  open: boolean;
  onClose: () => void;
  versions_near_eosl: any[];
  type: string;
  distinctVendors?: string[];
  versions: any[];
}

const emailSchema = z.string().email();

const customTextFieldStyle = {
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
    padding: '14px 16px',
    fontSize: '14px',
    color: '#424242'
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'Kumbh Sans',
    fontSize: '14px',
    color: '#424242',
    '&.Mui-focused': {
      color: '#2D88D4'
    }
  }
};

const Notification: React.FC<NotificationProps> = ({ open, onClose, versions_near_eosl,type, distinctVendors, versions }) => {


    const [email, setEmail] = useState<string>('');
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
    const [vendor, setVendor] = useState('');
  const [products, setProducts] = useState([]);
  const [singleproduct, setSingleProduct] = useState('');
  const [singleversion, setSingleVersion] = useState('');
  const [productVersions, setProductVersions] = useState([]);
  const [isproductsdisabled, setIsProductsDisabled] = useState(true);
  const [isversiondisabled, setIsVersionDisabled] = useState(true);



  useEffect(() => {



      if(vendor==='All Vendors'){
       let allProducts:any = [...new Set(versions.map((version: any) => version.ProductName))];
       setProducts(allProducts);
      }
      else{
        let allProducts:any = [...new Set(versions.filter((version: any) => version.VendorName === vendor).map((version: any) => version.ProductName))];
        setProducts(allProducts);
        console.log(allProducts);
      }
     
      setIsProductsDisabled(false);
      setIsVersionDisabled(true);
      setSingleProduct('');
      setSingleVersion('');


  }, [vendor]);

  useEffect(() => {
    if(singleproduct===''){
      return
    }
    else if(singleproduct==='All Products'){
      setIsVersionDisabled(true);
    }
    else{
      let allVersions:any = [...new Set(versions.filter((version: any) => version.ProductName === singleproduct).map((version: any) => version.VersionName))];
      setProductVersions(allVersions);
      setIsVersionDisabled(false);
    }
  }, [singleproduct]);



  






    const handleSubscribe = () => {
        if(vendor === '') {
            alert('Please select a vendor');
            return;
        }
        
        const emailValidation = emailSchema.safeParse(email);
        if (!emailValidation.success) {
            alert('Please enter a valid email address');
            return;
        }

        axios.post('http://localhost:3001/api/subscribe', {
              vendor: vendor,
            email: email,
            product: singleproduct,
            version: singleversion
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
        
        console.log(vendor, email, singleproduct, singleversion);
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
                    <FormControl fullWidth>
                      <InputLabel id="vendor-label" sx={{ fontFamily: 'Kumbh Sans' }}>
                        Vendor
                      </InputLabel>
                      <Select 
                        labelId="vendor-label"
                        label="Vendor"
                        value={vendor}
                        onChange={(e) => { setVendor(e.target.value); console.log(e.target.value)}}
                        sx={customSelectStyle}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              '& .MuiMenuItem-root': {
                                fontFamily: 'Kumbh Sans',
                                fontSize: '14px',
                                color: '#424242',
                                '&:hover': {
                                  backgroundColor: '#F5F5F5'
                                },
                                '&.Mui-selected': {
                                  backgroundColor: '#E3F2FD',
                                  '&:hover': {
                                    backgroundColor: '#E3F2FD'
                                  }
                                }
                              }
                            }
                          }
                        }}
                      >
                        <MenuItem value="All Vendors">All Vendors</MenuItem>
                        {distinctVendors?.map((vendor) => (
                          <MenuItem key={vendor} value={vendor}>
                            {vendor}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel id="product-label" sx={{ fontFamily: 'Kumbh Sans' }}>Product</InputLabel>
                      <Select 
                        labelId="product-label"
                        label="Product"
                        value={singleproduct}
                        onChange={(e) => setSingleProduct(e.target.value)}
                        sx={customSelectStyle}
                        disabled={isproductsdisabled}
                      >
                        <MenuItem key={'all-products'} value={'All Products'}>All Products</MenuItem>
                        {products.map((product) => (
                          <MenuItem key={product} value={product}>{product}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel id="version-label" sx={{ fontFamily: 'Kumbh Sans' }}>Version</InputLabel>
                      <Select 
                        labelId="version-label"
                        label="Version"
                        value={singleversion}
                        onChange={(e) => setSingleVersion(e.target.value)}
                        disabled={isversiondisabled}
                        sx={customSelectStyle}
                      >
                        <MenuItem key={'all-versions'} value={'All Versions'}>All Versions</MenuItem>
                        {productVersions.map((version) => (
                          <MenuItem key={version} value={version}>{version}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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