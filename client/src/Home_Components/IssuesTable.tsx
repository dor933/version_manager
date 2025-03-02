import { Table, TableBody, TableRow } from '@mui/material';
import { TableContainer, TablePagination } from '@mui/material';
import { Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { TableCell } from '@mui/material';
import { TableHead } from '@mui/material';
import MyTabs from './Tabs';
import CustomButton from '../Help_Components/Button';
import { PhotosComp } from '../Help_Components/PhotosComp';
import { TextField } from '@mui/material';
import { IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ImageHandler from '../Help_Components/ImageHandler';
import { apiService } from '../API/apiService';
import columns from '../css/IssuesColumns';

interface IssuesTableProps {
    chosenproduct: any;
    chosenversion: any;
    ispopupopen: boolean;
    setIsPopupOpen: (ispopupopen: boolean) => void;
    handlePopup: (title: string, message: string, isSuccess: boolean, buttonText: string) => void;
  }



const IssuesTable = ({ chosenproduct, chosenversion,ispopupopen, handlePopup }: IssuesTableProps) => {

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [chosenmodule, setChosenModule] = React.useState('');
    const [filteredIssues, setFilteredIssues] = React.useState<any[]>([]);
    const [isphotosopen, setIsPhotosOpen] = useState(false);
    const [photos, setPhotos] = React.useState<string[]>([]);
    const [editingCell, setEditingCell] = useState<{ rowId: number; column: string; value: string }>({ rowId: -1, column: '', value: '' });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    
 

    useEffect(() => {


      const issuesrelevnetversion= chosenproduct.issues.filter((issue: any) => issue.VersionId === chosenversion.VersionId);
      console.log('issuesrelevnetversion', issuesrelevnetversion);
        setFilteredIssues(issuesrelevnetversion);
    }, [chosenproduct]);



    useEffect(() => {

        const issuesrelevnetversion= chosenproduct.issues.filter((issue: any) => issue.VersionId === chosenversion.VersionId);

        if(chosenmodule==='All'){
            setFilteredIssues(issuesrelevnetversion);
        }
        else{


            const filteredIssues= issuesrelevnetversion.filter((issue: any) => issue.ModuleName === chosenmodule);
            setFilteredIssues(filteredIssues);
        }
    }, [chosenmodule])

   

    const getissuephotos= async (issueId: number) => {
        console.log('issueId', issueId)
            const response = await apiService.getIssuePhotos(issueId);
        const data = response.data;
        console.log('data', data)
        if(data.photos.length>0){
            setPhotos(data.photos);
            setIsPhotosOpen(true);
        }
        else{
            handlePopup('Error', 'There are no photos for this issue', false, 'OK');
        }

    }


    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
      };
      
      const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      };


    const handleEditStart = (issueId: number, column: string, value: string) => {
        setEditingCell({ rowId: issueId, column, value });
    };

    const handleEditChange = (newValue: string) => {
        setEditingCell(prev => ({ ...prev, value: newValue }));
    };

    const handleEditSubmit = async (issueId: number) => {
        // Implement the logic to update the issue in the backend
        let response;
        if(editingCell.column==='Workaround'){
            response = await apiService.addWorkaround(issueId, editingCell.value);
        }
        else if(editingCell.column==='Resolution'){
          console.log('editingCell.value', editingCell.value)
            response =  await apiService.addResolution(issueId, editingCell.value);
            console.log('response', response)
        }
        console.log('response', response)
        if(response?.data?.success){
            setEditingCell({ rowId: -1, column: '', value: '' });
            const relevantissues= chosenproduct.issues.filter((issue: any) => issue.IssueId === issueId)[0]
            if(editingCell.column==='Resolution'){
                relevantissues.Resolution= editingCell.value
            }
            else if(editingCell.column==='Workaround'){
                relevantissues.Workaround= editingCell.value
            }
             

            handlePopup('Success', 'Issue updated successfully', true, 'OK');
        }
        else{
            handlePopup('Error', 'Failed to update issue', false, 'OK');
        }
    };

    const isHebrewText = (text: string): boolean => {
        if (!text) return false;
        const hebrewPattern = /[\u0590-\u05FF]/;
        return hebrewPattern.test(text);
    };


    const handleAddPhotos = async (issueId: number | undefined) => {
      try {
        const formData = new FormData();
        // Make sure to append each file with the field name 'photos'
        // This must match the field name expected by multer.array('photos')
        selectedFiles.forEach((file) => {
          formData.append('photos', file);  // 'photos' must match server's upload.array('photos')
        });

        const response = await apiService.addPhotosToIssue(issueId!, selectedFiles);


        if (response?.data?.success) {
          handlePopup('Success', 'Photos added successfully', true, 'OK');
        } else {
          handlePopup('Error', 'Failed to add photos', false, 'OK');
        }
      } catch (error) {
        console.error('Error:', error);
        handlePopup('Error', 'Failed to add photos', false, 'OK');
      }
    };

    

  return (

    <Paper sx={{ 
      width: '85%', 
      overflow: 'hidden', 
      boxShadow: 'none',
      margin:'0 auto'
    }}>
 
      <PhotosComp photos={photos} isphotosopen={isphotosopen} setIsPhotosOpen={setIsPhotosOpen} />
      <MyTabs chosenmodule={chosenmodule} setChosenModule={setChosenModule} modules={chosenproduct.modules}/>
      <TableContainer sx={{ 
        minHeight: '65vh',
        maxHeight: '70vh', // Add max height to enable scrolling
        marginTop: '30px',
        opacity:ispopupopen ? 0.5 : 1,
      }}>
        <Table 
          stickyHeader 
          aria-label="sticky table"
          sx={{
            '& .MuiTableCell-root': {
              border: 'none',
              paddingLeft: '10px',
              minWidth: '60px', // Ensure minimum width for cells
            },
            tableLayout: 'auto', // Allow table to expand based on content
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
                    key={index}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#F5F5F5',
                      },
                      backgroundColor: index % 2 === 0 ? 'rgba(235, 246, 255, 0.50)' : '#FFFFFF',
                    }}
                  >
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell 
                          key={column.id} 
                          align={column.align}
                          sx={{
                            fontFamily: (column.id === 'Issue' || column.id==='Workaround' || column.id==='Resolution') && isHebrewText(value?.toString()) ? '"Assistant", sans-serif' : '"Kumbh Sans", sans-serif',
                            fontSize: '14px',
                            color: '#4B4B4B',
                            paddingY: '25px',
                            cursor: ['Workaround', 'Resolution'].includes(column.id) ? 'pointer' : 'default',
                            direction:  (column.id === 'Issue' || column.id==='Workaround' || column.id==='Resolution')  && isHebrewText(value?.toString()) ? 'rtl' : 'ltr',
                            textAlign: 'left',
                        
                            padding: '8px 16px',
                          }}
                          onClick={() => {
                            if (['Workaround', 'Resolution'].includes(column.id)) {
                              handleEditStart(row.IssueId, column.id, value || '');
                            }
                          }}
                          //when the user clicks outside the cell, clear the editing cell
                    
                        >
                          {['Workaround', 'Resolution'].includes(column.id) && editingCell.rowId === row.IssueId && editingCell.column === column.id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <TextField
                                value={editingCell.value}
                                onChange={(e) => handleEditChange(e.target.value)}
                                variant="standard"
                                size="small"
                                fullWidth
                                autoFocus
                                multiline
                              />
                              <IconButton 
                                size="small" 
                                onClick={(e: any) => {
                                  console.log('row.IssueId', row.IssueId)
                                  e.stopPropagation();
                                  handleEditSubmit(row.IssueId);
                                }}
                                sx={{ 
                                  backgroundColor: '#4CAF50',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: '#45a049'
                                  },
                                  width: '24px',
                                  height: '24px'
                                }}
                              >
                                <CheckIcon fontSize='small' />
                              </IconButton>
                            </div>
                          ) : (
                            column.format_date && value ? column.format_date(new Date(value))
                            : column.format_product && value ? column.format_product(value)
                            : column.format_number && value ? column.format_number(value)
                            : column.id === 'Photos' ? <CustomButton label="View Photos" onClick={() => getissuephotos(row.IssueId)} ispopupopen={ispopupopen} />
                            : ['Workaround', 'Resolution'].includes(column.id) ? (value || 'Click to edit')
                            : column.id === 'Add Photos' ? 
                            <ImageHandler ispopupopen={ispopupopen} setImages={setSelectedFiles} handleAddPhotos={() => handleAddPhotos(row.IssueId)}/> 
                            
                            : value

                          )}
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