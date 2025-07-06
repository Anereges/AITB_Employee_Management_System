// src/api/positionService.js

import api from './axios'; // Import your configured Axios instance

// Fetch all positions
export const getPositions = () => {
  return api.get('/api/position');
};

// Create a new position
export const createPosition = (positionData) => {
  return api.post('/api/position', positionData);
};

// Update an existing position by ID
export const updatePosition = (id, positionData) => {
  return api.put(`/api/position/${id}`, positionData);
};

// Delete a position by ID
export const deletePosition = (id) => {
  return api.delete(`/api/position/${id}`);
};
