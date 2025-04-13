import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button, Modal, Table, Select } from 'flowbite-react';
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Link } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ItemProfile() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [orderIdToDelete, setOrderIdToDelete] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const componentPDF = useRef();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/auth/user/${currentUser._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      const res = await fetch(`/api/user/user_delete/${orderIdToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderIdToDelete));
      }
      setShowModal(false);
    } catch (error) {
      console.log(error.message);
    }
  };

  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: 'Total Item Report',
    onBeforeGetContent: () => {
      setIsGeneratingPDF(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsGeneratingPDF(false);
      alert('Data saved in PDF');
    }
  });

  const filteredOrders = selectedCategory === 'All' ? orders : orders.filter(order => order.category === selectedCategory);

  return (
    <div className="container mt-5">
      <h2 className="text-center fw-bold text-primary mb-4">Summary of Reviews</h2>

      {/* Category Filter */}
      <div className="text-center mb-4">
        <label className="fw-bold me-2">Filter by Category:</label>
        <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="All">All</option>
          {Array.from(new Set(orders.map(order => order.category))).map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <div ref={componentPDF} className="table-responsive">
        {filteredOrders.length > 0 ? (
          <Table hoverable className="table table-striped table-hover shadow-sm">
            <thead className="thead-dark">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Category</th>
                <th>Reviews</th>
                <th>Rate Count</th>
                {!isGeneratingPDF && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id}>
                  <td>{order.name}</td>
                  <td>{order.u_email}</td>
                  <td>{order.category}</td>
                  <td>{order.reviews}</td>
                  <td>{order.selectraiting}</td>
                  {!isGeneratingPDF && (
                    <td>
                      <Link to={`/update-item/${order._id}`} className="btn btn-success btn-sm me-2">
                        Edit
                      </Link>
                      <Button className="btn btn-danger btn-sm" onClick={() => {
                        setShowModal(true);
                        setOrderIdToDelete(order._id);
                      }}>
                        Delete
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-center text-muted">No items found in this category!</p>
        )}
      </div>

      {/* Generate Report Button */}
      <div className="text-center mt-4">
        <button className="btn btn-primary" onClick={generatePDF} disabled={isGeneratingPDF}>
          {isGeneratingPDF ? 'Generating PDF...' : 'Generate Report'}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} popup size="md">
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400" />
            <h3 className="mb-5 text-lg font-normal text-gray-500">
              Are you sure you want to delete this review?
            </h3>
            <div className="d-flex justify-content-center gap-3">
              <Button className="btn btn-danger" onClick={handleDeleteOrder}>
                Yes, I am sure
              </Button>
              <Button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
