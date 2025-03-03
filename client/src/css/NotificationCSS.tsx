const customTextFieldStyle = {
    '& .MuiOutlinedInput-root': {
      height: '53.5px',
      fontFamily: 'Kumbh Sans',
      '& fieldset': {
        borderColor: '#E0E0E0',
      },
      '&:hover fieldset': {
        borderColor: '#2D88D4',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2D88D4',
      }
    },
    '& .MuiInputLabel-root': {
      fontFamily: 'Kumbh Sans',
      fontSize: '15px',
      color: '#424242',
      '&.Mui-focused': {
        color: '#2D88D4'
      },
      transform: 'translate(14px, 16px) scale(1)',
      '&.MuiInputLabel-shrink': {
        transform: 'translate(14px, -3px) scale(0.75)',
      }
    },
  
  
  
    '& .MuiOutlinedInput-input': {
      padding: '14px',
      fontSize: '14px',
      color: '#424242'
    }
  };
  
  const customSelectStyle = {
    '& .MuiOutlinedInput-root': {
      height: '50px',
      fontFamily: 'Kumbh Sans',
      '& fieldset': {
        borderColor: '#E0E0E0',
      },
      '&:hover fieldset': {
        borderColor: '#2D88D4',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2D88D4',
      }
    },
    '& .MuiSelect-select': {
      padding: '16px',
      fontSize: '14px',
      color: '#424242',
      fontFamily: 'Kumbh Sans'
    },
    '& .MuiInputLabel-root': {
      fontFamily: 'Kumbh Sans',
      fontSize: '14px',
      color: '#424242',
      '&.Mui-focused': {
        color: '#2D88D4'
      },
      
   
    }
  };

  export {customTextFieldStyle, customSelectStyle};