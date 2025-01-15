import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Filter from './Filter';
import CustomizedSelects from './CustomizeSelect';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

console.log()


interface Column {
  id: 'VersionName' | 'ProductName' | 'VendorName' | 'ReleaseDate' | 'EndOfSupportDate' | 'Extended_Support_End_Date' | 'LevelOfSupport' | 'Issues';
  label: string;
  minWidth?: number;
  align?: 'right';
  format_number?: (value: number) => string;
  format_date?: (value: Date) => string;

}

const columns: readonly Column[] = [
  { id: 'VersionName', label: 'Version Name', minWidth: 140 },
  { id: 'ProductName', label: 'Product Name', minWidth: 100 },
  {
    id: 'VendorName',
    label: 'Vendor Name',
    minWidth: 140,
    align: 'right',
    format_number: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'ReleaseDate',
    label: 'Version Release Date',
    minWidth: 140,
    align: 'right',
    format_date: (value: Date) => value.toLocaleString('he-IL').split(',')[0]
  },
  {
    id:'LevelOfSupport',
    label:'Level Of Support',
    minWidth:140,
    align:'right',
    format_number: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'EndOfSupportDate',
        label: 'Version EOL',
    minWidth: 140,
    align: 'right',
    format_date: (value: Date) => value.toLocaleString('he-IL').split(',')[0],
  },
  {
    id: 'Extended_Support_End_Date',
        label: 'Version Partial EOL',
    minWidth: 140,
    align: 'right',
    format_date: (value: Date) => value.toLocaleString('he-IL').split(',')[0]
  },
  {
    id:'Issues',
    label:'Issues',
    minWidth:140,
    align:'right',
    format_number: (value: number) => value.toLocaleString('en-US'),
  }


];






