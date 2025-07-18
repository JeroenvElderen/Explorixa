import React, { useRef } from 'react';
import { Button } from '@mui/material';

export default function ImageUploader({ mainFile, onMainChange, multiFiles, onMultiChange }) {
  const mainRef = useRef();
  const multiRef = useRef();

  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      <div>
        <Button variant={mainFile ? 'contained' : 'outlined'} onClick={() => mainRef.current.click()} sx={{
                    width: { xs: "138px!important", sm: "auto" },
                    borderColor: !mainFile ? "#F18F01" : undefined,
                    color: "#fff!important",
                    mb: { xs: 1, sm: 0 },
                    textTransform: "none",
                    ...(mainFile && {
                      backgroundColor: "rgba(241,143,1,0.5)!important",
                      "&:hover": { backgroundColor: "#D17C01!important" }
                    })
                  }}>
          {mainFile ? 'Image uploaded' : 'Upload Main Image'}
        </Button>
        <input
          ref={mainRef}
          type="file"
          accept="image/*"
          hidden
          onChange={e => onMainChange(e.target.files[0])}
        />
      </div>
      <div>
        <Button variant={multiFiles.length ? 'contained' : 'outlined'} onClick={() => multiRef.current.click()} sx={{
                    width: { xs: "138px!important", sm: "auto" },
                    borderColor: !multiFiles.length ? "#F18F01" : undefined,
                    color: "#fff!important",
                    mb: { xs: 1, sm: 0 },
                    textTransform: "none",
                    ...(multiFiles.length && {
                      backgroundColor: "rgba(241,143,1,0.5)!important",
                      "&:hover": { backgroundColor: "#D17C01!important" }
                    })
                  }}>
          {multiFiles.length ? 'Images uploaded' : 'Additional Images'}
        </Button>
        <input
          ref={multiRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={e => onMultiChange(Array.from(e.target.files))}
        />
      </div>
    </div>
  );
}