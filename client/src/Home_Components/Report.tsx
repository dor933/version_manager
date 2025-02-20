import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { useAuth } from '../UseContext/MainAuth';
import { Box, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import CancelIcon from '@mui/icons-material/Cancel';
import ImageHandler from '../Help_Components/ImageHandler';
import { apiService } from '../API/apiService';

const severities = ['Low', 'Medium', 'High','Urgent'];

interface ReportProps {
    versions: any;
    productsandmodules: any;
}



export default function FormDialog({versions, productsandmodules}: ReportProps) {
  const { opendialog, setOpenDialog } = useAuth();
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
  const { setIsPopupOpen, setTitle, setMainMessage, setButtonText, setIssucceeded } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

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
      const productandmodule: any = productsandmodules.find((module: any) => module.ProductName === singleproduct)
      if (productandmodule) {
        setModules(productandmodule.modules);
      }
      setIsVersionDisabled(false);
    }
  }, [singleproduct, productsandmodules]);



  const handleSubmit = async () => {
    console.log(vendor, singleproduct, singleversion, email, severity, issueDescription, chosenmodule);
    const emailSchema = z.string().email();

    if(!severities.includes(severity)){
      setIsPopupOpen(true);
      setTitle('Error');
      setMainMessage('Please select a valid severity');
      setButtonText('OK');
      return;
    }
  
    if(issueDescription.length < 10 || issueDescription.length > 1000){
      setIsPopupOpen(true);
      setTitle('Error');
      setMainMessage('Please enter a valid issue description (Min 10 characters and Max 1000 characters)');
      setButtonText('OK');
      return;
    }

    if(vendor.length < 1 || singleproduct.length < 1 || singleversion.length < 1 || chosenmodule.length < 1){
      setIsPopupOpen(true);
      setTitle('Error');
      setMainMessage('Please select a valid vendor, product, version and module');
      setButtonText('OK');
      return;
    }

    if(!emailSchema.safeParse(email).success){
      setIsPopupOpen(true);
      setTitle('Error');
      setMainMessage('Please enter a valid email address');
      setButtonText('OK');
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
        setIsPopupOpen(true);
        setTitle('Success');
        setIssucceeded(true);
        setMainMessage('Report submitted successfully');
        setButtonText('OK');
        // Clear files after successful upload
        setSelectedFiles([]);
        setPreviews([]);
      }
      else{
        setIsPopupOpen(true);
        setTitle('Error');
        setMainMessage('Report submission failed');
        setButtonText('OK');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      setIsPopupOpen(true);
      setTitle('Error');
      setMainMessage('Failed to upload files');
      setButtonText('OK');
    }
  }

  return (
    <React.Fragment>
      <Dialog
        open={opendialog}
        onClose={() => setOpenDialog(false)}
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
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const email = formJson.email;
            console.log(email);
            setOpenDialog(false);
          },
          sx: {
            width: '1000px',
            maxWidth: '1000px',
            height: '100%',
          }
        }}
      >
        <DialogContent>
        <Grid item xs={12} sx={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row',position:'fixed'}}>
              <CancelIcon sx={{color:'#152259', cursor:'pointer', fontSize:'35px'}} onClick={() => setOpenDialog(false)}/>

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
                        <Select 
                            labelId="product-label"
                            label="Product"
                            value={singleproduct}
                            sx={{width:'100%', fontFamily:'Kumbh Sans', fontWeight:'500', fontSize:'14px', color:'#152259'}}
                            required
                            disabled={isproductsdisabled}
                            onChange={(e) => setSingleProduct(e.target.value)}
                        >
                            {
                              products.map((product: any) => (
                                <MenuItem value={product}>{product}</MenuItem>
                              ))
                            }
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Grid container style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row', marginTop:'20px'}}>
                <Grid item xs={4}>
                <FormControl sx={{ display:'flex', justifyContent:'flex-end', alignItems:'center', flexDirection:'row', width: '100%'}}>
                    <InputLabel id="Severity-label">Severity</InputLabel>
                    <Select 
                        labelId="Severity-label"
                        label="Severity"
                        value={severity}
                        sx={{width:'100%', fontFamily:'Kumbh Sans', fontWeight:'500', fontSize:'14px', color:'#152259'}}
                        required
                        onChange={(e) => setSeverity(e.target.value)}
                    >
                        {
                          severities.map((severity) => (
                            <MenuItem value={severity}>{severity}</MenuItem>
                          ))
                        }
                    </Select>
                  </FormControl>

                </Grid>
                <Grid item xs={8} style={{display:'flex', justifyContent:'flex-end', alignItems:'center', flexDirection:'row'}}>
                    <FormControl sx={{ width: '50%' }}>
                        <InputLabel id="version-label">Version</InputLabel>
                        <Select 
                            labelId="version-label"
                            label="Version"
                            value={singleversion}
                            sx={{width:'100%', fontFamily:'Kumbh Sans', fontWeight:'500', fontSize:'14px', color:'#152259'}}
                            required
                            disabled={isversiondisabled}
                            onChange={(e) => setSingleVersion(e.target.value)}
                        >
                            {
                              productVersions.map((version: any) => (
                                <MenuItem value={version}>{version}</MenuItem>
                              ))
                            }
                        </Select>
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
          <Button onClick={() => setOpenDialog(false)} sx={{backgroundColor:'#F2F2F2',fontWeight:'600',fontFamily:'Kumbh Sans', color:'#4F4F4F'}}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} sx={{backgroundColor:'#509CDB',fontWeight:'600',fontFamily:'Kumbh Sans', color:'#fff'}}>Submit</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
