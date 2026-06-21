import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pkg = await prisma.package.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!pkg) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.package.delete({ where: { id: params.id } });
  return Response.json({ deleted: true });
}
