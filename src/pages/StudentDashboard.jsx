import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, submissionsRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/my-submissions')
      ]);
      setAssignments(assignmentsRes.data.assignments);
      setMySubmissions(submissionsRes.data.submissions);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionStatus = (assignmentId) => {
    const submission = mySubmissions.find(s => s.assignment_id === assignmentId);
    if (!submission) return { status: 'not_submitted', submission: null };
    
    const deadline = new Date(submission.assignment_deadline);
    const now = new Date();
    
    if (now > deadline) {
      return { status: 'late', submission };
    }
    return { status: 'submitted', submission };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Assignments</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assignments List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Assignments</h2>
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const { status, submission } = getSubmissionStatus(assignment.id);
                const deadline = new Date(assignment.deadline);
                const isOverdue = new Date() > deadline;

                return (
                  <div
                    key={assignment.id}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
                        <p className="text-gray-600 mt-1">{assignment.description}</p>
                      </div>
                      <div className="text-right">
                        {status === 'submitted' && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                            Submitted
                          </span>
                        )}
                        {status === 'late' && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                            Late
                          </span>
                        )}
                        {status === 'not_submitted' && !isOverdue && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                            Pending
                          </span>
                        )}
                        {status === 'not_submitted' && isOverdue && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">
                          Deadline: {deadline.toLocaleString()}
                        </p>
                        {submission && submission.grade !== null && submission.grade !== undefined && (
                          <p className="text-sm font-semibold text-primary-600 mt-1">
                            Grade: {submission.grade}/100
                          </p>
                        )}
                      </div>
                      <Link
                        to={`/assignments/${assignment.id}`}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium inline-block"
                      >
                        {status === 'submitted' ? 'View Submission' : 'Submit Assignment'}
                      </Link>
                    </div>
                  </div>
                );
              })}
              {assignments.length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <p className="text-gray-500">No assignments available</p>
                </div>
              )}
            </div>
          </div>

          {/* My Submissions Sidebar */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Submissions</h2>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="space-y-4">
                {mySubmissions.map((submission) => (
                  <div key={submission.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <p className="font-semibold text-gray-900">{submission.assignment_title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                    {submission.grade !== null ? (
                      <div className="mt-2">
                        <span className="text-sm font-semibold text-primary-600">
                          Grade: {submission.grade}/100
                        </span>
                        {submission.feedback && (
                          <p className="text-sm text-gray-600 mt-1">{submission.feedback}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-yellow-600 mt-2 inline-block">Pending review</span>
                    )}
                  </div>
                ))}
                {mySubmissions.length === 0 && (
                  <p className="text-center text-gray-500">No submissions yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