export default function StickyHeadTable({versions, distinctVendors, setDistinctVendors }: {versions: any[], distinctVendors: any[], setDistinctVendors: any}) {
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [filteredVersions, setFilteredVersions] = React.useState(versions);
  const [searchvalue, setSearchvalue] = React.useState('');
  const [chosenversion, setChosenversion] = React.useState<any>(versions? versions[0]: null);
  const [vendor, setVendor] = React.useState('');
  const [page, setPage] = React.useState(0);


  const prevVendorRef = React.useRef(vendor);
  const prevSearchRef = React.useRef(searchvalue);
 
  useEffect(() => {
    if (!versions) return;
  
    if (searchvalue !== '') {
      // Filter by search + vendor
      const newFiltered = versions.filter((version: any) => {
        const matchesSearch =
          version.VersionName?.toLowerCase().includes(searchvalue.toLowerCase()) ||
          version.ProductName?.toLowerCase().includes(searchvalue.toLowerCase()) ||
          version.VendorName?.toLowerCase().includes(searchvalue.toLowerCase());
  
        const matchesVendor = vendor ? version.VendorName === vendor : true;
        return matchesSearch && matchesVendor;
      });
      setFilteredVersions(newFiltered);
    } else if (vendor) {
      // No search, but vendor chosen
      const filtered_versions= versions.filter((v) => v.VendorName === vendor);
      setFilteredVersions(filtered_versions);
      if(chosenversion?.VendorName!==vendor){
        setChosenversion(filtered_versions[0])
        setPage(0)
      }
    } else {
      // No search, no vendor
      setFilteredVersions(versions);
    }
  }, [searchvalue, vendor, versions]);
  
useEffect(() => {
  // Compare old vs new
  if (prevVendorRef.current !== vendor || prevSearchRef.current !== searchvalue) {
    setPage(0);
  }
  // Update refs for next render
  prevVendorRef.current = vendor;
  prevSearchRef.current = searchvalue;
}, [vendor, searchvalue]);

  
  const handleRowClick = (row: any) => {
    console.log('row', row);
    setChosenversion(row);
    if (chosenversion && filteredVersions) {
      decidePage(row);
    }
  
  } 

  const decidePage = (row: any) => {
    const rowIndex = filteredVersions.findIndex(version => version.VersionName === row.VersionName);
    console.log('rowIndex', rowIndex);
    if (rowIndex !== -1) {
      setPage(Math.floor(rowIndex / rowsPerPage));
      console.log('page', Math.floor(rowIndex / rowsPerPage));
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
  
  
 

  return (
    <>
              <Grid container item xs={9} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row'}}>

    <Grid container item xs={12} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row', marginBottom:'30px'}}>
           
   
    <Grid item xs={5} style={{display:'flex', justifyContent:'center', alignItems:'flex-start', flexDirection:'column',}}>
             
             <CustomizedSelects 
               options={distinctVendors} 
               label="Vendor" 
               value={vendor} 
               setVendor={setVendor}
             />
             
  
               {/* <Box sx={{display:'flex', backgroundColor:'#FFF', borderRadius:'4px', paddingLeft:'13px', paddingRight:'13px', paddingTop:'14px', paddingBottom:'14px', gap:'10px', alignItems:'center'}}>
                  <Typography  sx={{ color: '#C4C4C4', fontSize:'14px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', textAlign:'center', fontFamily:'Kumbh Sans' }}>
                      Choose Vendor
                  </Typography>
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4.243 6.32851L0 2.08551L1.415 0.671509L4.243 3.50051L7.071 0.671509L8.486 2.08551L4.243 6.32851Z" fill="#C4C4C4"/>
  </svg>
             
             //create a dropdown for the vendors
             <Select
             label='Vendor'
             options={versions!.map((version: any) => version.VendorName)}
             onChange={(e) => setVendor(e.target.value)}
            
             /> 
             
               </Box> */}
  
              </Grid>

              <Grid item xs={7} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row'}}>

                <Filter filtervalue={searchvalue} setFiltervalue={setSearchvalue}/>
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
                  sx={{
                    backgroundColor: '#fff',
                    fontFamily: 'Kumbh Sans',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#152259',
                    paddingY: '12px',  // Vertical padding
                  }}
                >
                  {column.label}
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
                            ? column.format_date(new Date(value))
                            : column.id==='VendorName' ? 
                            
                            
                            <img src={value==='Fortra' ? 'https://static.fortra.com/hs-logo.png' : 'https://cybersecurity-excellence-awards.com/wp-content/uploads/2022/01/507133.png'} style={{width: value==='Fortra'? '60px': '90px', height:'15px'}}/> 
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

    <Grid item xs={3} style={{display:'flex', alignSelf:'flex-start', flexDirection:'column',alignItems:'center', justifyContent:'center',gap:'10px'}}>

<Typography style={{color:"#424242", fontSize:'14px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', textAlign:'center', fontFamily:'Kumbh Sans'}}>
  {vendor? vendor: 'All Vendors'}
</Typography>
{ 
vendor===''?
<Box sx={{display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'250px', paddingLeft:'25px', paddingRight:'25px', paddingTop:'25px', paddingBottom:'25px', backgroundColor:'#F5F5F5', width:'200px', height:'200px',zIndex:'0'}}>
<Box sx={{display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'100px', paddingLeft:'25px', paddingRight:'25px', paddingTop:'25px', paddingBottom:'25px', backgroundColor:'#FFFFFF', width:'80px', height:'80px'}}>

  
   <img src='https://static.fortra.com/hs-logo.png' style={{width:'90px', height:'25px'}}/>

</Box>
<Box sx={{display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'100px', paddingLeft:'25px', paddingRight:'25px', paddingTop:'25px', paddingBottom:'25px', backgroundColor:'#FFFFFF', width:'80px', height:'80px', marginLeft:'-30px',zIndex:'1'}}>

  
<img src='https://cybersecurity-excellence-awards.com/wp-content/uploads/2022/01/507133.png' style={{width:'90px', height:'15px'}}/>

</Box>
</Box>:

vendor==='Fortra' ?
            <Box sx={{display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'250px', paddingLeft:'25px', paddingRight:'25px', paddingTop:'25px', paddingBottom:'25px', backgroundColor:'#F5F5F5', width:'200px', height:'200px'}}>
              <img src='https://static.fortra.com/hs-logo.png' style={{width:'120px', height:'40px'}}/>

</Box> : vendor==='OPSWAT' ?
            <Box sx={{display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'250px', paddingLeft:'25px', paddingRight:'25px', paddingTop:'25px', paddingBottom:'25px', backgroundColor:'#F5F5F5', width:'200px', height:'200px'}}>
              <img src='https://cybersecurity-excellence-awards.com/wp-content/uploads/2022/01/507133.png' style={{width:'150px', height:'30px'}}/>

</Box> : 
null
}
<Typography style={{color:"#424242", fontSize:'16px', fontWeight:'700', lineHeight:'16px', letterSpacing:'0.2px', textAlign:'center', fontFamily:'Kumbh Sans'}}>
 {chosenversion?.ProductName || 'Product Name'}
</Typography>
<Typography style={{color:"#424242", fontSize:'14px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', textAlign:'center', fontFamily:'Kumbh Sans'}}>
 {chosenversion?.VersionName || 'Version Name'}
</Typography>

<Grid container xs={8} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row'}}>

  <Grid item xs={2} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row'}}>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.0495 2.52997L4.02953 6.45997C2.09953 7.71997 2.09953 10.54 4.02953 11.8L10.0495 15.73C11.1295 16.44 12.9095 16.44 13.9895 15.73L19.9795 11.8C21.8995 10.54 21.8995 7.72997 19.9795 6.46997L13.9895 2.53997C12.9095 1.81997 11.1295 1.81997 10.0495 2.52997Z" stroke="#8A8A8A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5.63012 13.08L5.62012 17.77C5.62012 19.04 6.60012 20.4 7.80012 20.8L10.9901 21.86C11.5401 22.04 12.4501 22.04 13.0101 21.86L16.2001 20.8C17.4001 20.4 18.3801 19.04 18.3801 17.77V13.13" stroke="#8A8A8A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M21.4004 15V9" stroke="#8A8A8A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
  </Grid>
  <Grid item xs={2} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row'}}>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.97 18.33C21.97 18.69 21.89 19.06 21.72 19.42C21.55 19.78 21.33 20.12 21.04 20.44C20.55 20.98 20.01 21.37 19.4 21.62C18.8 21.87 18.15 22 17.45 22C16.43 22 15.34 21.76 14.19 21.27C13.04 20.78 11.89 20.12 10.75 19.29C9.6 18.45 8.51 17.52 7.47 16.49C6.44 15.45 5.51 14.36 4.68 13.22C3.86 12.08 3.2 10.94 2.72 9.81C2.24 8.67 2 7.58 2 6.54C2 5.86 2.12 5.21 2.36 4.61C2.6 4 2.98 3.44 3.51 2.94C4.15 2.31 4.85 2 5.59 2C5.87 2 6.15 2.06 6.4 2.18C6.66 2.3 6.89 2.48 7.07 2.74L9.39 6.01C9.57 6.26 9.7 6.49 9.79 6.71C9.88 6.92 9.93 7.13 9.93 7.32C9.93 7.56 9.86 7.8 9.72 8.03C9.59 8.26 9.4 8.5 9.16 8.74L8.4 9.53C8.29 9.64 8.24 9.77 8.24 9.93C8.24 10.01 8.25 10.08 8.27 10.16C8.3 10.24 8.33 10.3 8.35 10.36C8.53 10.69 8.84 11.12 9.28 11.64C9.73 12.16 10.21 12.69 10.73 13.22C11.27 13.75 11.79 14.24 12.32 14.69C12.84 15.13 13.27 15.43 13.61 15.61C13.66 15.63 13.72 15.66 13.79 15.69C13.87 15.72 13.95 15.73 14.04 15.73C14.21 15.73 14.34 15.67 14.45 15.56L15.21 14.81C15.46 14.56 15.7 14.37 15.93 14.25C16.16 14.11 16.39 14.04 16.64 14.04C16.83 14.04 17.03 14.08 17.25 14.17C17.47 14.26 17.7 14.39 17.95 14.56L21.26 16.91C21.52 17.09 21.7 17.3 21.81 17.55C21.91 17.8 21.97 18.05 21.97 18.33Z" stroke="#A7A7A7" stroke-width="1.5" stroke-miterlimit="10"/>
<path d="M18.5 9C18.5 8.4 18.03 7.48 17.33 6.73C16.69 6.04 15.84 5.5 15 5.5" stroke="#A7A7A7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M22 9C22 5.13 18.87 2 15 2" stroke="#A7A7A7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
  </Grid>
  <Grid item xs={2} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row'}}>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V15.5C22 19 20 20.5 17 20.5Z" stroke="#A7A7A7" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17 9L13.87 11.5C12.84 12.32 11.15 12.32 10.12 11.5L7 9" stroke="#A7A7A7" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
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

  <Grid item xs={4} style={{display:'flex', justifyContent:'flex-start', alignItems:'flex-start', flexDirection:'column', gap:'10px'}}>
    <Typography style={{color:"#424242", fontSize:'14px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', fontFamily:'Kumbh Sans'}}>
      Stability
    </Typography>
    <Typography style={{color:"#A7A7A7", fontSize:'14px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', fontFamily:'Kumbh Sans'}}>  
      {/* {chosenversion?.Stability || ''} */}
    </Typography>
  </Grid>
  <Grid item xs={4} style={{display:'flex', justifyContent:'flex-start', alignItems:'flex-start', flexDirection:'column', gap:'10px'}}>
    <Typography style={{color:"#424242", fontSize:'14px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', fontFamily:'Kumbh Sans'}}>
     Known Issues 
    </Typography>
    <Typography style={{color:"#A7A7A7", fontSize:'14px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', fontFamily:'Kumbh Sans'}}>  
      {/* {chosenversion?.KnownIssues || ''} */}
    </Typography>
  </Grid>


</Grid>
<Grid container xs={8} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row', marginTop:'40px',paddingLeft:'10px'}}>
  <Typography style={{color:"#1A1A1A", fontSize:'14px', fontWeight:'700', lineHeight:'16px', letterSpacing:'0.2px', textAlign:'center', fontFamily:'Kumbh Sans'}}>
     Availble Vendors
  </Typography>
</Grid>

<Grid container xs={8} style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row', marginTop:'20px',paddingLeft:'10px'}}>
  
<Box sx={{display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50px', paddingLeft:'25px', paddingRight:'25px',zIndex:'-2', paddingTop:'25px', paddingBottom:'25px', backgroundColor:'#F5F5F5', width:'50px', height:'50px'}}>

<img src='https://static.fortra.com/hs-logo.png' style={{width:'80px', height:'20px'}}/>

</Box>
<Box sx={{display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50px', paddingLeft:'25px', paddingRight:'25px', paddingTop:'25px', paddingBottom:'25px', backgroundColor:'#F5F5F5', width:'50px', height:'50px',marginLeft:'-30px',zIndex:'0'}}>

<img src='https://cybersecurity-excellence-awards.com/wp-content/uploads/2022/01/507133.png' style={{width:'85px', height:'15px'}}/>

</Box>


</Grid>
</Grid>
    </> 
  );
}
