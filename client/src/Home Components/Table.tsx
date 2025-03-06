import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Filter from '../Help Components/Filter';
import CustomizedSelects from '../Help Components/CustomizeSelect';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CustomButton from '../Help Components/Button';
import Issues from './Issues';
import { HomeSVG } from '../svg/HomeSVG';
import { EmailSVG } from '../svg/EmailSVG';
import { InfoSVG } from '../svg/InfoSVG';
import { VersionData } from '../Types/MainDataTypes';
import TableSortLabel from '@mui/material/TableSortLabel';
import { sortedVersions } from '../Help Functions/Sorting';
import { columns, AnimatedGrid } from '../css/TableColumns';
import { TableProps } from '../Component Props/HomeComponentsProps';

type Order = 'asc' | 'desc';



export default function StickyHeadTable({versions, distinctVendors, productsandmodules }: TableProps) {
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [filteredVersions, setFilteredVersions] = React.useState(versions);
  const [SearchValue, setSearchValue] = React.useState('');
  const [ChosenVersion, setChosenVersion] = React.useState<any>(versions ? versions[0] : null);
  const [vendor, setVendor] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [IssuesDialog, setIssuesDialog] = React.useState(false);
  const [ChosenProduct, setChosenProduct] = React.useState<any>(null);
  const prevVendorRef = React.useRef(vendor);
  const prevSearchRef = React.useRef(SearchValue);
  const [animate, setAnimate] = React.useState(false);
  const [order, setOrder] = React.useState<Order>('desc');
  const [orderBy, setOrderBy] = React.useState<keyof VersionData>('ReleaseDate');

  
 
  useEffect(() => {

    console.log('entered useeffect');

    if (!versions) return;

    console.log('not returned')

    console.log('versions in the start',versions)
  
    if (SearchValue !== '') {
      // Filter by search + vendor
      let newFiltered = versions.filter((version: any) => {
        const matchesSearch =
          version.VersionName?.toLowerCase().includes(SearchValue.toLowerCase()) ||
          version.ProductName?.toLowerCase().includes(SearchValue.toLowerCase()) ||
          version.VendorName?.toLowerCase().includes(SearchValue.toLowerCase());
  
        const matchesVendor = vendor ? version.VendorName === vendor : true;
        return matchesSearch && matchesVendor;
      });

    
    } else if (vendor) {
      // No search, but vendor chosen
      let filtered_versions= versions.filter((v) => v.VendorName === vendor);
      filtered_versions= sortedVersions(filteredVersions,'ReleaseDate','desc')
      setFilteredVersions(filtered_versions);
      setChosenProduct(productsandmodules?.find((product: any) => product.ProductName === filtered_versions[0].ProductName))
      if(ChosenVersion?.VendorName!==vendor){
        setChosenVersion(filtered_versions[0])
        setPage(0)
      }
    } else {
      // No search, no vendor
      let filtered_versions = sortedVersions(versions,orderBy,order)
            console.log('last filtered versions',filteredVersions)
      console.log('order by', orderBy)
      console.log('order',order)
      setFilteredVersions(filtered_versions);
      setChosenVersion(filtered_versions[0])
      setChosenProduct(productsandmodules?.find((product: any) => product.ProductName === filtered_versions[0].ProductName))
    }
  }, [SearchValue, vendor, versions]);
  
useEffect(() => {
  // Compare old vs new
  if (prevVendorRef.current !== vendor || prevSearchRef.current !== SearchValue) {
    setPage(0);
  }
  // Update refs for next render
  prevVendorRef.current = vendor;
  prevSearchRef.current = SearchValue;
}, [vendor, SearchValue]);


  
  const handleRowClick = (row: any) => {

    console.log('row', row);
    setChosenVersion(row);
     const product = productsandmodules?.find((product: any) => product.ProductName === row.ProductName);
     if(product){
      setChosenProduct(product);
     }
     if (ChosenVersion) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  } 



    

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    setFilteredVersions([...filteredVersions]);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
    // Force a re-render
    setFilteredVersions([...filteredVersions]);
  };
  
  
  const handleRequestSort = (property: keyof VersionData) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);

    const VersionsSorted = sortedVersions(filteredVersions, property, order);
    
    setFilteredVersions(VersionsSorted);
  };

  return (
    <>
    <Issues chosenproduct={ChosenProduct} issuesdialog={IssuesDialog} setIssuesDialog={setIssuesDialog} chosenversion={ChosenVersion} />
    
              <Grid container item xs={9} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row'}}>

    <Grid container item xs={12} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row', marginBottom:'30px'}}>
           
   
    <Grid item xs={5} style={{display:'flex', justifyContent:'center', alignItems:'flex-start', flexDirection:'column',}}>
             
             <CustomizedSelects 
               options={distinctVendors} 
               label="Vendor" 
               value={vendor} 
               setVendor={setVendor}
               style={{width:'180px', marginTop:'5px'}}
             />
             
  
             
  
              </Grid>

              <Grid item xs={7} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row'}}>

                <Filter filtervalue={SearchValue} setFiltervalue={setSearchValue}/>
              </Grid>
   

   


       

        </Grid>

        <Grid item xs={12}>
    
    <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 'none' }}>
      <TableContainer sx={{ maxHeight: 900 }}>
        <Table 
          stickyHeader 
          aria-label="sticky table"
          sx={{
            '& .MuiTableCell-root': {  // Remove borders from all cells
              border: 'none',
              paddingLeft:'10px'
            },
          }}
        >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.id === 'VersionName' ? (
                    <Typography sx={{
                      fontFamily: 'Kumbh Sans',
                      fontWeight: 600,
                      fontSize: '12px',
                      color: '#152259',
                    }}>
                      {column.label}
                    </Typography>
                  ) : (
                    <TableSortLabel
                      active={true}
                      hideSortIcon={false}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id as keyof VersionData)}
                      sx={{
                        fontFamily: 'Kumbh Sans',
                        fontWeight: 600,
                        fontSize: '12px',
                        color: '#152259',
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        gap:'10px'
                      }}
                    >
                      {column.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVersions && filteredVersions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row: any, index: any) => {
                return (
                  <TableRow 
                    hover 
                    role="checkbox" 
                    tabIndex={-1} 
                    key={row.version_name}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#F5F5F5',
                      },
                      backgroundColor: index % 2 === 0 ? 'rgba(235, 246, 255, 0.50)' : '#FFFFFF',
                    }}
                    onClick={() => { handleRowClick(row); }}
                  >

                    {columns.map((column) => {
                        const value = row[column.id as keyof typeof row];
                      return (
                        <TableCell 
                          key={column.id} 
                          align={column.align}
                          sx={{
                            fontFamily: 'Kumbh Sans',
                            fontSize: '14px',
                            color: '#4B4B4B',
                            paddingY: '25px',  // Vertical padding
                          }}
                        >
                          {column.format_number && typeof value === 'number'
                            ? column.format_number(value) 
                            : column.format_date && typeof value === 'string'
                            ? column.format_date(value) 
                            : column.format_product && typeof value === 'string'
                            ? column.format_product(value)
                            : column.id==='VendorName' ? 
                            
                            
                            <img alt={value==='Fortra' ? 'fortra' : 'opswat'} src={value==='Fortra' ? 'https://static.fortra.com/hs-logo.png' : 'https://cybersecurity-excellence-awards.com/wp-content/uploads/2022/01/507133.png'} style={{width: value==='Fortra'? '60px': '90px', height:'15px'}}/> 
                            :

                            value != null ? value : 'N/A'
                            }
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={filteredVersions!=null ? filteredVersions.length : 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          fontFamily: 'Kumbh Sans',
        }}
      />
    </Paper>
    </Grid>
    </Grid>

    <AnimatedGrid 
      item 
      xs={3} 
      animate={animate}
      style={{
        display: 'flex', 
        alignSelf: 'flex-start', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '10px'
      }}
    >

<Typography style={{color:"#424242", fontSize:'14px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', textAlign:'center', fontFamily:'Kumbh Sans'}}>
  {vendor? vendor: 'All Vendors'}
</Typography>
{ 
vendor===''?
<Box sx={{display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'250px', paddingLeft:'25px', paddingRight:'25px', paddingTop:'25px', paddingBottom:'25px', backgroundColor:'#F5F5F5', width:'200px', height:'200px',zIndex:'0'}}>
<Box sx={{display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'100px', paddingLeft:'25px', paddingRight:'25px', paddingTop:'25px', paddingBottom:'25px', backgroundColor:'#FFFFFF', width:'80px', height:'80px'}}>

  
   <img alt='fortra' src='https://static.fortra.com/hs-logo.png' style={{width:'90px', height:'25px'}}/>

</Box>
<Box sx={{display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'100px', paddingLeft:'25px', paddingRight:'25px', paddingTop:'25px', paddingBottom:'25px', backgroundColor:'#FFFFFF', width:'80px', height:'80px', marginLeft:'-30px',zIndex:'1'}}>

  
<img alt='opswat' src='https://cybersecurity-excellence-awards.com/wp-content/uploads/2022/01/507133.png' style={{width:'90px', height:'15px'}}/>

</Box>
</Box>:

vendor==='Fortra' ?
            <Box sx={{display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'250px', paddingLeft:'25px', paddingRight:'25px', paddingTop:'25px', paddingBottom:'25px', backgroundColor:'#F5F5F5', width:'200px', height:'200px'}}>
              <img alt='fortra' src='https://static.fortra.com/hs-logo.png' style={{width:'120px', height:'40px'}}/>

</Box> : vendor==='OPSWAT' ?
            <Box sx={{display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'250px', paddingLeft:'25px', paddingRight:'25px', paddingTop:'25px', paddingBottom:'25px', backgroundColor:'#F5F5F5', width:'200px', height:'200px'}}>
              <img alt='opswat' src='https://cybersecurity-excellence-awards.com/wp-content/uploads/2022/01/507133.png' style={{width:'150px', height:'30px'}}/>

</Box> : 
null
}
<Typography style={{color:"#424242", fontSize:'16px', fontWeight:'700', lineHeight:'16px', letterSpacing:'0.2px', textAlign:'center', fontFamily:'Kumbh Sans'}}>
 {ChosenVersion?.ProductName.replace(/_/g, ' ') || 'Product Name'}
</Typography>
<Typography style={{color:"#424242", fontSize:'14px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', textAlign:'center', fontFamily:'Kumbh Sans'}}>
 {ChosenVersion?.VersionName || 'Version Name'}
</Typography>

<Grid container xs={8} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row'}}>

  <Grid item xs={2} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row', cursor:'pointer'}} onClick={() => {
  
       ChosenVersion?.VendorName==='Fortra' ? window.open('https://my.goanywhere.com/webclient/Login.xhtml', '_blank') : window.open('https://my.opswat.com/', '_blank')
  }} >

    <HomeSVG />
  </Grid>
  <Grid item xs={2} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row', cursor:'pointer'}} onClick={() => {
      window.open(ChosenVersion?.FullReleaseNotes, '_blank', 'noreferrer');
  }}>
  
  <InfoSVG />

  </Grid>
  <Grid item xs={2} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row', cursor:'pointer'}} onClick={() => {
 
  ChosenVersion?.VendorName==='Fortra' ? window.open('mailto:goanywhere.support@helpsystems.com', '_blank') : window.open('mailto:support@opswat.com', '_blank')
  }} >

