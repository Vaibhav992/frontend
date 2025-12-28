import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, assignmentsRes] = await Promise.all([
        api.get('/stats/overview'),
        api.get('/assignments')
      ]);
      setStats(statsRes.data.stats);
      setAssignments(assignmentsRes.data.assignments);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <Link
            to="/assignments/new"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            + Create Assignment
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Assignments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalAssignments || 0}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalStudents || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Submissions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalSubmissions || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions per Assignment */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Submissions by Assignment</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.submissionsPerAssignment?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                        {item.submission_count} students
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/assignments/${item.id}/submissions`}
                        className="text-primary-600 hover:text-primary-900 font-medium"
                      >
                        View Submissions
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!stats?.submissionsPerAssignment || stats.submissionsPerAssignment.length === 0) && (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                      No assignments yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Assignments */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Assignments</h2>
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const deadline = new Date(assignment.deadline);
              const isOverdue = new Date() > deadline;
              
              return (
                <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{assignment.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{assignment.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs text-gray-500">
                          Deadline: {deadline.toLocaleString()}
                        </p>
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-semibold">
                          {assignment.submission_count || 0} submissions
                        </span>
                        {isOverdue && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link
                        to={`/assignments/${assignment.id}`}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                      >
                        View
                      </Link>
                      <Link
                        to={`/assignments/${assignment.id}/edit`}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this assignment?')) {
                            try {
                              await api.delete(`/assignments/${assignment.id}`);
                              toast.success('Assignment deleted successfully');
                              fetchData();
                            } catch (error) {
                              toast.error('Failed to delete assignment');
                            }
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {assignments.length === 0 && (
              <p className="text-center text-gray-500 py-8">No assignments created yet</p>
            )}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Submissions</h2>
          <div className="space-y-4">
            {stats?.recentSubmissions?.map((submission) => (
              <div key={submission.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{submission.student_name}</p>
                    <p className="text-sm text-gray-600">{submission.assignment_title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted: {new Date(submission.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {submission.grade !== null ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        Grade: {submission.grade}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {(!stats?.recentSubmissions || stats.recentSubmissions.length === 0) && (
              <p className="text-center text-gray-500">No submissions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

