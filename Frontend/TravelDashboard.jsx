import React, { useState, useEffect } from 'react';
import './TravelDashboard.css';
import { api } from './api/client';

const TravelDashboard = ({ currentUserEmail, onOpenChat }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('explore');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({
    origin: '',
    destination: '',
    departureTime: '',
    femaleOnly: false,
  });

  const [pendingByPostId, setPendingByPostId] = useState({});
  const [myOutgoingRequests, setMyOutgoingRequests] = useState([]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/v1/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get('/api/v1/requests/pending');
      if (response.ok) {
        const data = await response.json();
        const grouped = {};
        data.forEach((req) => {
          if (!grouped[req.postId]) grouped[req.postId] = [];
          grouped[req.postId].push(req);
        });
        setPendingByPostId(grouped);
      }
    } catch (error) {
      console.error('Error fetching incoming requests:', error);
    }
  };

  const fetchMyOutgoingRequests = async () => {
    try {
      const response = await api.get('/api/v1/requests/my-requests');
      if (response.ok) {
        const data = await response.json();
        setMyOutgoingRequests(data);
      }
    } catch (error) {
      console.error('Error fetching outgoing requests:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchPendingRequests();
    fetchMyOutgoingRequests();

    const interval = setInterval(() => {
      fetchPendingRequests();
      fetchMyOutgoingRequests();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/v1/posts', newPost);
      if (response.ok) {
        setShowCreateForm(false);
        setNewPost({ origin: '', destination: '', departureTime: '', femaleOnly: false });
        fetchPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleExpressInterest = async (postId) => {
    try {
      const response = await api.post(`/api/v1/requests/post/${postId}`);
      if (response.ok) {
        fetchMyOutgoingRequests();
      } else if (response.status === 409) {
        alert('You have already expressed interest in this trip.');
      }
    } catch (error) {
      console.error('Error expressing interest:', error);
    }
  };

  const handleUpdateStatus = async (requestId, nextStatus) => {
    const endpoint = nextStatus === 'ACCEPTED' ? 'accept' : 'reject';
    try {
      const response = await api.post(`/api/v1/requests/${requestId}/${endpoint}`);
      if (response.ok) {
        fetchPendingRequests();
        fetchPosts();
      }
    } catch (error) {
      console.error(`Error processing ${nextStatus}:`, error);
    }
  };

  return (
    <div className="dashboard-container container-fluid py-4">

      <div className="row justify-content-center mb-4">
        <div className="col-md-8 text-center">
          <h1 className="display-5 fw-bold hero-title">WanderSync Dashboard</h1>
          <p className="text-muted lead hero-subtitle">
            Manage journeys, coordinate matches, and chat.
          </p>
          <div className="btn-group mt-3 p-1 bg-white rounded-pill shadow-sm" role="group">
            <button
              className={`btn rounded-pill px-4 fw-bold ${activeTab === 'explore' ? 'btn-primary' : 'btn-light'}`}
              onClick={() => setActiveTab('explore')}
            >
              <i className="bi bi-compass me-2"></i>Explore Trips
            </button>
            <button
              className={`btn rounded-pill px-4 fw-bold ${activeTab === 'my-requests' ? 'btn-primary' : 'btn-light'}`}
              onClick={() => setActiveTab('my-requests')}
            >
              <i className="bi bi-send me-2"></i>My Sent Requests ({myOutgoingRequests.length})
            </button>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center gap-2 mb-4">
        {['ALL', 'INTERESTED', 'ACCEPTED', 'REJECTED'].map((filter) => (
          <button
            key={filter}
            className={`btn btn-sm px-3 rounded-pill fw-semibold ${
              statusFilter === filter ? 'btn-dark' : 'btn-outline-secondary'
            }`}
            onClick={() => setStatusFilter(filter)}
          >
            {filter === 'INTERESTED'
              ? 'Interested/Pending'
              : filter.charAt(0) + filter.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {activeTab === 'explore' && (
        <div className="text-center mb-4">
          <button
            className="btn btn-outline-primary rounded-pill px-4 fw-bold"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Close Form' : '+ Post a New Journey'}
          </button>
        </div>
      )}

      {showCreateForm && activeTab === 'explore' && (
        <div className="row justify-content-center mb-5 slide-in">
          <div className="col-md-6">
            <div className="card shadow-sm border-0 rounded-4 p-4">
              <h4 className="fw-bold mb-4">Post a New Trip</h4>
              <form onSubmit={handleCreatePost}>
                <div className="row g-3">
                  <div className="col-md-6 form-floating">
                    <input
                      type="text" className="form-control" id="origin"
                      required placeholder="Origin" value={newPost.origin}
                      onChange={(e) => setNewPost({ ...newPost, origin: e.target.value })}
                    />
                    <label htmlFor="origin" className="ms-2">Origin</label>
                  </div>
                  <div className="col-md-6 form-floating">
                    <input
                      type="text" className="form-control" id="dest"
                      required placeholder="Destination" value={newPost.destination}
                      onChange={(e) => setNewPost({ ...newPost, destination: e.target.value })}
                    />
                    <label htmlFor="dest" className="ms-2">Destination</label>
                  </div>
                  <div className="col-md-12 form-floating">
                    <input
                      type="datetime-local" className="form-control" id="time"
                      required value={newPost.departureTime}
                      onChange={(e) => setNewPost({ ...newPost, departureTime: e.target.value })}
                    />
                    <label htmlFor="time" className="ms-2">Departure Time</label>
                  </div>
                  <div className="col-md-12 mt-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input" type="checkbox" id="femaleOnly"
                        checked={newPost.femaleOnly}
                        onChange={(e) => setNewPost({ ...newPost, femaleOnly: e.target.checked })}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="femaleOnly">
                        Female Only Travel
                      </label>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 py-3 rounded-3 mt-4 fw-bold">
                    Post Trip
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4 justify-content-center">

          {activeTab === 'explore' &&
            posts.map((post) => {
              const isMyPost =
                post.posterName?.trim().toLowerCase() ===
                currentUserEmail?.trim().toLowerCase();
              const rawRequests = pendingByPostId[post.id] || [];
              const incomingRequests = rawRequests.filter(
                (r) => statusFilter === 'ALL' || r.status === statusFilter
              );
              const hasMatchingRequests = incomingRequests.length > 0;

              if (statusFilter !== 'ALL' && isMyPost && !hasMatchingRequests) return null;
              if (statusFilter !== 'ALL' && !isMyPost) return null;

              return (
                <div className="col-12 col-md-6 col-lg-4 d-flex align-items-stretch" key={post.id}>
                  <div className="card w-100 border-0 travel-card shadow-sm">
                    <div className="card-body d-flex flex-column p-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold">
                          {isMyPost ? 'My Created Journey' : 'Open Journey'}
                        </span>
                        <span className="text-muted small">
                          {new Date(post.departureTime).toLocaleString([], {
                            dateStyle: 'short', timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      <h4 className="fw-bold mb-1">{post.origin}</h4>
                      <div className="route-divider my-2">
                        <span className="dots"></span>
                        <i className="bi bi-airplane text-primary airplane-icon"></i>
                      </div>
                      <h4 className="fw-bold mb-4">{post.destination}</h4>

                      <div className="mt-auto d-flex justify-content-between align-items-center pt-3 border-top">
                        <span className="text-secondary small">
                          by {isMyPost ? 'You' : post.posterName}
                        </span>
                        {!isMyPost && (
                          <button
                            className="btn btn-dark rounded-pill px-4 request-btn"
                            onClick={(e) => { e.stopPropagation(); handleExpressInterest(post.id); }}
                          >
                            Connect
                          </button>
                        )}
                      </div>

                      {isMyPost && rawRequests.length > 0 && (
                        <div className="mt-3 pt-3 border-top" onClick={(e) => e.stopPropagation()}>
                          <p className="small fw-bold text-muted mb-2">User Interactions</p>
                          {incomingRequests.map((req) => (
                            <div key={req.id} className="pending-request-row d-flex flex-column mb-2 p-2 rounded-3">
                              <div className="d-flex justify-content-between align-items-center w-100">
                                <span className="small fw-semibold text-dark">{req.requesterName}</span>
                                <span className={`badge rounded-pill small ${
                                  req.status === 'ACCEPTED' ? 'bg-success' :
                                  req.status === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'
                                }`}>
                                  {req.status}
                                </span>
                              </div>
                              <div className="d-flex gap-2 mt-2 justify-content-end">
                                {(req.status === 'INTERESTED' || req.status === 'PENDING' || req.status === 'ACCEPTED') && (
                                  <button
                                    className="btn btn-primary btn-sm rounded-pill px-3"
                                    onClick={() => onOpenChat(req.id)}
                                  >
                                    <i className="bi bi-chat-dots-fill me-1"></i>Chat / Discuss
                                  </button>
                                )}
                                {req.status === 'INTERESTED' && (
                                  <>
                                    <button className="btn btn-success btn-sm rounded-pill"
                                      onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')}>
                                      Match
                                    </button>
                                    <button className="btn btn-outline-danger btn-sm rounded-pill"
                                      onClick={() => handleUpdateStatus(req.id, 'REJECTED')}>
                                      Pass
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          {activeTab === 'my-requests' &&
            myOutgoingRequests
              .filter((req) => statusFilter === 'ALL' || req.status === statusFilter)
              .map((req) => (
                <div className="col-12 col-md-6 col-lg-4 d-flex align-items-stretch" key={req.id}>
                  <div className="card w-100 border-0 travel-card shadow-sm">
                    <div className="card-body d-flex flex-column p-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className={`badge rounded-pill px-3 py-2 fw-bold ${
                          req.status === 'ACCEPTED' ? 'bg-success bg-opacity-10 text-success' :
                          req.status === 'REJECTED' ? 'bg-danger bg-opacity-10 text-danger' :
                          'bg-warning bg-opacity-10 text-dark'
                        }`}>
                          Status: {req.status}
                        </span>
                      </div>
                      <h5 className="text-muted small mb-1">Route Context</h5>
                      <p className="fw-bold mb-1">
                        {req.postOrigin}
                        <i className="bi bi-arrow-right text-muted mx-2"></i>
                        {req.postDestination}
                      </p>
                      <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                        <span className="small text-muted">Request ID: #{req.id}</span>
                        {(req.status === 'ACCEPTED' || req.status === 'INTERESTED' || req.status === 'PENDING') && (
                          <button
                            className="btn btn-primary rounded-pill btn-sm px-3 fw-bold"
                            onClick={(e) => { e.stopPropagation(); onOpenChat(req.id); }}
                          >
                            <i className="bi bi-chat-dots-fill me-1"></i> Open Chat
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

          {((activeTab === 'explore' && posts.length === 0) ||
            (activeTab === 'my-requests' && myOutgoingRequests.length === 0)) && (
            <div className="text-center mt-5 text-muted">
              <i className="bi bi-folder-x display-2 opacity-25"></i>
              <h4 className="mt-3">No match profiles found</h4>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TravelDashboard;