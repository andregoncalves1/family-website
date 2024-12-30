// frontend-react/src/views/Dashboard.jsx
import React from 'react';
import NavBar from '../components/NavBar';
import { Outlet } from 'react-router-dom';

function Dashboard() {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}

export default Dashboard;
