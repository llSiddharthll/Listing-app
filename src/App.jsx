import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MultiStepForm from "./components/MultiStepForm";
import ListingsTable from "./components/ListingsTable";
import ListingDetail from "./components/ListingDetail";
import EditListing from "./components/EditListing";
import Navbar from "./components/Navbar";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<MultiStepForm />} />
          <Route path="/listings" element={<ListingsTable />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/listings/:id/edit" element={<EditListing />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