<EmailSVG />

  </Grid>

</Grid>

<Grid container xs={8} style={{display:'flex', justifyContent:'center', alignItems:'flex-start', flexDirection:'column', marginTop:'40px',paddingLeft:'10px', gap:'10px'}}>
  <Typography style={{color:"#424242", fontSize:'14px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', textAlign:'center', fontFamily:'Kumbh Sans'}}>
    About
  </Typography>
  <Typography style={{color:"#A7A7A7", fontSize:'14px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', fontFamily:'Kumbh Sans'}}>  
    </Typography>
</Grid>
<Grid container xs={8} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row', marginTop:'40px',paddingLeft:'10px',gap:'10px', 
  
}}>

  <Grid item xs={4} style={{display:'flex', justifyContent:'flex-start', alignItems:'flex-start', flexDirection:'column', gap:'10px', minHeight:'100px'}}>
    <Typography style={{color:"#424242", fontSize:'14px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', fontFamily:'Kumbh Sans'}}>
      Known Issues
    </Typography>
    <Typography style={{color:"#A7A7A7", fontSize:'16px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', fontFamily:'Kumbh Sans',alignSelf:'center',marginTop:'5px'}}>  
      {productsandmodules?.find((product: any) => product.ProductName === ChosenVersion?.ProductName)?.issues?.filter((issue: any) => issue.VersionId === ChosenVersion?.VersionId).length}
    </Typography>
  </Grid>
  <Grid item xs={4} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'column', gap:'10px', minHeight:'100px'}}>
    <Typography style={{color:"#424242", fontSize:'14px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', fontFamily:'Kumbh Sans', minHeight:'20px'}}>
    Issues 
    </Typography>
    <CustomButton label="Show Issues" onClick={() => {setIssuesDialog(true); }}/>

  </Grid>
  


