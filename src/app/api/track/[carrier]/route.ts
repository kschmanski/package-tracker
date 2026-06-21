import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { trackFedExBatch, normalizeFedExEvents } from "@/lib/carriers/fedex";
import { prisma } from "@/lib/db/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ carrier: string }> },
) {
  const { carrier } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { packageId } = await req.json();

  const pkg = await prisma.package.findFirst({
    where: { id: packageId, userId: session.user.id },
  });

  if (!pkg) {
    return Response.json({ error: "Package not found" }, { status: 404 });
  }

  try {
    let events: any[] = [];

    switch (carrier.toUpperCase()) {
      case "FEDEX": {
        const raw = await trackFedExBatch([pkg.trackingNumber]);
        events = normalizeFedExEvents(raw, pkg.trackingNumber);
        break;
      }
      default:
        return Response.json({ error: "Unknown carrier" }, { status: 400 });
    }

    await prisma.$transaction(
      events.map((event) =>
        prisma.trackingEvent.upsert({
          where: {
            packageId_timestamp_status: {
              packageId: pkg.id,
              timestamp: event.timestamp,
              status: event.status,
            },
          },
          update: {},
          create: { packageId: pkg.id, ...event },
        }),
      ),
    );

    const isDelivered =
      events[0]?.status === "Delivered" ||
      events[0]?.description?.toLowerCase().includes("delivered");

    await prisma.package.update({
      where: { id: pkg.id },
      data: { lastChecked: new Date(), delivered: isDelivered },
    });

    const updatedEvents = await prisma.trackingEvent.findMany({
      where: { packageId: pkg.id },
      orderBy: { timestamp: "desc" },
    });

    return Response.json({ events: updatedEvents });
  } catch (err) {
    console.error(`Tracking error for ${carrier}:`, err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
