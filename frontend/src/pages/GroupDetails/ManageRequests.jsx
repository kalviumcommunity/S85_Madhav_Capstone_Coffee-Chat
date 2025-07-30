import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar';
import { 
  ArrowLeft, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import BACKEND_URL from '../../config';
import './ManageRequests.css';

const ManageRequests = ({ user, setUser, setLoading }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLocalLoading] = useState(true);

  useEffect(() => {
    fetchPendingRequests();
  }, [id]);

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/groups/${id}/pending-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const requests = await response.json();
        setPendingRequests(requests);
      } else if (response.status === 403) {
        toast.error('You are not authorized to view pending requests');
        navigate(`/groups/${id}`);
      } else {
        toast.error('Failed to load pending requests');
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      toast.error('Failed to load pending requests');
    } finally {
      setLocalLoading(false);
    }
  };

  const fetchGroupDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/groups/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const groupData = await response.json();
        setGroup(groupData);
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const handleApprove = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/groups/${id}/approve/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Request approved successfully!');
        // Remove the approved request from the list
        setPendingRequests(prev => prev.filter(request => request.userId._id !== userId));
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/groups/${id}/reject/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Request rejected successfully!');
        // Remove the rejected request from the list
        setPendingRequests(prev => prev.filter(request => request.userId._id !== userId));
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-yellow-50">
        <Navbar user={user} setUser={setUser} />
        <div className="pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-yellow-50">
      <Navbar user={user} setUser={setUser} />
      
      <div className="pt-24 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={() => navigate(`/groups/${id}`)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Manage Requests
              </h1>
              <p className="text-gray-600">
                {group?.name} • Review and manage join requests
              </p>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Pending Requests
                  </h3>
                  <p className="text-gray-600">
                    {pendingRequests.length} request{pendingRequests.length !== 1 ? 's' : ''} waiting for approval
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">
                  {pendingRequests.length}
                </div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          </div>

          {/* Requests List */}
          {pendingRequests.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-white/20 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Pending Requests
              </h3>
              <p className="text-gray-600 mb-6">
                All join requests have been processed. Check back later for new requests.
              </p>
              <button
                onClick={() => navigate(`/groups/${id}`)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
              >
                Back to Group
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.userId._id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* User Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {request.userId.profileImage ? (
                          <img
                            src={request.userId.profileImage}
                            alt={request.userId.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          request.userId.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      
                      {/* User Info */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          {request.userId.name}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {request.userId.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Requested {formatDate(request.requestedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleApprove(request.userId._id)}
                        className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      
                      <button
                        onClick={() => handleReject(request.userId._id)}
                        className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Card */}
          <div className="mt-8 bg-blue-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-lg font-semibold text-blue-800 mb-2">
                  About Join Requests
                </h4>
                <ul className="text-blue-700 space-y-1 text-sm">
                  <li>• Users can request to join your private group</li>
                  <li>• You can approve or reject each request</li>
                  <li>• Approved users will be added as members</li>
                  <li>• Rejected users can request again later</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageRequests; 