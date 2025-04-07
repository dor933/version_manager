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
import {Order} from '../Types/WebTypes'
import { TextField, useMediaQuery } from '@mui/material';



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
  const isnotextraLarge = useMediaQuery('(max-width: 1500px)');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [dateFilterType, setDateFilterType] = useState('Release Date');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const prevProductRef = React.useRef(selectedProduct);
  const prevStartDateRef = React.useRef(startDate);
  const prevEndDateRef = React.useRef(endDate);
  const prevDateFilterTypeRef = React.useRef(dateFilterType);

  
 
  useEffect(() => {
    if (!versions) return;

    let newFiltered = versions;

    // Text search filter
    if (SearchValue !== '') {
      newFiltered = newFiltered.filter((version: any) => {
        return version.VersionName?.toLowerCase().includes(SearchValue.toLowerCase()) ||
          version.ProductName?.toLowerCase().includes(SearchValue.toLowerCase()) ||
          version.VendorName?.toLowerCase().includes(SearchValue.toLowerCase());
      });
    }

    // Vendor filter
    if (vendor) {
      newFiltered = newFiltered.filter((v) => v.VendorName === vendor);
    }
    
    // Product filter
    if (selectedProduct) {
      newFiltered = newFiltered.filter((v) => v.ProductName === selectedProduct);
    }
    
    // Date range filter
    if (startDate || endDate) {
      const dateField = dateFilterType === 'Release Date' ? 'ReleaseDate' : 'EndOfSupportDate';
      
      if (startDate) {
        const startDateObj = new Date(startDate);
        newFiltered = newFiltered.filter((v) => new Date(v[dateField]!) >= startDateObj);
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        // Add 1 day to include the end date in results
        newFiltered = newFiltered.filter((v) => new Date(v[dateField]!) < endDateObj);
      }
    }

    // Apply sorting
    newFiltered = sortedVersions(newFiltered, orderBy, order);
    
    setFilteredVersions(newFiltered);
    
    // Update selected version if necessary
    if (newFiltered.length > 0) {
      if (!ChosenVersion || 
          !newFiltered.some(v => v.VersionName === ChosenVersion.VersionName)) {
        setChosenVersion(newFiltered[0]);
        setChosenProduct(productsandmodules?.find((product: any) => 
          product.ProductName === newFiltered[0].ProductName));
      }
    }
    
    // Reset page when filters change
    if (prevVendorRef.current !== vendor || 
        prevSearchRef.current !== SearchValue ||
        prevProductRef.current !== selectedProduct ||
        prevStartDateRef.current !== startDate ||
        prevEndDateRef.current !== endDate ||
        prevDateFilterTypeRef.current !== dateFilterType) {
      setPage(0);
    }
    
    // Update refs
    prevVendorRef.current = vendor;
    prevSearchRef.current = SearchValue;
    prevProductRef.current = selectedProduct;
    prevStartDateRef.current = startDate;
    prevEndDateRef.current = endDate;
    prevDateFilterTypeRef.current = dateFilterType;
    
  }, [SearchValue, vendor, selectedProduct, startDate, endDate, dateFilterType, versions, orderBy, order]);
  
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
    {
      isnotextraLarge &&
      <Grid 
        container 
        item 
        xs={12} 
        style={{
          display:'flex', 
          justifyContent:'flex-start', 
          alignItems:'center', 
          flexDirection:'row',
          marginBottom:'25px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#fff',
          
        }}
      >
        <Grid container item xs={3} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row'}}>

          <Grid item xs={12} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row'}}>


   
{ 
vendor===''?
<Box sx={{display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'250px', paddingLeft:'10px', paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px', backgroundColor:'#F5F5F5', width:'150px', height:'150px',zIndex:'0'}}>
<Box sx={{display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'70px', paddingLeft:'10px', paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px', backgroundColor:'#FFFFFF', width:'70px', height:'70px'}}>

  
   <img alt='fortra' src='https://static.fortra.com/hs-logo.png' style={{width:'60px', height:'25px'}}/>

</Box>
<Box sx={{display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'70px', paddingLeft:'10px', paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px', backgroundColor:'#FFFFFF', width:'70px', height:'70px', marginLeft:'-30px',zIndex:'1'}}>

  
<img alt='opswat' src='https://cybersecurity-excellence-awards.com/wp-content/uploads/2022/01/507133.png' style={{width:'60px', height:'15px'}}/>

</Box>
</Box>:

vendor==='Fortra' ?
            <Box sx={{display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'250px', paddingLeft:'10px', paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px', backgroundColor:'#F5F5F5', width:'150px', height:'150px'}}>
              <img alt='fortra' src='https://static.fortra.com/hs-logo.png' style={{width:'90px', height:'25px'}}/>

</Box> : vendor==='OPSWAT' ?
              <Box sx={{display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'250px', paddingLeft:'10px', paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px', backgroundColor:'#F5F5F5', width:'150px', height:'150px'}}>
              <img alt='opswat' src='https://cybersecurity-excellence-awards.com/wp-content/uploads/2022/01/507133.png' style={{width:'90px', height:'15px'}}/>

</Box> : 
null
}

</Grid>



<Grid container item xs={12} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row',gap:'10px',marginTop:'10px',marginLeft:'-10px'}}>

<Box sx={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'row', width:'185px'}}>

<Typography style={{color:"#424242", fontSize:'14px', fontWeight:'700', lineHeight:'16px', letterSpacing:'0.2px', textAlign:'center', fontFamily:'Kumbh Sans'}}>
 {ChosenVersion?.ProductName.replace(/_/g, ' ') || 'Product Name'}
</Typography>
</Box>

<Box  sx={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'column', width:'185px'}}>


<Typography style={{color:"#424242", fontSize:'12px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', textAlign:'center', fontFamily:'Kumbh Sans'}}>
 {ChosenVersion?.VersionName || 'Version Name'}
</Typography>
</Box>
</Grid>

</Grid>

<Grid container xs={9} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row'}}>

  <Grid container xs={12} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row'}}>

<Grid container item xs={8} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row', marginTop:'40px', 
  
}}>
   <Grid item xs={3} style={{display:'flex', justifyContent:'flex-start', alignItems:'flex-start', flexDirection:'column', gap:'10px', minHeight:'100px'}}>
  <Typography style={{color:"#424242", fontSize:'14px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', textAlign:'center', fontFamily:'Kumbh Sans'}}>
    About
  </Typography>
  </Grid>
  <Grid item xs={3} style={{display:'flex', justifyContent:'flex-start', alignItems:'flex-start', flexDirection:'column', gap:'10px', minHeight:'100px'}}>

    <Typography style={{color:"#424242", fontSize:'14px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', fontFamily:'Kumbh Sans'}}>
      Known Issues
    </Typography>
  
    <Typography style={{color:"#A7A7A7", fontSize:'16px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', fontFamily:'Kumbh Sans',alignSelf:'center',marginTop:'5px'}}>  
      {productsandmodules?.find((product: any) => product.ProductName === ChosenVersion?.ProductName)?.issues?.filter((issue: any) => issue.VersionId === ChosenVersion?.VersionId).length}
    </Typography>
    </Grid>
  <Grid item xs={3} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'column', gap:'10px', minHeight:'100px'}}>
    <Typography style={{color:"#424242", fontSize:'14px', fontWeight:'500', lineHeight:'16px', letterSpacing:'0.2px', fontFamily:'Kumbh Sans', minHeight:'20px'}}>
    Issues 
    </Typography>
    <CustomButton label="Show Issues" onClick={() => {setIssuesDialog(true); }}/>

  </Grid>


</Grid>
<Grid container item xs={4} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row'}}>

<Grid item xs={4} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row', cursor:'pointer'}} onClick={() => {
  
  ChosenVersion?.VendorName==='Fortra' ? window.open('https://my.goanywhere.com/webclient/Login.xhtml', '_blank') : window.open('https://my.opswat.com/', '_blank')
}} >

<HomeSVG />
</Grid>
<Grid item xs={4} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row', cursor:'pointer'}} onClick={() => {
 window.open(ChosenVersion?.FullReleaseNotes, '_blank', 'noreferrer');
}}>

<InfoSVG />

</Grid>
<Grid item xs={4} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row', cursor:'pointer'}} onClick={() => {

ChosenVersion?.VendorName==='Fortra' ? window.open('mailto:goanywhere.support@helpsystems.com', '_blank') : window.open('mailto:support@opswat.com', '_blank')
}} >

