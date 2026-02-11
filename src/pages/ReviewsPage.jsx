import React, { useState, useEffect } from 'react';
import { Search, Star, Trash2, Eye, Filter, AlertCircle, User, Calendar, MapPin } from 'lucide-react';
import axios from 'axios';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    fiveStar: 0,
    fourStar: 0,
    threeStar: 0,
    twoStar: 0,
    oneStar: 0,
  });

  useEffect(() => {
    fetchReviews();
  }, [searchTerm]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reviews', {
        params: { search: searchTerm, limit: 100 },
      });
      const reviewsData = response.data.data.reviews || [];
      setReviews(reviewsData);
      calculateStats(reviewsData);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData) => {
    if (reviewsData.length === 0) {
      setStats({
        total: 0,
        averageRating: 0,
        fiveStar: 0,
        fourStar: 0,
        threeStar: 0,
        twoStar: 0,
        oneStar: 0,
      });
      return;
    }

    const total = reviewsData.length;
    const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = (sum / total).toFixed(1);

    const fiveStar = reviewsData.filter(r => r.rating === 5).length;
    const fourStar = reviewsData.filter(r => r.rating === 4).length;
    const threeStar = reviewsData.filter(r => r.rating === 3).length;
    const twoStar = reviewsData.filter(r => r.rating === 2).length;
    const oneStar = reviewsData.filter(r => r.rating === 1).length;

    setStats({
      total,
      averageRating,
      fiveStar,
      fourStar,
      threeStar,
      twoStar,
      oneStar,
    });
  };

  const handleViewDetails = async (review) => {
    try {
      const response = await axios.get(`/api/reviews/${review.id}`);
      setSelectedReview(response.data.data.review);
      setShowDetailModal(true);
    } catch (error) {
      alert('Failed to load review details');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await axios.delete(`/api/reviews/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      fetchReviews();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingPercentage = (count) => {
    if (stats.total === 0) return 0;
    return Math.round((count / stats.total) * 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reviews Management</h1>
        <p className="text-gray-600">View and moderate customer reviews</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Star className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
            </div>
            <div className="flex items-center gap-1">
              {renderStars(Math.round(stats.averageRating))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-2">Rating Distribution</p>
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats[`${['', 'one', 'two', 'three', 'four', 'five'][star]}Star`];
              const percentage = getRatingPercentage(count);
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-8">{star}★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-gray-600">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search reviews by activity, user, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No reviews found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {review.user_picture ? (
                          <img
                            src={review.user_picture}
                            alt={review.user_name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {review.user_name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500">{review.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 max-w-xs truncate">
                        {review.activity_title}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm font-medium text-gray-900">
                          {review.rating}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        {review.title && (
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {review.title}
                          </p>
                        )}
                        {review.comment && (
                          <p className="text-sm text-gray-600 truncate">{review.comment}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(review.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {review.is_verified ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(review)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(review)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReview && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedReview(null);
          }}
          title="Review Details"
        >
          <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-3 pb-4 border-b">
              {selectedReview.user_picture ? (
                <img
                  src={selectedReview.user_picture}
                  alt={selectedReview.user_name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{selectedReview.user_name}</p>
                <p className="text-sm text-gray-500">{selectedReview.user_email}</p>
              </div>
            </div>

            {/* Activity Info */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Activity</p>
              <p className="text-gray-900">{selectedReview.activity_title}</p>
            </div>

            {/* Rating */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Rating</p>
              <div className="flex items-center gap-2">
                {renderStars(selectedReview.rating)}
                <span className="font-medium text-gray-900">{selectedReview.rating} / 5</span>
              </div>
            </div>

            {/* Title */}
            {selectedReview.title && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Title</p>
                <p className="text-gray-900">{selectedReview.title}</p>
              </div>
            )}

            {/* Comment */}
            {selectedReview.comment && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Comment</p>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedReview.comment}</p>
              </div>
            )}

            {/* Photos */}
            {selectedReview.photos && selectedReview.photos.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Photos</p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedReview.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Review photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Date Submitted</p>
                  <p className="text-gray-900">{formatDate(selectedReview.created_at)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Helpful Votes</p>
                  <p className="text-gray-900">{selectedReview.helpful_votes || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="text-gray-900">
                    {selectedReview.is_verified ? (
                      <span className="text-green-600">Verified Purchase</span>
                    ) : (
                      <span className="text-gray-600">Unverified</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDelete}
          title="Delete Review"
          message={`Are you sure you want to delete this review by ${deleteConfirm.user_name}? This action cannot be undone.`}
          confirmText="Delete"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
        />
      )}
    </div>
  );
};

export default ReviewsPage;
