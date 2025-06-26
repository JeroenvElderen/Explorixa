import React, { useEffect, useState, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MDInput from './MDInput';
import Button from '@mui/material/Button';
import { supabase } from '../SupabaseClient';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

import { v4 as uuidv4 } from 'uuid';
 
countries.registerLocale(enLocale);

const BUCKET = 'pins-images';

const PinFormModal = ({ open, onClose, initialLocation, onSave }) => {
  const [formData, setFormData] = useState({
    Name: '',
    Description: '',
    Latitude: '',
    Longitude: '',
    countryName: '',
    authorName: '',
    Category: '',
    Information: '',
    Images: '',
    Ranking: '',
    'Average Costs': '',
    City: '',
    'Main Image': '',
    'Post Summary': '',
  });
  
  const [authorId, setAuthorId] = useState('');
  const [mainImageFile, setMainImageFile] = useState(null);
  const [multiImageFiles, setMultiImageFiles] = useState([]);

  // Auth listener to set authorId and authorName
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const user = session.user;
        const fullName = user.user_metadata?.full_name || '';
        setAuthorId(user.id);
        setFormData((prev) => ({ ...prev, authorName: fullName }));
      } else {
        setAuthorId('');
        setFormData((prev) => ({ ...prev, authorName: '' }));
      }
    });

    const { subscription } = supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    // ...
  }
});

