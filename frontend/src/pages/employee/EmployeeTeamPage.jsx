import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { getEmployees } from "../../api/user.api";
import { CardSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate } from "../../utils/formatDate";

export default function EmployeeTeamPage() {
  const { user } = useAuth();
  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await getEmployees();
      setTeammates(res.data?.data?.employees || []);
    } catch (err) {
      console.error("Failed to load teammates:", err);
      toast.error("Department team load nahi ho saki");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const filteredTeammates = teammates.filter((t) => {
    const q = search.toLowerCase();
    const nameMatch = t.name?.toLowerCase().includes(q);
    const emailMatch = t.email?.toLowerCase().includes(q);
    const roleMatch = t.designation?.toLowerCase().includes(q);
    const skillMatch = t.skills?.some((s) => s.toLowerCase().includes(q));
    return nameMatch || emailMatch || roleMatch || skillMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {user?.department?.name || "Department"} Team Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Connect with your colleagues, view skill sets, and collaborate across workflows.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, or skill..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* Team Roster Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton count={6} />
        </div>
      ) : filteredTeammates.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No teammates found"
          message={
            search
              ? "Aapke search query ke according koi team member match nahi hua."
              : "Is department mein abhi koi aur active team member nahi hai."
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeammates.map((member) => {
            const isSelf = member._id === user?._id;

            return (
              <div
                key={member._id}
                className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                        {member.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-slate-900 text-sm">
                            {member.name}
                          </h3>
                          {isSelf && (
                            <span className="px-1.5 py-0.5 rounded-md bg-brand-100 text-brand-700 text-[10px] font-extrabold">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {member.designation || "Team Member"}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 my-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-400">✉️</span>
                      <a href={`mailto:${member.email}`} className="hover:text-brand-600 transition-colors truncate">
                        {member.email}
                      </a>
                    </div>
                    {member.department?.name && (
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-400">🏢</span>
                        <span>{member.department.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills tags */}
                  {member.skills && member.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {member.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-indigo-50/80 text-brand-700 font-bold text-[10px]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Joined: {formatDate(member.joinedAt || member.createdAt)}</span>
                  <span className="capitalize font-semibold text-slate-600">{member.role}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
