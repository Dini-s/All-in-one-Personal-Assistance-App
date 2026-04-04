import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Chip,
  Avatar,
  Box,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Pagination
} from '@mui/material';
import {
  Edit,
  Delete,
  Save,
  Cancel,
  Search,
  FilterList,
  Refresh,
  Download
} from '@mui/icons-material';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
const API_BASE_URL = 'http://localhost:8070/home/serviceProvider';

const ProviderPage = () => {
  const [serviceProviders, setServiceProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchServiceProviders();
  }, []);

  const fetchServiceProviders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/service-providers`);
      const normalizedProviders = response.data.map(provider => ({
        ...provider,
        name: provider.name || '',
        email: provider.email || '',
        serviceType: provider.serviceType || '',
        location: provider.location || '',
        payRate: provider.payRate || [500, 2000],
        selectedLanguages: provider.selectedLanguages || [],
        availability: provider.availability || 'no',
      }));
      setServiceProviders(normalizedProviders);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      showSnackbar('Failed to fetch service providers', 'error');
    }
  };

  const handleDeleteClick = (provider) => {
    setProviderToDelete(provider);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Show loading indicator
    Swal.fire({
      title: 'Deleting Provider...',
      text: 'Please wait while we delete the service provider',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

      await axios.delete(`${API_BASE_URL}/delete-service-provider/${providerToDelete._id}`);
      setServiceProviders(serviceProviders.filter(sp => sp._id !== providerToDelete._id));
      // Show success message
    Swal.fire({
      title: 'Deleted!',
      text: 'Service provider has been deleted successfully',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#40E0D0',
    });
  } catch (err) {
    // Show error message
    Swal.fire({
      title: 'Error!',
      text: 'Failed to delete service provider',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#FF7F50',
    });
  } finally {
    setDeleteDialogOpen(false);
  }
};

  const handleEditClick = (provider) => {
    setEditingProvider({ ...provider });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      // Show loading indicator
    Swal.fire({
      title: 'Updating Provider...',
      text: 'Please wait while we update the service provider',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

      const response = await axios.put(
        `${API_BASE_URL}/update-service-provider/${editingProvider._id}`,
        editingProvider
      );
      
      const updatedProvider = response.data.data;
      const normalizedProvider = {
        ...updatedProvider,
        name: updatedProvider.name || '',
        email: updatedProvider.email || '',
        serviceType: updatedProvider.serviceType || '',
        location: updatedProvider.location || '',
        payRate: updatedProvider.payRate || [500, 2000],
        selectedLanguages: updatedProvider.selectedLanguages || [],
        availability: updatedProvider.availability || 'no',
      };
      
      setServiceProviders(serviceProviders.map(sp => 
        sp._id === editingProvider._id ? normalizedProvider : sp
      ));
      
      // Show success message
    Swal.fire({
      title: 'Updated!',
      text: 'Service provider has been updated successfully',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#40E0D0',
    });
      setEditDialogOpen(false);
    }  catch (err) {
      // Show error message
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update service provider',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#FF7F50',
      });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingProvider({ ...editingProvider, [name]: value });
  };

  const handleCheckboxChange = (field, value) => {
    const currentValues = editingProvider[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    
    setEditingProvider({ ...editingProvider, [field]: newValues });
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const filteredProviders = serviceProviders.filter(provider => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (provider.name || '').toLowerCase().includes(searchLower) ||
      (provider.email || '').toLowerCase().includes(searchLower) ||
      (provider.serviceType || '').toLowerCase().includes(searchLower) ||
      (provider.location || '').toLowerCase().includes(searchLower) ||
      (provider.selectedLanguages || []).some(lang => lang.toLowerCase().includes(searchLower)) ||
      (searchLower === 'available' && provider.availability === 'yes') ||
      (searchLower === 'not available' && provider.availability === 'no');
    
    const matchesServiceFilter = filter === 'all' || provider.serviceType.toLowerCase() === filter.toLowerCase();
    
    const matchesStatusFilter = statusFilter === 'all' || 
      (statusFilter === 'available' && provider.availability === 'yes') ||
      (statusFilter === 'not-available' && provider.availability === 'no');
    
    const matchesLanguageFilter = languageFilter === 'all' || 
      (provider.selectedLanguages && provider.selectedLanguages.includes(languageFilter));
    
    const matchesLocationFilter = locationFilter === 'all' || 
      provider.location.toLowerCase() === locationFilter.toLowerCase();
    
    return matchesSearch && matchesServiceFilter && matchesStatusFilter && matchesLanguageFilter && matchesLocationFilter;
  });

  const paginatedProviders = filteredProviders.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const serviceTypes = [...new Set(serviceProviders.map(sp => sp.serviceType))].filter(type => type !== '');
  const availableLanguages = ['Sinhala', 'English', 'Tamil'];
  const availableLocations = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 
    'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 
    'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 
    'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 
    'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle'
  ];

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      let yPosition = 20;

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 102, 204);
      doc.text('Service Providers Report', 14, yPosition);
      yPosition += 10;

      // Add search/filter info if applicable
      if (searchTerm || filter !== 'all' || statusFilter !== 'all' || languageFilter !== 'all' || locationFilter !== 'all') {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        let filterText = '';
        if (searchTerm) filterText += `Search: "${searchTerm}" (Name, Email, Service, Location, Language, Status)`;
        if (filter !== 'all') {
          if (filterText) filterText += ', ';
          filterText += `Service: ${filter}`;
        }
        if (statusFilter !== 'all') {
          if (filterText) filterText += ', ';
          filterText += `Status: ${statusFilter === 'available' ? 'Available' : 'Not Available'}`;
        }
        if (languageFilter !== 'all') {
          if (filterText) filterText += ', ';
          filterText += `Language: ${languageFilter}`;
        }
        if (locationFilter !== 'all') {
          if (filterText) filterText += ', ';
          filterText += `Location: ${locationFilter}`;
        }
        // Wrap text to avoid overflow
        const splitText = doc.splitTextToSize(filterText, 170);
        doc.text(splitText, 14, yPosition);
        yPosition += splitText.length * 5; // Adjust yPosition based on number of lines
      }

      // Date on a new line below the search/filter info
      const date = new Date().toLocaleDateString();
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Generated on: ${date}`, 14, yPosition);
      yPosition += 10;

      // Add a horizontal line below the header
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 204);
      doc.line(14, yPosition, 196, yPosition);
      yPosition += 10;

      // Check if there are any filtered providers
      if (filteredProviders.length === 0) {
        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text('No service providers match your search criteria', 14, yPosition);
        doc.save('service-providers-report.pdf');
        showSnackbar('PDF generated with no results (based on current search)', 'info');
        return;
      }

      // Prepare table data
      const tableData = filteredProviders.map(provider => [
        provider.name,
        provider.email,
        provider.serviceType,
        provider.location,
        `${provider.payRate[0]} - ${provider.payRate[1]}`,
        provider.selectedLanguages.join(', ') || 'None',
        provider.availability === 'yes' ? 'Available' : 'Not Available'
      ]);

      // Define table columns
      const tableColumns = [
        'Name',
        'Email',
        'Service Type',
        'Location',
        'Rate (Rs/hr)',
        'Languages',
        'Availability'
      ];

      // Generate table using jspdf-autotable
      autoTable(doc, {
        startY: yPosition,
        head: [tableColumns],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [0, 102, 204],
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10,
          textColor: 50
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
        margin: { left: 14, right: 14 },
        styles: {
          cellPadding: 3,
          lineWidth: 0.1,
          lineColor: 200
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Name
          1: { cellWidth: 35 }, // Email
          2: { cellWidth: 25 }, // Service Type
          3: { cellWidth: 25 }, // Location
          4: { cellWidth: 20 }, // Rate
          5: { cellWidth: 30 }, // Languages
          6: { cellWidth: 20 }  // Availability
        }
      });

      // Add page numbers as footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Page ${i} of ${pageCount}`, 196, 285, { align: 'right' });
      }

      // Download the PDF
      doc.save('service-providers-report.pdf');
      showSnackbar('PDF report generated successfully (based on current search)', 'success');
    } catch (err) {
      showSnackbar('Failed to generate PDF report', 'error');
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a237e 0%, #121212 100%)',
      color: 'white',
      p: { xs: 2, md: 4 }
    }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: 'white',
            mb: 4,
            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
          }}
        >
          Service Providers Management
        </Typography>
        <Paper sx={{ 
          p: 2, 
          mb: 3, 
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          width: '100%'
        }}>
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} sm={6} md={3}>  {/* Increased from md={3} */}
    <TextField
      fullWidth
      variant="outlined"
      placeholder="Search providers..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      InputProps={{
        startAdornment: (
          <Search sx={{ color: 'white', mr: 1 }} />
        ),
        sx: {
          color: 'white',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.3)'
          }
        }
      }}
    />
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <FormControl fullWidth>
      <InputLabel sx={{ color: 'white' }}>Filter by Service</InputLabel>
      <Select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        sx={{
          color: 'white',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.3)'
          },
          '& .MuiSvgIcon-root': {
            color: 'white'
          }
        }}
      >
        <MenuItem value="all">All Services</MenuItem>
        {serviceTypes.map(type => (
          <MenuItem key={type} value={type.toLowerCase()}>
            {type}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'white' }}>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white'
                    }
                  }}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="not-available">Not Available</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'white' }}>Filter by Language</InputLabel>
                <Select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white'
                    }
                  }}
                >
                  <MenuItem value="all">All Languages</MenuItem>
                  {availableLanguages.map(lang => (
                    <MenuItem key={lang} value={lang}>
                      {lang}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'white' }}>Filter by Location</InputLabel>
                <Select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white'
                    }
                  }}
                >
                  <MenuItem value="all">All Locations</MenuItem>
                  {availableLocations.map(loc => (
                    <MenuItem key={loc} value={loc.toLowerCase()}>
                      {loc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs="auto" sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              ml: 'auto', 
              justifyContent: 'flex-end',
              flexShrink: 0
            }}>
              <Tooltip title="Download PDF (based on current search)">
                <IconButton onClick={generatePDF} sx={{ 
                  color: 'white', 
                  mr: 1,
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                }}>
                  <Download />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton onClick={fetchServiceProviders} sx={{ 
                  color: 'white',
                  mr: 1,
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                }}>
                  <Refresh />
                </IconButton>
              </Tooltip>

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                py: 0.75,
                px: 1.5,
                borderRadius: 2,
                backgroundColor: 'rgba(0, 91, 187, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {filteredProviders.length}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden'
            }}>
              <Table>
                <TableHead sx={{ backgroundColor: 'rgba(0, 91, 187, 0.3)' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Profile</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Service Type</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rate (Rs/hr)</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Languages</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedProviders.length > 0 ? (
                    paginatedProviders.map((provider) => (
                      <TableRow 
                        key={provider._id} 
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'rgba(255, 255, 255, 0.05)' 
                          },
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                        }}
                      >
                        <TableCell>
                          <Avatar src={provider.photo} alt={provider.name} />
                        </TableCell>
                        <TableCell sx={{ color: 'white' }}>{provider.name}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{provider.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={provider.serviceType} 
                            color="primary" 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'white' }}>{provider.location}</TableCell>
                        <TableCell sx={{ color: 'white' }}>
                          {provider.payRate[0]} - {provider.payRate[1]}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {provider.selectedLanguages?.map(lang => (
                              <Chip
                                key={lang}
                                label={lang}
                                size="small"
                                sx={{
                                  color: 'white',
                                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                }}
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={provider.availability === 'yes' ? 'Available' : 'Not Available'} 
                            color={provider.availability === 'yes' ? 'success' : 'error'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton 
                              onClick={() => handleEditClick(provider)} 
                              sx={{ color: 'white' }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              onClick={() => handleDeleteClick(provider)} 
                              sx={{ color: 'white' }}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ color: 'white', py: 4 }}>
                        No service providers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(filteredProviders.length / rowsPerPage)}
                page={page}
                onChange={(e, value) => setPage(value)}
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: 'white'
                  },
                  '& .Mui-selected': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2) !important'
                  }
                }}
              />
            </Box>
          </>
        )}

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              backgroundColor: '#1a1a1a',
              color: 'white'
            }
          }}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography sx={{ color: 'white' }}>
              Are you sure you want to delete {providerToDelete?.name}? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialogOpen(false)} 
              startIcon={<Cancel />}
              sx={{ color: 'white' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error"
              startIcon={<Delete />}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {editingProvider && (
          <Dialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            fullWidth
            maxWidth="md"
            PaperProps={{
              sx: {
                backgroundColor: '#1a1a1a',
                color: 'white'
              }
            }}
          >
            <DialogTitle sx={{ color: 'white' }}>Edit Service Provider</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={editingProvider.name || ''}
                    onChange={handleEditChange}
                    margin="normal"
                    InputProps={{
                      sx: { color: 'white' }
                    }}
                    InputLabelProps={{
                      sx: { color: 'white' }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={editingProvider.email || ''}
                    onChange={handleEditChange}
                    margin="normal"
                    InputProps={{
                      sx: { color: 'white' }
                    }}
                    InputLabelProps={{
                      sx: { color: 'white' }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="NIC"
                    name="nic"
                    value={editingProvider.nic || ''}
                    onChange={handleEditChange}
                    margin="normal"
                    InputProps={{
                      sx: { color: 'white' }
                    }}
                    InputLabelProps={{
                      sx: { color: 'white' }
                    }}
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel sx={{ color: 'white' }}>Location</InputLabel>
                    <Select
                      name="location"
                      value={editingProvider.location || ''}
                      onChange={handleEditChange}
                      sx={{
                        color: 'white',
                        '& .MuiSvgIcon-root': {
                          color: 'white'
                        }
                      }}
                    >
                      {availableLocations.map(loc => (
                        <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel sx={{ color: 'white' }}>Service Type</InputLabel>
                    <Select
                      name="serviceType"
                      value={editingProvider.serviceType || ''}
                      onChange={handleEditChange}
                      sx={{
                        color: 'white',
                        '& .MuiSvgIcon-root': {
                          color: 'white'
                        }
                      }}
                    >
                      <MenuItem value="HouseCleaning">House Cleaning</MenuItem>
                      <MenuItem value="KitchenHelpers">Kitchen Helpers</MenuItem>
                      <MenuItem value="ChildCare">Child Care</MenuItem>
                      <MenuItem value="ElderCare">Elder Care</MenuItem>
                      <MenuItem value="PetCare">Pet Care</MenuItem>
                      <MenuItem value="Education">Education</MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Min Rate (Rs)"
                      name="payRate[0]"
                      type="number"
                      value={editingProvider.payRate[0] || 500}
                      onChange={(e) => {
                        const newPayRate = [...editingProvider.payRate];
                        newPayRate[0] = e.target.value;
                        setEditingProvider({ ...editingProvider, payRate: newPayRate });
                      }}
                      margin="normal"
                      InputProps={{
                        sx: { color: 'white' }
                      }}
                      InputLabelProps={{
                        sx: { color: 'white' }
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Max Rate (Rs)"
                      name="payRate[1]"
                      type="number"
                      value={editingProvider.payRate[1] || 2000}
                      onChange={(e) => {
                        const newPayRate = [...editingProvider.payRate];
                        newPayRate[1] = e.target.value;
                        setEditingProvider({ ...editingProvider, payRate: newPayRate });
                      }}
                      margin="normal"
                      InputProps={{
                        sx: { color: 'white' }
                      }}
                      InputLabelProps={{
                        sx: { color: 'white' }
                      }}
                    />
                  </Box>

                  <FormControl fullWidth margin="normal">
                    <InputLabel sx={{ color: 'white' }}>Availability</InputLabel>
                    <Select
                      name="availability"
                      value={editingProvider.availability || ''}
                      onChange={handleEditChange}
                      sx={{
                        color: 'white',
                        '& .MuiSvgIcon-root': {
                          color: 'white'
                        }
                      }}
                    >
                      <MenuItem value="yes">Available</MenuItem>
                      <MenuItem value="no">Not Available</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ color: 'white' }}>
                    Languages Spoken
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['Sinhala', 'English', 'Tamil'].map(lang => (
                      <FormControlLabel
                        key={lang}
                        control={
                          <Checkbox
                            checked={editingProvider.selectedLanguages?.includes(lang) || false}
                            onChange={() => handleCheckboxChange('selectedLanguages', lang)}
                            sx={{ color: 'white' }}
                          />
                        }
                        label={<Typography sx={{ color: 'white' }}>{lang}</Typography>}
                      />
                    ))}
                  </Box>
                </Grid>

                {editingProvider.serviceType === 'PetCare' && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: 'white' }}>
                      Pet Types
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {['Dogs', 'Cats', 'Birds', 'Fish'].map(pet => (
                        <FormControlLabel
                          key={pet}
                          control={
                            <Checkbox
                              checked={editingProvider.selectedPetTypes?.includes(pet) || false}
                              onChange={() => handleCheckboxChange('selectedPetTypes', pet)}
                              sx={{ color: 'white' }}
                            />
                          }
                          label={<Typography sx={{ color: 'white' }}>{pet}</Typography>}
                        />
                      ))}
                    </Box>
                  </Grid>
                )}

                {editingProvider.serviceType === 'ChildCare' && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: 'white' }}>
                      Age Groups
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {['Newborn', 'Toddler', 'Pre-school', 'Primary School', 'Teenager (12+ years)'].map(age => (
                        <FormControlLabel
                          key={age}
                          control={
                            <Checkbox
                              checked={editingProvider.selectedAgeGroups?.includes(age) || false}
                              onChange={() => handleCheckboxChange('selectedAgeGroups', age)}
                              sx={{ color: 'white' }}
                            />
                          }
                          label={<Typography sx={{ color: 'white' }}>{age}</Typography>}
                        />
                      ))}
                    </Box>
                  </Grid>
                )}

                {editingProvider.serviceType === 'Education' && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom sx={{ color: 'white' }}>
                        Syllabus
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {['Local Syllabus', 'Cambridge Syllabus', 'Edxcel Syllabus'].map(syllabus => (
                          <FormControlLabel
                            key={syllabus}
                            control={
                              <Checkbox
                                checked={editingProvider.selectedSyllabi?.includes(syllabus) || false}
                                onChange={() => handleCheckboxChange('selectedSyllabi', syllabus)}
                                sx={{ color: 'white' }}
                              />
                            }
                            label={<Typography sx={{ color: 'white' }}>{syllabus}</Typography>}
                          />
                        ))}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom sx={{ color: 'white' }}>
                        Subjects
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {['Art', 'Business', 'ICT', 'Mathematics', 'Physics', 'Science', 'Music', 'English', 'Chemistry', 'History', 'Other Languages'].map(subject => (
                          <FormControlLabel
                            key={subject}
                            control={
                              <Checkbox
                                checked={editingProvider.selectedSubjects?.includes(subject) || false}
                                onChange={() => handleCheckboxChange('selectedSubjects', subject)}
                                sx={{ color: 'white' }}
                              />
                            }
                            label={<Typography sx={{ color: 'white' }}>{subject}</Typography>}
                          />
                        ))}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom sx={{ color: 'white' }}>
                        Grades
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'O/L', 'A/L'].map(grade => (
                          <FormControlLabel
                            key={grade}
                            control={
                              <Checkbox
                                checked={editingProvider.selectedGrades?.includes(grade) || false}
                                onChange={() => handleCheckboxChange('selectedGrades', grade)}
                                sx={{ color: 'white' }}
                              />
                            }
                            label={<Typography sx={{ color: 'white' }}>{grade}</Typography>}
                          />
                        ))}
                      </Box>
                    </Grid>
                  </>
                )}

                {editingProvider.serviceType !== 'Education' && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: 'white' }}>
                      Services Offered
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {(() => {
                        switch(editingProvider.serviceType) {
                          case 'HouseCleaning':
                            return ['Bathroom Cleaning', 'Carpet Cleaning', 'Kitchen Cleaning', 'Laundry', 'Windows Cleaning'];
                          case 'KitchenHelpers':
                            return ['Birthday', 'Family Reunion', 'Friends Gathering', 'Alms Giving', 'Foodie Adventure', 'Other'];
                          case 'ElderCare':
                            return ['Personal Care', 'Transportation', 'Specialized Care', 'Household Tasks', 'Hospice Care', 'Nursing and Health Care'];
                          case 'PetCare':
                            return ['Walking', 'Day Care', 'Overnight Sitting', 'Training', 'Grooming', 'Transportation'];
                          case 'ChildCare':
                            return ['Day Care', 'After School Care', 'Nannies', 'Baby Sitters', 'In-Home Care', 'Childminders'];
                          default:
                            return [];
                        }
                      })().map(service => (
                        <FormControlLabel
                          key={service}
                          control={
                            <Checkbox
                              checked={editingProvider.selectedServices?.includes(service) || false}
                              onChange={() => handleCheckboxChange('selectedServices', service)}
                              sx={{ color: 'white' }}
                            />
                          }
                          label={<Typography sx={{ color: 'white' }}>{service}</Typography>}
                        />
                      ))}
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="About"
                    name="about"
                    value={editingProvider.about || ''}
                    onChange={handleEditChange}
                    multiline
                    rows={4}
                    margin="normal"
                    InputProps={{
                      sx: { color: 'white' }
                    }}
                    InputLabelProps={{
                      sx: { color: 'white' }
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setEditDialogOpen(false)} 
                startIcon={<Cancel />}
                sx={{ color: 'white' }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditSave} 
                color="primary"
                startIcon={<Save />}
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default ProviderPage;
