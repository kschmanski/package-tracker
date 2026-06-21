import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db/prisma";
import { detectCarrier } from "@/lib/carriers/detect";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // get all packages for this user
  const packages = await prisma.package.findMany({
    where: { userId: session.user.id },
    // include the most recent event for each package
    include: {
      events: {
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(packages);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { trackingNumber, label, carrier: carrierOverride } = await req.json();

  if (!trackingNumber) {
    return Response.json(
      { error: "trackingNumber is required" },
      { status: 400 },
    );
  }

  // Get the carrier associated with the tracking number
  const carrier = carrierOverride ?? detectCarrier(trackingNumber);

  if (!carrier) {
    return Response.json(
      { error: "Could not detect carrier. Please specify manually." },
      { status: 400 },
    );
  }

  // create the package in the db
  const pkg = await prisma.package.create({
    data: {
      userId: session.user.id,
      trackingNumber: trackingNumber.trim().toUpperCase(),
      carrier,
      label: label ?? null,
    },
  });

  return Response.json(pkg, { status: 201 });
}
