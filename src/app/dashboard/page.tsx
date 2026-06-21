import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import AddPackageForm from "@/components/AddPackageForm";
import PackageCard from "@/components/PackageCard";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const packages = await prisma.package.findMany({
    where: { userId: session.user.id },
    include: {
      events: {
        orderBy: { timestamp: "desc" },
        take: 10,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Packages</h1>
        <span className="text-sm text-gray-500">{session.user.email}</span>
      </div>

      <AddPackageForm />

      {packages.length === 0 ? (
        <p className="text-gray-500 text-sm">No packages yet. Add one above.</p>
      ) : (
        <ul className="space-y-3">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </ul>
      )}
    </main>
  );
}
