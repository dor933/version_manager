import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { useMain } from '../UseContext/MainContext';
import { Box, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import CancelIcon from '@mui/icons-material/Cancel';
import ImageHandler from '../Help_Components/ImageHandler';
import Popup from '../Help_Components/Popup';
import GenericSelect from '../Help_Components/GenericSelect';
import { apiService } from '../API/apiService';

const severities = ['Low', 'Medium', 'High','Urgent'];

interface ReportProps {
    versions: any;
    productsandmodules: any;
}


export default function FormDialog({versions, productsandmodules}: ReportProps) {
  const { opendialog, setOpenDialog } = useMain();
  const [vendor, setVendor] = useState('');
  const [products, setProducts] = useState([]);
  const [singleproduct, setSingleProduct] = useState('');
  const [singleversion, setSingleVersion] = useState('');
  const [productVersions, setProductVersions] = useState([]);
  const [isproductsdisabled, setIsProductsDisabled] = useState(true);
  const [modules, setModules] = useState([]);
  const [chosenmodule, setChosenModule] = useState('');
  const [isversiondisabled, setIsVersionDisabled] = useState(true);
  const [email, setEmail] = useState('');
  const [severity, setSeverity] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [ispopupopen, setIsPopupOpen] = useState(false);
  const [issucceeded, setIssucceeded] = useState(false);
  const [title, setTitle] = useState('');
  const [mainMessage, setMainMessage] = useState('');
  const [subMessage, setSubMessage] = useState('');
  const [buttonText, setButtonText] = useState('');

  useEffect(() => {

    const distinctProducts: any = [...new Set(versions.filter((version: any) => version.VendorName === vendor).map((version: any) => version.ProductName))];
    setProducts(distinctProducts);
    setIsProductsDisabled(false);
    setIsVersionDisabled(true);
    setSingleProduct('');
    setSingleVersion('');
    setChosenModule('');
  }, [vendor]);

  useEffect(() => { 
    if (productsandmodules) {
      const distinctVersions: any = [...new Set(versions.filter((version: any) => version.ProductName === singleproduct).map((version: any) => version.VersionName))];
      setProductVersions(distinctVersions);
      console.log(singleproduct);
      const productandmodule: any = productsandmodules.find((module: any) => module.ProductName === singleproduct)
      if (productandmodule) {
        setModules(productandmodule.modules);
      }
      setIsVersionDisabled(false);
    }
  }, [singleproduct, productsandmodules]);

const handlePopup = (title: string, issucceeded: boolean, mainMessage: string, buttonText: string) => {
  setIsPopupOpen(true);
  setTitle(title);
  setIssucceeded(issucceeded);
  setMainMessage(mainMessage);
  setButtonText(buttonText);
}

  const handleSubmit = async () => {
    console.log(vendor, singleproduct, singleversion, email, severity, issueDescription, chosenmodule);
    const emailSchema = z.string().email();

    if(vendor.length < 1 || singleproduct.length < 1 || singleversion.length < 1 || chosenmodule.length < 1){
      handlePopup('Error', false, 'Please select a valid vendor, product, version and module', 'OK');
      return;
    }

    if(!severities.includes(severity)){
      handlePopup('Error', false, 'Please select a valid severity', 'OK');
      return;
    }
  
    if(issueDescription.length < 10 || issueDescription.length > 1000){
      handlePopup('Error', false, 'Please enter a valid issue description (Min 10 characters and Max 1000 characters)', 'OK');
      return;
    }


    if(!emailSchema.safeParse(email).success){
      handlePopup('Error', false, 'Please enter a valid email address', 'OK');
      return;
    }


    const formData = new FormData();
    formData.append('vendor', vendor);
    formData.append('product', singleproduct);
    formData.append('version', singleversion);
    formData.append('module', chosenmodule);
    formData.append('email', email);
    formData.append('severity', severity);
    formData.append('issueDescription', issueDescription);
    
    // Append each file to formData
    selectedFiles.forEach((file, index) => {
      formData.append('photos', file);
    });

    try {
      const report = await apiService.submitReport(formData);
      
      if(report.data.report) {
        const issueId = report.data.issueId;
        handlePopup('Success', true, 'Report submitted successfully', 'OK');
        // Clear files after successful upload
        setSelectedFiles([]);
        setPreviews([]);
      }
      else{
        handlePopup('Error', false, 'Report submission failed', 'OK');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      handlePopup('Error', false, 'Failed to upload files', 'OK');
    }
  }

  return (
    <React.Fragment>
      <Dialog
        open={opendialog}
      
        onClose={() => ispopupopen ? null : setOpenDialog(false)}
        style={{
          backgroundColor: 'transparent',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          

        }}
        maxWidth="lg"
        fullWidth={true}
        
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(2px)',

            
          }
        }}
        PaperProps={{
          component: 'form',
          onSubmit:  (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
        
          },
          sx: {
            width: '1000px',
            maxWidth: '1000px',
            height: '100%',
          }
        }}
      >
        {ispopupopen && (
          <Popup
            title={title}
            issucceeded={issucceeded}
            mainMessage={mainMessage}
            buttonText={buttonText}
            ispopupopen={ispopupopen}
            setIsPopupOpen={setIsPopupOpen}
            setIssucceeded={setIssucceeded}
            setTitle={setTitle}
            setMainMessage={setMainMessage}
            setButtonText={setButtonText}
            subMessage={subMessage}
            setSubMessage={setSubMessage}
          />
        )}
        <DialogContent style={{

          opacity:ispopupopen ? 0.5 : 1,

        }}>
        <Grid item xs={12} sx={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row',position:'fixed'}}>
              <CancelIcon sx={{color:'#152259', cursor: ispopupopen ? 'false' : 'pointer', fontSize:'35px'}} onClick={() => !ispopupopen ? setOpenDialog(false) : null}/>

              </Grid>
            <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column', paddingLeft:'80px', paddingRight:'80px', paddingTop:'80px', paddingBottom:'80px',gap:'10px'}}>

            <Grid container style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row'}}>
       
                <Grid container item xs={4} sx={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row'}}>
                    <Typography sx={{fontSize:'32px', fontWeight:'600', lineHeight:'28px',marginTop:'-30px' , letterSpacing:'0.2px', textAlign:'left', fontFamily:'Kumbh Sans', color:'#4F4F4F'}}>Report Issue</Typography>
          

                </Grid>
                <Grid container item xs={8} style={{display:'flex', justifyContent:'flex-end', alignItems:'center', flexDirection:'row'}}>
                    <FormControl sx={{ display:'flex', justifyContent:'flex-end', alignItems:'center', flexDirection:'row', width: '50%'}}>
                        <InputLabel id="vendor-label">Vendor</InputLabel>
                        <Select 
                            labelId="vendor-label"
                            label="Vendor"
                            value={vendor}
                            sx={{width:'100%', fontFamily:'Kumbh Sans', fontWeight:'500', fontSize:'14px', color:'#152259'}}
                            required
                            onChange={(e) => setVendor(e.target.value)}
                            disabled={ispopupopen}
                        >
                            {
                              //distinct vendors
                              [...new Set(versions.map((version: any) => version.VendorName))].map((vendor: any) => (
                                <MenuItem value={vendor}>{vendor}</MenuItem>
                              ))
                            }
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Grid container style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row', marginTop:'20px'}}>
                <Grid item xs={4}>
                <FormControl sx={{ width: '100%' }}>
                  <InputLabel id="module-label">Module</InputLabel>
                  <Select 
                    labelId="module-label"
                    label="Module"
                    value={chosenmodule}
                    sx={{width:'100%', fontFamily:'Kumbh Sans', fontWeight:'500', fontSize:'14px', color:'#152259'}}
                    required
                    onChange={(e) => setChosenModule(e.target.value)}
                    disabled={ispopupopen}
                  >
                    {modules.map((module: any) => (
                      <MenuItem value={module.ModuleName}>{module.ModuleName}</MenuItem>
                    ))}
                  </Select>            
                </FormControl>


                </Grid>
                <Grid item xs={8} style={{display:'flex', justifyContent:'flex-end', alignItems:'center', flexDirection:'row'}}>
                    <FormControl sx={{ width: '50%' }}>
                        <InputLabel id="product-label">Product</InputLabel>
                        <GenericSelect singleitem={singleproduct} isitemdisabled={isproductsdisabled} ispopupopen={ispopupopen} setSingleItem={setSingleProduct} options={products}/>
                 
                    </FormControl>
                </Grid>
            </Grid>
            <Grid container style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row', marginTop:'20px'}}>
                <Grid item xs={4}>
                <FormControl sx={{ display:'flex', justifyContent:'flex-end', alignItems:'center', flexDirection:'row', width: '100%'}}>
                    <InputLabel id="Severity-label">Severity</InputLabel>
                    <GenericSelect singleitem={severity} isitemdisabled={ispopupopen} ispopupopen={ispopupopen} setSingleItem={setSeverity} options={severities}/>
              
                  </FormControl>

                </Grid>
                <Grid item xs={8} style={{display:'flex', justifyContent:'flex-end', alignItems:'center', flexDirection:'row'}}>
                    <FormControl sx={{ width: '50%' }}>
                        <InputLabel id="version-label">Version</InputLabel>

                        <GenericSelect singleitem={singleversion} isitemdisabled={isversiondisabled} ispopupopen={ispopupopen} setSingleItem={setSingleVersion} options={productVersions}/>

                  
                    </FormControl>
                </Grid>
                </Grid>
                <Grid container style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row', marginTop:'20px'}}>
                <Grid item xs={4}>
         
         <ImageHandler setImages={setSelectedFiles} isreport={true}/>

                  {previews.length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {previews.map((preview, index) => (
                        <Box
                          key={index}
                          component="img"
                          src={preview}
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 1
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Grid>
                <Grid item xs={8} style={{display:'flex', justifyContent:'flex-end', alignItems:'center', flexDirection:'row'}}>
  
             </Grid>
                </Grid>
                
                <Grid container xs={12} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row', marginTop:'40px'}}>
                    <TextField
                        label="Email"
                        value={email}
                        disabled={ispopupopen}
                        required
                        sx={{width:'100%'}}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Grid>
      
            <Grid container style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row', marginTop:'40px'}}>
                <Grid item xs={12}>
                    <TextField
                        label="Issue Description"
                        value={issueDescription}
                        disabled={ispopupopen}
                        required
                        sx={{width:'100%'}}
                        multiline
                        rows={4}
                        onChange={(e) => setIssueDescription(e.target.value)}
                    />
                </Grid>
            </Grid>
            </Box>

     
        </DialogContent>
        <DialogActions sx={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row',paddingBottom:'20px'}}>
          <Button disabled={ispopupopen} onClick={() => !ispopupopen ? setOpenDialog(false) : null} sx={{backgroundColor:'#F2F2F2',fontWeight:'600',fontFamily:'Kumbh Sans', color:'#4F4F4F'}}>Cancel</Button>
          <Button disabled={ispopupopen} type="submit" onClick={handleSubmit} sx={{backgroundColor:'#509CDB',fontWeight:'600',fontFamily:'Kumbh Sans', color:'#fff'}}>Submit</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
