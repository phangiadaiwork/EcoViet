import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Email,
  Download,
  Send,
  People,
  Analytics,
  Campaign
} from '@mui/icons-material';

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  source: 'newsletter' | 'user';
  subscribed_at: string;
  is_active: boolean;
}

const EmailMarketingAdmin: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total_subscribers: 0,
    newsletter_only: 0,
    registered_users: 0,
    recent_signups: 0
  });

  // Email campaign state
  const [campaignDialog, setCampaignDialog] = useState(false);
  const [emailCampaign, setEmailCampaign] = useState({
    subject: '',
    content: '',
    includeUsers: true,
    recipients: [] as string[]
  });

  // Export dialog
  const [exportDialog, setExportDialog] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    roleId: '',
    newsletterSubscribed: '',
    gender: '',
    dateFrom: '',
    dateTo: ''
  });
  

  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/newsletter/subscribers', {
        headers: {
          'Authorization': typeof window !== 'undefined' && localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/admin/newsletter-stats', {
        headers: {
          'Authorization': typeof window !== 'undefined' && localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

const handleExportEmails = async (useFilters: boolean = false) => {
  try {
    let url = 'https://be-ecom-2hfk.onrender.com/api/v1/admin/users/export-email';
    
    if (useFilters) {
      const queryParams = new URLSearchParams();
      if (exportFilters.roleId) queryParams.append('roleId', exportFilters.roleId);
      if (exportFilters.newsletterSubscribed) queryParams.append('newsletterSubscribed', exportFilters.newsletterSubscribed);
      if (exportFilters.gender) queryParams.append('gender', exportFilters.gender);
      if (exportFilters.dateFrom) queryParams.append('dateFrom', exportFilters.dateFrom);
      if (exportFilters.dateTo) queryParams.append('dateTo', exportFilters.dateTo);
      
      url = `https://be-ecom-2hfk.onrender.com/api/v1/admin/users/export-email-filtered?${queryParams.toString()}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': typeof window !== 'undefined' && localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      }
    });
    
    if (response.ok) {
      const text = await response.text();
      // Thêm BOM để Excel nhận diện UTF-8
      const bom = '\uFEFF';
      const blob = new Blob([bom + text], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_list_${useFilters ? 'filtered_' : ''}${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportDialog(false);
    } else {
      console.error('Export failed: Invalid status code', response.status);
    }
  } catch (error) {
    console.error('Export failed:', error);
  }
};



  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        <Email sx={{ mr: 1 }} />
        Email Marketing Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Subscribers
                  </Typography>
                  <Typography variant="h4">
                    {stats.total_subscribers}
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Newsletter Only
                  </Typography>
                  <Typography variant="h4">
                    {stats.newsletter_only}
                  </Typography>
                </Box>
                <Email sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Registered Users
                  </Typography>
                  <Typography variant="h4">
                    {stats.registered_users}
                  </Typography>
                </Box>
                <Analytics sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Recent Signups
                  </Typography>
                  <Typography variant="h4">
                    {stats.recent_signups}
                  </Typography>
                </Box>
                <Campaign sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={() => setCampaignDialog(true)}
          >
            Create Email Campaign
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => setExportDialog(true)}
          >
            Export User Data
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            onClick={fetchSubscribers}
            disabled={loading}
          >
            Refresh Data
          </Button>
        </Grid>
      </Grid>

      {/* Subscribers Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Email Subscribers
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Subscribed Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>{subscriber.email}</TableCell>
                    <TableCell>{subscriber.name || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={subscriber.source} 
                        color={subscriber.source === 'newsletter' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(subscriber.subscribed_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={subscriber.is_active ? 'Active' : 'Inactive'} 
                        color={subscriber.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Email Campaign Dialog */}
      <Dialog open={campaignDialog} onClose={() => setCampaignDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Email Campaign</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={emailCampaign.subject}
                onChange={(e) => setEmailCampaign(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="🎉 Special Offer Just for You!"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Content (HTML)"
                multiline
                rows={10}
                value={emailCampaign.content}
                onChange={(e) => setEmailCampaign(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your email content here..."
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={emailCampaign.includeUsers}
                    onChange={(e) => setEmailCampaign(prev => ({ ...prev, includeUsers: e.target.checked }))}
                  />
                }
                label="Include registered users who opted in for marketing"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCampaignDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Export User Information</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Export user data with detailed information including email, phone, address, orders, and more.
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>User Role</InputLabel>
                <Select
                  value={exportFilters.roleId}
                  label="User Role"
                  onChange={(e) => setExportFilters(prev => ({ ...prev, roleId: e.target.value }))}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="1">Admin</MenuItem>
                  <MenuItem value="2">User</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Newsletter Subscription</InputLabel>
                <Select
                  value={exportFilters.newsletterSubscribed}
                  label="Newsletter Subscription"
                  onChange={(e) => setExportFilters(prev => ({ ...prev, newsletterSubscribed: e.target.value }))}
                >
                  <MenuItem value="">All Users</MenuItem>
                  <MenuItem value="true">Subscribed</MenuItem>
                  <MenuItem value="false">Not Subscribed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={exportFilters.gender}
                  label="Gender"
                  onChange={(e) => setExportFilters(prev => ({ ...prev, gender: e.target.value }))}
                >
                  <MenuItem value="">All Genders</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date From"
                type="date"
                value={exportFilters.dateFrom}
                onChange={(e) => setExportFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date To"
                type="date"
                value={exportFilters.dateTo}
                onChange={(e) => setExportFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Export will include:
                </Typography>
                <Typography variant="body2" component="ul" sx={{ m: 0, pl: 2 }}>
                  <li>User ID, Name, Email, Phone, Address</li>
                  <li>Gender, Role, Newsletter subscription status</li>
                  <li>Total orders count and spending amount</li>
                  <li>Last order date, Registration date</li>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => handleExportEmails(false)} 
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Export All Users
          </Button>
          <Button 
            onClick={() => handleExportEmails(true)} 
            variant="contained"
          >
            Export with Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmailMarketingAdmin;