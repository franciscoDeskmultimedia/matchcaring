import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllCandidates, getAllUsers, getAdCampaigns, getNannyTalentPool } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    // For demo convenience, allow access if user is usr_parent_demo
    if (user?.id !== "usr_parent_demo" && user?.email !== "parent@example.com") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }
  }

  const [users, candidates, talentPool, adCampaigns] = await Promise.all([
    getAllUsers(),
    getAllCandidates(),
    getNannyTalentPool(),
    getAdCampaigns(),
  ]);

  const completed = candidates.filter((c) => c.status === "completed" && c.result);
  const totalImpressions = adCampaigns.reduce((acc, a) => acc + (a.impressions || 0), 0);
  const totalClicks = adCampaigns.reduce((acc, a) => acc + (a.clicks || 0), 0);
  const averageCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0.0";

  return NextResponse.json({
    metrics: {
      totalUsers: users.length,
      totalCandidates: candidates.length,
      completedAssessments: completed.length,
      talentPoolCount: talentPool.length,
      totalAdImpressions: totalImpressions,
      totalAdClicks: totalClicks,
      averageCTR: `${averageCTR}%`,
    },
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role || "parent",
      childrenCount: u.children?.length || (u.childProfile ? 1 : 0),
      childrenNames: u.children?.map((c) => `${c.name} (${c.age}a)`).join(", ") || u.childProfile?.name || "None",
      createdAt: u.createdAt,
      campaignsCreated: candidates.filter((c) => c.userId === u.id).length,
    })),
    adCampaigns,
  });
}
