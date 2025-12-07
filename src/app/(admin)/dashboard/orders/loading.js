/**
 * Admin orders loading component
 * @file src/app/(admin)/dashboard/orders/loading.js
 */
import { Box, Skeleton, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export default function Loading() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}><Skeleton width={250} /></Typography>
      <Paper>
        <Box sx={{ p: 2 }}><Skeleton variant="rectangular" height={56} /></Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {[...Array(8)].map((_, i) => <TableCell key={i}><Skeleton /></TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(8)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton variant="circular" width={24} height={24} /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}