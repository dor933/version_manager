import { Table, TableBody, TableRow } from '@mui/material';
import { TableContainer, TablePagination } from '@mui/material';
import { Paper } from '@mui/material';
import React, { useEffect } from 'react';
import { TableCell } from '@mui/material';
import { TableHead } from '@mui/material';
import MyTabs from './Tabs';
import { useAuth } from './UseContext/MainAuth';
    
interface IssuesTableProps {
    chosenproduct: any;
    chosenversion: any;
  }

  interface Column {
    id: 'VersionName' | 'Issue Description' | 'Photos' | 'Issue Severity' | 'Issue Status' | 'Issue Date' | 'Issue Resolution' 
    label: string;
    minWidth?: number;
    align?: 'right' | 'left';
    format_number?: (value: number) => string;
    format_date?: (value: Date) => string;
    format_product?: (value: string) => string;
  
  }

  const columns: readonly Column[] = [
    { id: 'VersionName', label: 'Version Name', minWidth: 140, format_product: (value: string) => value.replace(/_/g, ' ') },

    {
      id: 'Issue Description',
      label: 'Description',
      minWidth: 140,
      align: 'right',
      format_product: (value: string) => value
    },

    {
      id: 'Issue Severity',
          label: 'Severity',
      minWidth: 140,
      align: 'right',
      format_product: (value: string) => value
    },
    {
      id: 'Issue Date',
          label: 'Date',
      minWidth: 140,
      align: 'right',
      format_date: (value: Date) => value.toLocaleString('he-IL').split(',')[0]
    },
    {
      id: 'Issue Resolution',
      label: 'Resolution',
      minWidth: 140,
      align: 'right',
      format_product: (value: string) => value
    },

    {
        id:'Photos',
        label:'Photos',
        minWidth:140,
        align:'right',
        format_product: (value: string) => value
    }
  
  
  
  ];

const IssuesTable = ({ chosenproduct, chosenversion }: IssuesTableProps) => {

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [chosenmodule, setChosenModule] = React.useState(0);
    const [filteredIssues, setFilteredIssues] = React.useState<any[]>([]);
    const { versions } = useAuth();

    useEffect(() => {
        const relevantversion = versions?.filter((version: any) => version.ProductName === chosenproduct.ProductName && version.VersionName === chosenversion.VersionName)
        const issues = relevantversion?.map((version: any) => version?.Issues ? version.Issues : [])
        if(issues){
            console.log('issues', issues)
            setFilteredIssues(issues);
        }
        console.log('chosenproduct', chosenproduct)
    }, [versions, chosenproduct]);



    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
      };
      
      const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      };

      const handleRowClick = (row: any) => {
        console.log(row);
      };
  return (

    <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 'none' }}>
        <MyTabs chosenmodule={chosenmodule} setChosenModule={setChosenModule} modules={chosenproduct.modules}/>
    <TableContainer sx={{ minHeight: 550,marginTop:'20px' }}>
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
          {filteredIssues && filteredIssues
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

                      <TableCell 
                        key={index} 
                        align='left'
                        sx={{
                          fontFamily: 'Kumbh Sans',
                          fontSize: '14px',
                          color: '#4B4B4B',
                          paddingY: '25px',  // Vertical padding
                        }}
                      >

                        {row[index]}

                        
                    

                          
                      </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
    <TablePagination
      rowsPerPageOptions={[10, 25, 100]}
      component="div"
      count={filteredIssues!=null ? filteredIssues.length : 0}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      sx={{
        fontFamily: 'Kumbh Sans',
      }}
    />
  </Paper>      
  );
};

export default IssuesTable;