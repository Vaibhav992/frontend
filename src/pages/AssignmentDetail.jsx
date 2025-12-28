import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AssignmentDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [assignmentRes, submissionsRes] = await Promise.all([
        api.get(`/assignments/${id}`),
        user.role === 'student' ? api.get('/my-submissions') : Promise.resolve({ data: { submissions: [] } })
      ]);
      
      setAssignment(assignmentRes.data.assignment);
      
      if (user.role === 'student') {
        const mySubmission = submissionsRes.data.submissions.find(s => s.assignment_id === parseInt(id));
        setSubmission(mySubmission);
        if (mySubmission) {
          setFileUrl(mySubmission.file_url);
        }
      }
    } catch (error) {
      toast.error('Failed to load assignment');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post(`/submit/${id}`, { fileUrl });
      toast.success('Assignment submitted successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!assignment) return null;

  const deadline = new Date(assignment.deadline);
  const isOverdue = new Date() > deadline;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
            <p className="text-gray-600">{assignment.description}</p>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Deadline</p>
                <p className="text-lg font-semibold text-gray-900">
                  {deadline.toLocaleString()}
                </p>
                {isOverdue && (
                  <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                    Overdue
                  </span>
                )}
              </div>
              {user.role === 'admin' && (
                <div>
                  <p className="text-sm text-gray-500">Submissions</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {assignment.submission_count || 0} students
                  </p>
                </div>
              )}
            </div>
          </div>

          {user.role === 'student' && (
            <div className="border-t border-gray-200 pt-6">
              {submission ? (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Submission</h2>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">Submitted on:</p>
                    <p className="font-semibold">{new Date(submission.submitted_at).toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-4 mb-2">File URL:</p>
                    <a href={submission.file_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      {submission.file_url}
                    </a>
                    {submission.grade !== null && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Grade:</p>
                        <p className="text-2xl font-bold text-primary-600">{submission.grade}/100</p>
                        {submission.feedback && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">Feedback:</p>
                            <p className="text-gray-900">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {!isOverdue && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Update File URL
                        </label>
                        <input
                          type="url"
                          required
                          value={fileUrl}
                          onChange={(e) => setFileUrl(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                          placeholder="https://example.com/file.pdf"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
                      >
                        {submitting ? 'Updating...' : 'Update Submission'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">Submit Assignment</h2>
                  {isOverdue && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-red-800 font-semibold">This assignment is overdue. Late submissions may not be accepted.</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File URL
                    </label>
                    <input
                      type="url"
                      required
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="https://example.com/file.pdf"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Upload your file to a cloud service (Google Drive, Dropbox, etc.) and paste the shareable link here
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Assignment'}
                  </button>
                </form>
              )}
            </div>
          )}

          {user.role === 'admin' && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex space-x-4">
                <Link
                  to={`/assignments/${id}/edit`}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
                >
                  Edit Assignment
                </Link>
                <Link
                  to={`/assignments/${id}/submissions`}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  View Submissions ({assignment.submission_count || 0})
                </Link>
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this assignment? This will also delete all submissions.')) {
                      try {
                        await api.delete(`/assignments/${id}`);
                        toast.success('Assignment deleted successfully');
                        navigate('/');
                      } catch (error) {
                        toast.error('Failed to delete assignment');
                      }
                    }
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Delete Assignment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetail;

