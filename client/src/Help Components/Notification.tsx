import React, {  useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { z } from 'zod';
import FormControlSelect from './NotificationSelect';
import { apiService } from '../API/apiService';
import Popup from './Popup';
import { customTextFieldStyle, customSelectStyle } from '../css/NotificationCSS';
import { NotificationProps } from '../Component Props/HelpComponentsProps';


const emailSchema = z.string().email();



export default function Notification({ open, onClose, versions_to_notify, type, distinctVendors, versions }: NotificationProps) {

  const [email, setEmail] = useState<string>('');
  const [vendor, setVendor] = useState('');
  const [products, setProducts] = useState([]);
  const [singleproduct, setSingleProduct] = useState('');
  const [isProductsDisabled, setIsProductsDisabled] = useState(true);
  const [frequency, setFrequency] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSucceeded, setIsSucceeded] = useState(false);
  const [title, setTitle] = useState('');
  const [mainMessage, setMainMessage] = useState('');
  const [subMessage, setSubMessage] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [isprocessrequest, setIsprocessrequest] = useState(false);

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

  const handlePopup= (title: string, message: string, isSuccess: boolean, buttonText: string) => {
    setIsPopupOpen(true);
    setTitle(title);
    setMainMessage(message);
    setButtonText(buttonText);
    setIsSucceeded(isSuccess);
  }

 

    const handleSubscribe = () => {
      const emailValidation = emailSchema.safeParse(email);
      if (!emailValidation.success) {
        handlePopup('Error', 'Please enter a valid email address', false, 'OK');
        return;
      }

      if(vendor === '') {
        handlePopup('Error', 'Please select a vendor', false, 'OK');
        return;
      }
      else if(singleproduct === ''){
        handlePopup('Error', 'Please select a product', false, 'OK');
        return;
      }
      else if(frequency === ''){
        handlePopup('Error', 'Please select a notification frequency', false, 'OK');
        return;
      }

      // Convert frequency to the format your API expects
      let unitAndInterval = {
        Unit_of_time: 'Days',
        Frequency: 1
      };
      
      if (frequency === 'Daily') {
        unitAndInterval = { Unit_of_time: 'Days', Frequency: 1 };
      } else if (frequency === 'Weekly') {
        unitAndInterval = { Unit_of_time: 'Days', Frequency: 7 };
      } else if (frequency === 'Monthly') {
        unitAndInterval = { Unit_of_time: 'Months', Frequency: 1 };
      }

      apiService.subscribe({
        vendor: vendor,
        email: email,
        product: singleproduct,
        ...unitAndInterval
      })
      .then((response) => {
        console.log('response', response);
        return response.data;
      })
      .then(data => {
        console.log(data);
        if(data.subscribe==='Already Subscribed'){
          handlePopup('Error', 'You are already subscribed to notifications', false, 'OK');
        }
        else if(data.subscribe){
          handlePopup('Success', 'You are now subscribed to notifications', true, 'OK');
        }
        else{
          handlePopup('Error', 'Error subscribing', false, 'OK');
        }
      })
      .catch(error => console.error('Error subscribing:', error));
    }

  const handleTestNotification = () => {

    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      handlePopup('Error', 'Please enter a valid email address', false, 'OK');
      return;
    }

    if(vendor === '') {
      handlePopup('Error', 'Please select a vendor', false, 'OK');
      return;
    }
    else if(singleproduct === ''){
      handlePopup('Error', 'Please select a product', false, 'OK');
      return;
    }

    setIsprocessrequest(true);

    console.log(singleproduct, vendor);
    console.log(frequency);
    console.log(email);

    apiService.sendTestNotification({
      email: email,
      productToNotify:singleproduct,
      vendorToNotify:vendor,
      unitOfTime: 'Days',
      interval: 7
    })
    .then((response) => {
      console.log('response', response);
      return response.data;
    })
    .then(data => {
      if(data.success){
        handlePopup('Success', 'Test notification sent successfully', true, 'OK');
      }
      else{
        handlePopup('Error', 'Error sending test notification', false, 'OK');
      }
    })
    .catch(error => console.error('Error sending test notification:', error))
    .finally(() => setIsprocessrequest(false));
  };

  if (!open) return null;

  return (
    <>
    <Popup
    ispopupopen={isPopupOpen}
    setIsPopupOpen={setIsPopupOpen}
    issucceeded={isSucceeded}
    setIssucceeded={setIsSucceeded}
    title={title}
    setTitle={setTitle}
    mainMessage={mainMessage}
    setMainMessage={setMainMessage}
    subMessage={subMessage}
    setSubMessage={setSubMessage}
    buttonText={buttonText}
    setButtonText={setButtonText}
    />
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
          <Box sx={{ p: 2 }}>
            <Grid container sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                
            <Typography variant="h6" sx={{  fontFamily: 'Kumbh Sans', fontSize: '14px' }}>
              Notifications
            </Typography>
            <CancelIcon sx={{color:'#152259', cursor:'pointer', fontSize:'20px'}} onClick={ !isPopupOpen ? onClose : undefined}/>
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

<Box sx={{ p: 2 , opacity: isPopupOpen ? 0.5 : 1}}>
            <Grid container sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                
            <Typography variant="h6" sx={{  fontFamily: 'Kumbh Sans', fontSize: '14px', }}>
              Subscribe to Notifications
            </Typography>
            
            <CancelIcon sx={{color:'#152259', cursor:'pointer', fontSize:'20px'}} onClick={ !isPopupOpen ? onClose : undefined}/>
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
                      disabled={isPopupOpen}
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
                isitemdisabled={isPopupOpen}
                setSingleItem={setVendor}
                items={distinctVendors && !isPopupOpen ? distinctVendors : []}
                customSelectStyle={customSelectStyle}
                />
                  </Grid>
                  <Grid item xs={12}>
           
                  <FormControlSelect   
                  label="Product"
                  singleitem={singleproduct}
                  setSingleItem={setSingleProduct}
                  isitemdisabled={ isPopupOpen ? true : isProductsDisabled}
                  items={ products && !isPopupOpen ? products : []}
                  customSelectStyle={customSelectStyle}
                  />
                  </Grid>
            
                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="frequency-label">Notification Frequency</InputLabel>
                      <Select
                        labelId="frequency-label"
                        id="frequency"
                        value={frequency}
                        label="Notification Frequency"
                        onChange={(e) => setFrequency(e.target.value as string)}
                        disabled={isPopupOpen}
                        sx={customSelectStyle}
                      >
                        {["Daily", "Weekly", "Monthly"].map((option) => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
            
                  <Grid item xs={12} style={{
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <Box 
                      sx={{
                        display: 'flex',
                        backgroundColor: '#509CDB',
                        borderRadius: '4px',
                        padding: '13px',
                        cursor: 'pointer',
                        flex: 1,
                        justifyContent: 'center',
                        '&:hover': {
                          backgroundColor: '#4084C2'
                        }
                      }} 
                      onClick={!isPopupOpen ? handleSubscribe : undefined}
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
                    
                    <Box 
                      sx={{
                        display: 'flex',
                        backgroundColor: '#6FCF97',
                        borderRadius: '4px',
                        padding: '13px',
                        cursor: 'pointer',
                        flex: 1,
                        justifyContent: isprocessrequest ? 'space-between' : 'center',
                        '&:hover': {
                          backgroundColor: '#5DB585'
                        }
                      }} 
                      onClick={!isPopupOpen ? handleTestNotification : undefined}
                    >
                      <Typography sx={{ 
                        color: '#FFF',
                        fontSize: '14px',
                        fontWeight: '600',
                        lineHeight: '16px',
                        letterSpacing: '0.1px',
                        textAlign: 'center',
                        fontFamily: 'Kumbh Sans',
                     
                      }}>
                        Test Notification
                      </Typography>


                      {isprocessrequest && <CircularProgress size={15} sx={{color:'#FFF'}} />}
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