</Grid>
<Grid container xs={8} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row', marginTop:'40px',paddingLeft:'10px'}}>
  <Typography style={{color:"#1A1A1A", fontSize:'14px', fontWeight:'700', lineHeight:'16px', letterSpacing:'0.2px', textAlign:'center', fontFamily:'Kumbh Sans'}}>
     Availble Vendors
  </Typography>
</Grid>

<Grid container xs={8} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row', marginTop:'20px',paddingLeft:'10px'}}>
  
<Box  sx={{display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50px', paddingLeft:'25px', paddingRight:'25px',zIndex:'0', paddingTop:'25px', paddingBottom:'25px', backgroundColor:'#F5F5F5', width:'50px', height:'50px', cursor:'pointer'}} onClick={() => {setVendor('Fortra'); setSearchValue(''); setPage(0);}}>

<img alt='fortra' src='https://static.fortra.com/hs-logo.png' style={{width:'80px', height:'20px'}}/>

</Box>
<Box sx={{display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50px', paddingLeft:'25px', paddingRight:'25px', paddingTop:'25px', paddingBottom:'25px', backgroundColor:'#F5F5F5', width:'50px', height:'50px',marginLeft:'-30px',zIndex:'0', cursor:'pointer'}} onClick={() => {setVendor('OPSWAT'); setSearchValue(''); setPage(0);}}>

<img alt='opswat' src='https://cybersecurity-excellence-awards.com/wp-content/uploads/2022/01/507133.png' style={{width:'85px', height:'15px'}}/>

</Box>


</Grid>
</AnimatedGrid>
    </> 
  );
}