return () => {
  if (subscription?.unsubscribe) {
    subscription.unsubscribe();
  }
};





  }, []);

  // When modal opens or initialLocation changes, set form data
  useEffect(() => {
    if (!open) return;

    console.log('initialLocation in modal:', initialLocation);
    console.log('initialLocation.countryName:', initialLocation?.countryName);

    

      console.log('initialLocation:', initialLocation);
      const countryFromInitial = initialLocation?.countryName || '';
      console.log('initialLocation.countryCode:', initialLocation?.countryCode);

    setFormData((prev) => ({
      ...prev,
      Name: '',
      Description: '',
      Latitude: initialLocation?.lat !== undefined ? String(initialLocation.lat) : '',
      Longitude: initialLocation?.lng !== undefined ? String(initialLocation.lng) : '',
      countryName: countryFromInitial,
      Category: '',
      Information: '',
      Images: '',
      Ranking: '',
      'Average Costs': '',
      City: '',
      'Main Image': '',
      'Post Summary': '',
      authorName: prev.authorName || '',
    }));

    setMainImageFile(null);
    setMultiImageFiles([]);
  }, [open, initialLocation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${uuidv4()}.${fileExt}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    console.log('Submitting form...');
    console.log('Current authorId:', authorId);
  
    if (!formData.Name || !formData.Description) {
      alert('Please fill in all required fields.');
      return;
    }
  
    if (!authorId) {
      alert('User not authenticated. Cannot submit pin.');
      return;
    }
  
    // Parse latitude and longitude
    const latitude = parseFloat(formData.Latitude);
    const longitude = parseFloat(formData.Longitude);
  
    if (isNaN(latitude) || isNaN(longitude)) {
      alert('Invalid latitude or longitude values.');
      return;
    }
  
    try {
      let uploadedMainImageUrl = '';
      let uploadedImagesUrls = [];
  
      if (mainImageFile) {
        uploadedMainImageUrl = await uploadImage(mainImageFile);
      }
  
      if (multiImageFiles.length > 0) {
        const uploadPromises = multiImageFiles.map((file) => uploadImage(file));
        uploadedImagesUrls = await Promise.all(uploadPromises);
      }
  
      const newPin = {
        Name: formData.Name,
        countryName: formData.countryName,
        Category: formData.Category,
        Information: formData.Information,
        Images: uploadedImagesUrls.join(','),
        Ranking: formData.Ranking ? parseInt(formData.Ranking, 10) : null,
        'Average Costs': formData['Average Costs'] ? parseFloat(formData['Average Costs']) : null,
        City: formData.City,
        'Main Image': uploadedMainImageUrl,
        'Post Summary': formData['Post Summary'],
        user_id: authorId,
        latitude: latitude,
        longitude: longitude,
      };
  
      console.log('Inserting pin object:', newPin);
  
      const { error } = await supabase.from('pins').insert([newPin]);
  
      if (error) {
        console.error('Error saving pin:', error);
        alert('Error saving pin: ' + error.message);
      } else {
        console.log('Pin saved successfully!');
        alert('Pin saved successfully!');
        
        if (onSave) {
          onSave(newPin);
        }
        onClose();
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload error: ' + err.message);
    }
  };
  

  const mainImageInputRef = useRef(null);
  const multiImageInputRef = useRef(null);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Pin</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} id="pin-form">
          <MDInput
            fullWidth
            label="Title"
            name="Name"
            value={formData.Name}but 
            onChange={handleChange}
            required
            variant="outlined"
            margin="normal"
            sx={{
              input: { color: "black !important" },
              label: { color: "rgba(0,0,0,0.5) !important" },
            }}
          />
          <MDInput
            fullWidth
            label="Description"
            name="Description"
            value={formData.Description}
            onChange={handleChange}
            multiline
            rows={4}
            required
            variant="outlined"
            margin="normal"
            sx={{
              input: { color: "black !important" },
              label: { color: "rgba(0,0,0,0.5) !important" }
            }}
          />

          {/* Use plain hidden inputs for lat/lng to ensure values submit properly */}
          <MDInput
  fullWidth
  label="Latitude"
  name="Latitude"
  value={formData.Latitude}
  onChange={handleChange}
  required
  variant="outlined"
  margin="normal"
  sx={{
              input: { color: "black !important" },
              label: { color: "rgba(0,0,0,0.5) !important" }
            }}
/>
<MDInput
  fullWidth
  label="Longitude"
  name="Longitude"
  value={formData.Longitude}
  onChange={handleChange}
  required
  variant="outlined"
  margin="normal"
  sx={{
              input: { color: "black !important" },
              label: { color: "rgba(0,0,0,0.5) !important" }
            }}
/>


          <MDInput
            fullWidth
            label="Country Name"
            name="countryName"
            value={formData.countryName}
            onChange={handleChange}
            disabled
            variant="outlined"
            margin="normal"
            sx={{
              input: { color: "black !important" },
              label: { color: "rgba(0,0,0,0.5) !important" }
            }}
          />
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel id="category-label" 
            sx={{
              color: "rgba(0,0,0,0.5) !important"
            }}>Category</InputLabel>
            <Select
              labelId="category-label"
              id="category-select"
              name="Category"
              value={formData.Category}
              onChange={handleChange}
              label="Category"
              sx={{ 
                height: 44,
                color: "black",
                "& .MuiSelect-select": {
                  color: "black !important",
                }
              }}
            >
              <MenuItem value="Category1">Category1</MenuItem>
              <MenuItem value="Category2">Category2</MenuItem>
              <MenuItem value="Category3">Category3</MenuItem>
            </Select>
          </FormControl>
          <MDInput
            fullWidth
            label="Information"
            name="Information"
            value={formData.Information}
            onChange={handleChange}
            multiline
            rows={3}
            variant="outlined"
            margin="normal"
            sx={{
              input: { color: "black !important" },
              label: { color: "rgba(0,0,0,0.5) !important" }
            }}
          />
          <MDInput
            fullWidth
            label="Ranking"
            name="Ranking"
            value={formData.Ranking}
            onChange={handleChange}
            type="number"
            variant="outlined"
            margin="normal"
            sx={{
              input: { color: "black !important" },
              label: { color: "rgba(0,0,0,0.5) !important" }
            }}
          />
          <MDInput
            fullWidth
            label="Average Costs"
            name="Average Costs"
            value={formData['Average Costs']}
            onChange={handleChange}
            type="number"
            variant="outlined"
            margin="normal"
            sx={{
              input: { color: "black !important" },
              label: { color: "rgba(0,0,0,0.5) !important" }
            }}
          />
          <MDInput
            fullWidth
            label="City"
            name="City"
            value={formData.City}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            sx={{
              input: { color: "black !important" },
              label: { color: "rgba(0,0,0,0.5) !important" }
            }}
          />
          <MDInput
            fullWidth
            label="Post Summary"
            name="Post Summary"
            value={formData['Post Summary']}
            onChange={handleChange}
            multiline
            rows={2}
            variant="outlined"
            margin="normal"
            sx={{
              input: { color: "black !important" },
              label: { color: "rgba(0,0,0,0.5) !important" }
            }}
          />
          {/* Image Uploads */}
          <div style={{ marginTop: '1rem' }}>
            <label style={{ color: "rgba(0,0,0,0.5)"}}>Main Image Upload (only 1):</label>
            <br />
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={mainImageInputRef}
              onChange={(e) => setMainImageFile(e.target.files[0])}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => mainImageInputRef.current && mainImageInputRef.current.click()}
              sx={{ mt: 1, color: 'white !important' }}
            >
              Upload Main Image
            </Button>
            {mainImageFile && <span style={{ marginLeft: 10, color: "rgba(0,0,0,0.5)" }}>{mainImageFile.name}</span>}
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ color: "rgba(0,0,0,0.5)" }}>Additional Images (multi-upload):</label>
            <br />
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              ref={multiImageInputRef}
              onChange={(e) => setMultiImageFiles(Array.from(e.target.files))}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => multiImageInputRef.current && multiImageInputRef.current.click()}
              sx={{ mt: 1, color: 'white !important' }}
            >
              Upload Additional Images
            </Button>
            {multiImageFiles.length > 0 && (
              <span style={{ marginLeft: 10, color: "rgba(0,0,0,0.5)" }}>{multiImageFiles.map((file) => file.name).join(', ')}</span>
            )}
          </div>
          <MDInput
            fullWidth
            label="Author Name"
            name="authorName"
            value={formData.authorName}
            onChange={handleChange}
            disabled
            variant="outlined"
            margin="normal"
            sx={{
              input: { color: "black !important" },
              label: { color: "rgba(0,0,0,0.5) !important" }
            }}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button type="submit" form="pin-form" variant="contained" color="primary" sx={{ color: 'white !important' }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PinFormModal;