<EmailSVG />

</Grid>

</Grid>
  </Grid>



</Grid>



      </Grid>

    }
    
              <Grid container item xs={isnotextraLarge ? 12 : 9} style={{display:'flex', justifyContent:'flex-start', alignItems:'center', flexDirection:'row'}}>

    

              <Grid item xs={12} style={{
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                marginBottom: '30px',
                marginTop: '10px'
              }}>
                <Filter filtervalue={SearchValue} setFiltervalue={setSearchValue}/>
              </Grid>
   

              <Grid item xs={12} style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <Typography 
                  style={{
                    color: "#152259", 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    fontFamily: 'Kumbh Sans'
                  }}
                >
                  Advanced Filters
                </Typography>
              </Grid>

              <Grid 
                container 
                item 
                xs={12} 
                style={{
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  backgroundColor: 'rgba(235, 246, 255, 0.5)',
                  borderRadius: '8px',
                  padding: '20px 16px',
                  marginBottom: '24px',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)'
                }}
              >
                <Grid item xs={2.3} style={{paddingRight: '16px'}}>
                  <CustomizedSelects 
                    options={distinctVendors} 
                    label="Vendor" 
                    value={vendor} 
                    setVendor={setVendor}
                    style={{
                      width: '100%',
                      backgroundColor: 'white',
                      borderRadius: '6px'
                    }}
                  />
                </Grid>

                <Grid item xs={2.3} style={{paddingRight: '16px'}}>
                  <CustomizedSelects 
                    options={vendor ? [...new Set(versions.filter(v => v.VendorName === vendor).map(v => v.ProductName))] : 
                      [...new Set(versions.map(v => v.ProductName))]} 
                    label="Product" 
                    value={selectedProduct} 
                    setVendor={setSelectedProduct}
                    style={{
                      width: '100%',
                      backgroundColor: 'white',
                      borderRadius: '6px'
                    }}
                  />
                </Grid>

                <Grid item xs={2.3} style={{paddingRight: '16px'}}>
                  <CustomizedSelects 
                    options={["Release Date", "EOL Date"]} 
                    label="Filter By" 
                    value={dateFilterType} 
                    setVendor={setDateFilterType}
                    style={{
                      width: '100%',
                      backgroundColor: 'white',
                      borderRadius: '6px'
                    }}
                  />
                </Grid>

                <Grid item container xs={4} style={{paddingRight: '16px', display: 'flex',marginTop:'3px'}}>
                  <Grid item xs={6} style={{paddingRight: '16px'}}>
                    <TextField
                      label="From"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                        style: {
                          fontFamily: 'Kumbh Sans',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#152259',
                        }
                      }}
                      inputProps={{
                        style: {
                          fontFamily: 'Kumbh Sans',
                          fontSize: '14px',
                          color: '#424242',
                          padding: '10px 14px'
                        }
                      }}
                      sx={{
                        width: '100%',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '6px',
                          '& fieldset': {
                            borderColor: '#e0e0e0',
                          },
                          '&:hover fieldset': {
                            borderColor: '#509CDB',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#509CDB',
                          },
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={6} style={{paddingLeft: '16px'}}>
                    <TextField
                      label="To"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                        style: {
                          fontFamily: 'Kumbh Sans',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#152259'
                        }
                      }}
                      inputProps={{
                        style: {
                          fontFamily: 'Kumbh Sans',
                          fontSize: '14px',
                          color: '#424242',
                          padding: '10px 14px'
                        }
                      }}
                      sx={{
                        width: '100%',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '6px',
                          '& fieldset': {
                            borderColor: '#e0e0e0',
                          },
                          '&:hover fieldset': {
                            borderColor: '#509CDB',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#509CDB',
                          },
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid item xs={0.5} style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      '&:hover': {
                        backgroundColor: '#e0e0e0'
                      }
                    }}
                    onClick={() => {
                      setVendor('');
                      setSelectedProduct('');
                      setDateFilterType('Release Date');
                      setStartDate('');
                      setEndDate('');
                    }}
                  >
                    <Typography style={{
                      fontSize: '12px', 
                      fontWeight: '600', 
                      fontFamily: 'Kumbh Sans',
                      color: '#666'
                    }}>
                      ✕
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

        <Grid item xs={12}>
    
    <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 'none' }}>
      <TableContainer sx={{ maxHeight: 900, minHeight: '500px' }}>
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

    {
      !isnotextraLarge &&
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
}
    </> 
  );
}
