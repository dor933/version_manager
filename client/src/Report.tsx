import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { useAuth } from './UseContext/MainAuth';
import { Box, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

interface ReportProps {
    versions: any;
}


export default function FormDialog({versions}: ReportProps) {
  const { opendialog, setOpenDialog } = useAuth();
  const [vendor, setVendor] = useState('');
  const [products, setProducts] = useState([]);
  const [singleproduct, setSingleProduct] = useState('');
  const [singleversion, setSingleVersion] = useState('');
  const [productVersions, setProductVersions] = useState([]);
  const [isproductsdisabled, setIsProductsDisabled] = useState(true);
  const [isversiondisabled, setIsVersionDisabled] = useState(true);
  const [fullName, setFullName] = useState('');
  const [rule, setRule] = useState('');
  const [issueDescription, setIssueDescription] = useState('');

  useEffect(() => {

    const distinctProducts: any = [...new Set(versions.filter((version: any) => version.VendorName === vendor).map((version: any) => version.ProductName))];
    setProducts(distinctProducts);
    setIsProductsDisabled(false);
    setIsVersionDisabled(true);
    setSingleProduct('');
    setSingleVersion('');
  }, [vendor]);

  useEffect(() => { 
    const distinctVersions: any = [...new Set(versions.filter((version: any) => version.ProductName === singleproduct).map((version: any) => version.VersionName))];
    setProductVersions(distinctVersions);
    setIsVersionDisabled(false);
  }, [singleproduct]);





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
            <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column', paddingLeft:'100px', paddingRight:'100px', paddingTop:'100px', paddingBottom:'100px',}}>
            <Grid container style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row'}}>
                <Grid item xs={4}>
                    <Typography sx={{fontSize:'32px', fontWeight:'600', lineHeight:'28px', letterSpacing:'0.2px', textAlign:'left', fontFamily:'Kumbh Sans', color:'#4F4F4F'}}>Report Issue</Typography>
                </Grid>
                <Grid item xs={8} style={{display:'flex', justifyContent:'flex-end', alignItems:'center', flexDirection:'row'}}>
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
                <Grid item xs={12} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row', marginTop:'40px'}}>
                    <TextField
                        label="Full Name"
                        value={fullName}
                        required
                        sx={{width:'100%'}}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                </Grid>
            </Grid>
            <Grid container style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row', marginTop:'40px'}}>
                <Grid item xs={12}>
                    <TextField
                        label="Rule"
                        value={rule}
                        required
                        sx={{width:'100%'}}
                        onChange={(e) => setRule(e.target.value)}
                    />
                </Grid>
            </Grid>
            <Grid container style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row', marginTop:'40px'}}>
                <Grid item xs={12}>
                    <TextField
                        label="Issue Description"
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
          <Button type="submit" sx={{backgroundColor:'#509CDB',fontWeight:'600',fontFamily:'Kumbh Sans', color:'#fff'}}>Submit</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
