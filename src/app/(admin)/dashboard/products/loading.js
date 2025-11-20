// src/app/(admin)/dashboard/products/loading.js
import { Box, Skeleton, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export default function Loading() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4"><Skeleton width={250} /></Typography>
        <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {[...Array(6)].map((_, i) => <TableCell key={i}><Skeleton /></TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(8)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton variant="circular" width={40} height={40} /></TableCell>
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
    </Box>
  );
}