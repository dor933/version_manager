import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

interface Column {
  id: 'version_name' | 'product_name' | 'vendor_name' | 'version_release_date' | 'version_end_of_life_date' | 'version_partial_end_of_life_date';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
    { id: 'version_name', label: 'Version Name', minWidth: 140 },
  { id: 'product_name', label: 'Product Name', minWidth: 100 },
  {
    id: 'vendor_name',
    label: 'Vendor Name',
    minWidth: 140,
    align: 'right',
    format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'version_release_date',
    label: 'Version Release Date',
    minWidth: 140,
    align: 'right',
    format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'version_end_of_life_date',
        label: 'Version EOL',
    minWidth: 140,
    align: 'right',
    format: (value: number) => value.toFixed(2),
  },
  {
    id: 'version_partial_end_of_life_date',
        label: 'Version Partial EOL',
    minWidth: 140,
    align: 'right',
    format: (value: number) => value.toFixed(2),
  },


];

interface Data {
  version_name: string;
  product_name: string;
  vendor_name: string;
  version_release_date: string;
  version_end_of_life_date: string;
  version_partial_end_of_life_date?: string;
}

function createData(
  version_name: string,
  product_name: string,
  vendor_name: string,
  version_release_date: string,
  version_end_of_life_date: string,
  version_partial_end_of_life_date?: string,
): Data {
  return { version_name, product_name, vendor_name, version_release_date, version_end_of_life_date, version_partial_end_of_life_date };
}

const rows = [
  createData('1.0.0', 'Fortra', 'Fortra', '2024-01-01', '2025-01-01', '2024-06-01'),
  createData('2.0.0', 'Fortra', 'Fortra', '2024-01-01', '2025-01-01', '2024-06-01'),
  createData('3.0.0', 'Fortra', 'Fortra', '2024-01-01', '2025-01-01', '2024-06-01'),
  createData('4.0.0', 'Fortra', 'Fortra', '2024-01-01', '2025-01-01', '2024-06-01'),
  createData('5.0.0', 'Fortra', 'Fortra', '2024-01-01', '2025-01-01', '2024-06-01'),
  createData('6.0.0', 'Fortra', 'Fortra', '2024-01-01', '2025-01-01', '2024-06-01'),
  createData('7.0.0', 'Fortra', 'Fortra', '2024-01-01', '2025-01-01', '2024-06-01'),
  createData('8.0.0', 'Fortra', 'Fortra', '2024-01-01', '2025-01-01', '2024-06-01'),
  createData('9.0.0', 'Fortra', 'Fortra', '2024-01-01', '2025-01-01', '2024-06-01'),
  createData('10.0.0', 'Fortra', 'Fortra', '2024-01-01', '2025-01-01', '2024-06-01'),
  createData('11.0.0', 'Fortra', 'Fortra', '2024-01-01', '2025-01-01', '2024-06-01'),
  createData('12.0.0', 'Fortra', 'Fortra', '2024-01-01', '2025-01-01', '2024-06-01'),
  createData('13.0.0', 'Fortra', 'Fortra', '2024-01-01', '2025-01-01', '2024-06-01'),
  createData('14.0.0', 'Fortra', 'Fortra', '2024-01-01', '2025-01-01', '2024-06-01'),
  createData('15.0.0', 'Fortra', 'Fortra', '2024-01-01', '2025-01-01', '2024-06-01'),


];

export default function StickyHeadTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 'none' }}>
      <TableContainer sx={{ maxHeight: 850 }}>
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
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
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
                          }}
                        >
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
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
        count={rows.length}
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
}
