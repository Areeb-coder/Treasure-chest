"use client";

import { useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<{ visitors: any[], stats: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchAdminData = async (pass: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        headers: { "Authorization": `Bearer ${pass}` }
      });
      if (!res.ok) throw new Error("Unauthorized");
      const json = await res.json();
      setData(json);
      setIsAuthenticated(true);
    } catch (err) {
      alert("Invalid password or failed to fetch.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdminData(password);
  };

  const toggleRedeem = async (visitorId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/redeem", {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${password}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ visitorId, rewardRedeemed: !currentStatus })
      });
      if (res.ok) {
        fetchAdminData(password); // Refresh data
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-[family-name:var(--font-outfit)]">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Admin Area</h1>
          <p className="text-gray-500 mb-6 text-sm">Enter password to view visitor analytics.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-6 bg-gray-50 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
            placeholder="Enter password..."
          />
          <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-blue-700 transition-all">
            {loading ? "Checking..." : "Login"}
          </button>
        </form>
      </div>
    );
  }

  const filteredVisitors = data?.visitors.filter(v => 
    v.fullName.toLowerCase().includes(search.toLowerCase()) || 
    v.phoneNumber.includes(search) || 
    (v.rewardId && v.rewardId.includes(search))
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-[family-name:var(--font-outfit)]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mystery Treasure Admin</h1>
            <p className="text-gray-500">Live analytics and visitor logs.</p>
          </div>
          <button onClick={() => window.location.reload()} className="px-5 py-2 bg-white border border-gray-200 shadow-sm rounded-xl hover:bg-gray-50 font-medium">
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10" />
            <h2 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider relative z-10">Total Visitors</h2>
            <p className="text-5xl font-black text-blue-600 relative z-10">{data?.stats?.totalVisitors || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="absolute right-0 top-0 w-32 h-32 bg-green-50 rounded-full blur-2xl -mr-10 -mt-10" />
            <h2 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider relative z-10">Golden Tickets Awarded</h2>
            <p className="text-5xl font-black text-green-600 relative z-10">{data?.stats?.winningRewardsIssued || 0} <span className="text-xl text-gray-400">/ 4</span></p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <input
              type="text"
              placeholder="Search by name, phone, or reward ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 transition-all bg-white"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-500 font-semibold border-b border-gray-100 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Visitor #</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Reward</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredVisitors.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono">#{v.visitorNumber}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{v.fullName}</td>
                    <td className="px-6 py-4 text-gray-600">{v.phoneNumber}</td>
                    <td className="px-6 py-4 max-w-[200px] truncate">
                      {v.rewardId ? (
                        <div className="text-green-600 font-bold">
                          {v.reward}
                          <br />
                          <span className="text-xs text-green-800 bg-green-100 px-2 py-1 rounded mt-1 inline-block border border-green-200">{v.rewardId}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500" title={v.reward}>{v.reward || 'Pending...'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {v.createdAt && !isNaN(new Date(v.createdAt).getTime()) 
                        ? new Date(v.createdAt).toLocaleString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          }) 
                        : "Invalid Date"}
                    </td>
                    <td className="px-6 py-4">
                      {v.rewardId && (
                        <button
                          onClick={() => toggleRedeem(v._id, v.rewardRedeemed)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            v.rewardRedeemed 
                              ? 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200' 
                              : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 shadow-sm'
                          }`}
                        >
                          {v.rewardRedeemed ? 'Redeemed' : 'Mark Redeemed'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredVisitors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 bg-gray-50">
                      No visitors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
