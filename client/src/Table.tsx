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

interface Data {
    VersionName: string;
  ProductName: string;
  VendorName: string;
  ReleaseDate: string;
  EndOfSupportDate: string;
  Extended_Support_End_Date?: string;
}



export default function StickyHeadTable({versions, setChosenversion, filtervalue, distinctVendors, setDistinctVendors , vendor, setVendor, chosenversion}: {versions: any[], setChosenversion: any, filtervalue: string, distinctVendors: any[], setDistinctVendors: any, vendor: any, setVendor: any, chosenversion: any}) {
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [filteredVersions, setFilteredVersions] = React.useState(versions);
  const [searchvalue, setSearchvalue] = React.useState('');
  const [page, setPage] = React.useState(0);

  console.log('re rendered and page is', page);

  // Calculate page based on chosen version's index


 

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
      setFilteredVersions(versions.filter((v) => v.VendorName === vendor));
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
    // Force a re-render
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
    </>
  );
}
